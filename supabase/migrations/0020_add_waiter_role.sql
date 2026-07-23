-- =============================================================================
-- 0020 — Adiciona 'waiter' (garçom) ao enum user_role, Sprint 5, Fase 6
-- Isolada em migration própria: Postgres não permite usar um valor de enum
-- recém-adicionado na mesma transação em que foi criado (mesmo padrão de
-- 0006, que adicionou 'dine_in' a order_type).
-- =============================================================================

alter type public.user_role add value 'waiter';
