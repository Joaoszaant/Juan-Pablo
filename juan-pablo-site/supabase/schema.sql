-- =====================================================================
-- THE LAST DANCE · Juan Pablo — banco de ingressos (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma única vez).
--
-- Segurança: as tabelas ficam fechadas para o público (RLS sem políticas).
-- O site só acessa o banco pelas funções abaixo, que nunca devolvem
-- e-mail ou telefone dos compradores. A view `ocupacao` (quem está em cada
-- lugar, com contatos) só aparece para você no painel do Supabase.
-- =====================================================================

-- ---------- Tabelas ----------
create table if not exists public.orders (
  id           text primary key,
  buyer_name   text not null check (char_length(buyer_name) between 3 and 120),
  buyer_email  text not null check (buyer_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  buyer_phone  text not null check (char_length(regexp_replace(buyer_phone, '\D', '', 'g')) between 10 and 11),
  cpf_masked   text check (cpf_masked is null or cpf_masked ~ '^\*\*\*\.\*\*\*\.[0-9]{3}-[0-9]{2}$'),
  total_cents  integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.tickets (
  id           text primary key,
  order_id     text not null references public.orders(id) on delete cascade,
  seat_id      text not null check (seat_id ~ '^[A-Z][0-9]{1,2}$'),
  holder_name  text not null check (char_length(holder_name) between 3 and 120),
  price_cents  integer not null default 0,
  status       text not null default 'valid' check (status in ('valid', 'cancelled')),
  created_at   timestamptz not null default now()
);

-- Garantia final contra venda duplicada: só um ingresso válido por assento.
create unique index if not exists tickets_one_valid_per_seat on public.tickets (seat_id) where status = 'valid';
create index if not exists tickets_order_idx on public.tickets (order_id);

-- Reservas temporárias durante o checkout ("em processo de compra").
create table if not exists public.seat_holds (
  seat_id     text primary key,
  session_id  uuid not null,
  expires_at  timestamptz not null
);
create index if not exists seat_holds_session_idx on public.seat_holds (session_id);

alter table public.orders     enable row level security;
alter table public.tickets    enable row level security;
alter table public.seat_holds enable row level security;
revoke all on public.orders, public.tickets, public.seat_holds from anon, authenticated;

-- ---------- Quem está em cada lugar (somente painel/admin) ----------
create or replace view public.ocupacao with (security_invoker = true) as
  select t.seat_id      as assento,
         t.holder_name  as nome_no_ingresso,
         o.buyer_name   as comprador,
         o.buyer_email  as email,
         o.buyer_phone  as telefone,
         t.id           as ingresso,
         o.id           as pedido,
         t.created_at   as emitido_em
    from public.tickets t
    join public.orders o on o.id = t.order_id
   where t.status = 'valid'
   order by substring(t.seat_id from 1 for 1), substring(t.seat_id from 2)::int;
revoke all on public.ocupacao from anon, authenticated;

-- ---------- Funções internas ----------
create or replace function public._gen_code(p_prefix text)
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  code text;
begin
  loop
    code := p_prefix || '-';
    for i in 1..8 loop
      if i = 5 then code := code || '-'; end if;
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from tickets where id = code)
          and not exists (select 1 from orders where id = code);
  end loop;
  return code;
end $$;

create or replace function public._ticket_json(t public.tickets)
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'orderId', t.order_id, 'seatId', t.seat_id, 'holderName', t.holder_name,
    'priceCents', t.price_cents, 'status', t.status, 'createdAt', t.created_at)
$$;

-- ---------- API pública (chamada pelo site) ----------

-- Estado de cada assento não disponível: 'occupied', 'held' ou 'held_mine'.
create or replace function public.get_seat_map(p_session uuid)
returns table (seat_id text, state text, expires_at timestamptz)
language sql stable security definer set search_path = public as $$
  select t.seat_id, 'occupied', null::timestamptz from tickets t where t.status = 'valid'
  union all
  select h.seat_id, case when h.session_id = p_session then 'held_mine' else 'held' end, h.expires_at
    from seat_holds h
   where h.expires_at > now()
     and not exists (select 1 from tickets t where t.seat_id = h.seat_id and t.status = 'valid')
$$;

create or replace function public.hold_seats(p_session uuid, p_seats text[], p_minutes int default 10)
returns timestamptz language plpgsql volatile security definer set search_path = public as $$
declare
  v_expires timestamptz := now() + make_interval(mins => least(greatest(coalesce(p_minutes, 10), 1), 30));
  v_conflicts text[];
