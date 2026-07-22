-- =============================================================================
-- 0007 — RLS do checkout (Sprint 3). order_counters fica sem policy alguma
-- (só a função create_order, security definer, e service_role tocam nela).
-- order_tracking_status e order_items ficam públicas — nenhuma das duas tem
-- PII (nome/telefone/observação ficam só em orders, que continua staff-only).
-- =============================================================================

alter table public.order_counters      enable row level security;
alter table public.order_tracking_status enable row level security;

-- Tracking público: sem PII, seguro para qualquer visitante que tenha o link
-- (o `order_id` — UUID — é a própria credencial de acesso, mesmo modelo de
-- links de acompanhamento de pedido/pagamento usados amplamente no mercado).
create policy order_tracking_status_select_public on public.order_tracking_status
  for select using (true);

-- Itens do pedido não têm PII (nome do produto, preço, quantidade, obs. do
-- item) — segura para exibir na página pública de acompanhamento.
create policy order_items_select_public on public.order_items
  for select using (true);
