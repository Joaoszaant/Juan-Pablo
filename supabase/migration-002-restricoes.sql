-- =====================================================================
-- MIGRAÇÃO 002 — Restrições de emissão e consulta protegida
-- Rode no SQL Editor do Supabase (projeto que já tem o schema.sql).
-- Pode rodar mais de uma vez sem problema.
--
-- 1. Limite de ingressos por pessoa (mesmo e-mail OU mesmo telefone).
-- 2. Consulta de ingresso exige código + e-mail de quem comprou.
-- =====================================================================

-- Limite por pessoa. Para mudar, altere o número aqui e rode de novo.
create or replace function public._max_tickets_per_person()
returns int language sql immutable as $$ select 4 $$;

create or replace function public.purchase(
  p_session uuid, p_seats text[], p_buyer jsonb, p_holders jsonb default '{}'::jsonb, p_price_cents int default 0)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_taken   text[];
  v_missing text[];
  v_order   orders;
  v_tickets jsonb := '[]'::jsonb;
  v_ticket  tickets;
  v_email   text := lower(trim(p_buyer->>'email'));
  v_phone   text := regexp_replace(coalesce(p_buyer->>'phone', ''), '\D', '', 'g');
  v_already int;
  v_new     int;
  s text;
begin
  if p_seats is null or cardinality(p_seats) = 0 then raise exception 'EMPTY'; end if;
  if cardinality(p_seats) > 8 then raise exception 'LIMIT_EXCEEDED'; end if;

  perform pg_advisory_xact_lock(hashtext('jp-seats'));

  -- Limite por pessoa
  select count(*) into v_already
    from tickets t join orders o on o.id = t.order_id
   where t.status = 'valid'
     and (o.buyer_email = v_email or regexp_replace(o.buyer_phone, '\D', '', 'g') = v_phone);
  select count(distinct x) into v_new from unnest(p_seats) x;
  if v_already + v_new > _max_tickets_per_person() then
    raise exception 'PERSON_LIMIT'
      using detail = greatest(_max_tickets_per_person() - v_already, 0)::text || '|' || _max_tickets_per_person()::text;
  end if;

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
  values (_gen_code('PED'), trim(p_buyer->>'fullName'), v_email, p_buyer->>'phone',
          nullif(p_buyer->>'cpfMasked', ''), greatest(coalesce(p_price_cents, 0), 0) * v_new)
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

-- Consulta protegida: só devolve ingressos cujo comprador tem o e-mail informado.
create or replace function public.get_tickets(p_ids text[], p_email text)
returns setof jsonb language sql stable security definer set search_path = public as $$
  select _ticket_json(t)
    from tickets t join orders o on o.id = t.order_id
   where t.id = any(p_ids)
     and o.buyer_email = lower(trim(p_email))
   order by t.created_at desc
$$;

-- A consulta só por código deixa de ser pública.
revoke execute on function public.find_tickets(text[]) from anon, authenticated;
revoke execute on function public._max_tickets_per_person() from public;
grant execute on function public.get_tickets(text[], text) to anon, authenticated;
