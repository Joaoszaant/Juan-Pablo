-- ZERA O BANCO: apaga todas as compras, ingressos e reservas.
-- Irreversível. Rode no SQL Editor do Supabase.
truncate table public.seat_holds, public.tickets, public.orders;
