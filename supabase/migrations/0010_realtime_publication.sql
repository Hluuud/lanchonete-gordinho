-- =============================================================================
-- 0010 — Habilita Supabase Realtime de verdade em `orders` e
-- `order_tracking_status`. Correção de uma lacuna crítica: nenhuma tabela
-- estava na publicação `supabase_realtime` (confirmado via
-- `pg_publication_tables` vazio) — ou seja, `postgres_changes` nunca entregou
-- um evento sequer, nem para o Painel da Cozinha (Sprint 2) nem para o
-- acompanhamento público (Sprint 3). Só passou despercebido porque a
-- verificação da Sprint 2 usou dados mocados, sem exercitar uma mudança real
-- no banco. `order_items` não precisa entrar — itens são imutáveis após a
-- criação, nenhuma tela assina mudanças nela.
-- =============================================================================

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_tracking_status;
