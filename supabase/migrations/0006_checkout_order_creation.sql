-- =============================================================================
-- 0006 — Checkout real (Sprint 3): novo tipo de pedido "Consumo no local".
-- Isolado em sua própria migration porque o Postgres não permite usar um
-- valor de enum recém-criado na mesma transação em que foi adicionado — o
-- restante do checkout (tabelas, função) vem em 0007.
-- =============================================================================

alter type public.order_type add value 'dine_in';