begin
  if p_seats is null or cardinality(p_seats) = 0 then raise exception 'EMPTY'; end if;
  if cardinality(p_seats) > 8 then raise exception 'LIMIT_EXCEEDED'; end if;

  perform pg_advisory_xact_lock(hashtext('jp-seats'));
  delete from seat_holds where seat_holds.expires_at <= now();

  select array_agg(s order by s) into v_conflicts
    from unnest(p_seats) s
   where exists (select 1 from tickets t where t.seat_id = s and t.status = 'valid')
      or exists (select 1 from seat_holds h where h.seat_id = s and h.session_id <> p_session);
  if v_conflicts is not null then
    raise exception 'SEAT_UNAVAILABLE' using detail = array_to_string(v_conflicts, ',');
  end if;

  delete from seat_holds where session_id = p_session;
  insert into seat_holds (seat_id, session_id, expires_at)
    select distinct s, p_session, v_expires from unnest(p_seats) s;
  return v_expires;
end $$;

create or replace function public.release_hold(p_session uuid)
returns void language sql volatile security definer set search_path = public as $$
  delete from seat_holds where session_id = p_session
$$;

create or replace function public.purchase(
  p_session uuid, p_seats text[], p_buyer jsonb, p_holders jsonb default '{}'::jsonb, p_price_cents int default 0)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_taken   text[];
  v_missing text[];
  v_order   orders;
  v_tickets jsonb := '[]'::jsonb;
  v_ticket  tickets;
  s text;
begin
  if p_seats is null or cardinality(p_seats) = 0 then raise exception 'EMPTY'; end if;
  if cardinality(p_seats) > 8 then raise exception 'LIMIT_EXCEEDED'; end if;

  perform pg_advisory_xact_lock(hashtext('jp-seats'));

  select array_agg(x order by x) into v_taken from unnest(p_seats) x
   where exists (select 1 from tickets t where t.seat_id = x and t.status = 'valid');
  if v_taken is not null then
    raise exception 'SEAT_UNAVAILABLE' using detail = array_to_string(v_taken, ',');
  end if;

  select array_agg(x order by x) into v_missing from unnest(p_seats) x
   where not exists (select 1 from seat_holds h
                      where h.seat_id = x and h.session_id = p_session and h.expires_at > now());
  if v_missing is not null then
    raise exception 'HOLD_EXPIRED' using detail = array_to_string(v_missing, ',');
  end if;

  insert into orders (id, buyer_name, buyer_email, buyer_phone, cpf_masked, total_cents)
  values (_gen_code('PED'),
          trim(p_buyer->>'fullName'), lower(trim(p_buyer->>'email')), p_buyer->>'phone',
          nullif(p_buyer->>'cpfMasked', ''),
          greatest(coalesce(p_price_cents, 0), 0) * cardinality(p_seats))
  returning * into v_order;

  foreach s in array (select array_agg(distinct x) from unnest(p_seats) x) loop
    insert into tickets (id, order_id, seat_id, holder_name, price_cents)
    values (_gen_code('JP'), v_order.id, s,
            coalesce(nullif(trim(p_holders->>s), ''), v_order.buyer_name),
            greatest(coalesce(p_price_cents, 0), 0))
    returning * into v_ticket;
    v_tickets := v_tickets || _ticket_json(v_ticket);
  end loop;

  delete from seat_holds where session_id = p_session;

  return jsonb_build_object(
    'order', jsonb_build_object(
      'id', v_order.id, 'totalCents', v_order.total_cents, 'createdAt', v_order.created_at,
      'buyer', jsonb_build_object('fullName', v_order.buyer_name, 'email', v_order.buyer_email,
                                  'phone', v_order.buyer_phone, 'cpfMasked', v_order.cpf_masked),
      'ticketIds', (select jsonb_agg(e->'id') from jsonb_array_elements(v_tickets) e)),
    'tickets', v_tickets);
end $$;

-- Consulta pública: devolve dados do ingresso, nunca contatos do comprador.
create or replace function public.find_tickets(p_ids text[])
returns setof jsonb language sql stable security definer set search_path = public as $$
  select _ticket_json(t) from tickets t where t.id = any(p_ids) order by t.created_at desc
$$;

-- Permissões: o público só executa as funções da API.
revoke execute on all functions in schema public from public;
grant execute on function public.get_seat_map(uuid)                       to anon, authenticated;
grant execute on function public.hold_seats(uuid, text[], int)            to anon, authenticated;
grant execute on function public.release_hold(uuid)                       to anon, authenticated;
grant execute on function public.purchase(uuid, text[], jsonb, jsonb, int) to anon, authenticated;
grant execute on function public.find_tickets(text[])                     to anon, authenticated;
