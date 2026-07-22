-- =============================================================================
-- 0005 — RLS de pedidos (Painel da Cozinha). Sem visão pública: só staff do
-- próprio tenant (owner/manager/kitchen/cashier) ou super_admin. Escrita e
-- exclusão seguem o princípio do menor privilégio (ver docs/security.md).
-- =============================================================================

-- Staff operacional do tenant (além de owner/manager, também cozinha/caixa).
create or replace function public.is_tenant_staff(target_tenant uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_profile_tenant() = target_tenant
     and public.current_profile_role() in ('owner', 'manager', 'kitchen', 'cashier');
$$;

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
-- Leitura: qualquer staff do tenant (painel da cozinha, caixa, gestão).
create policy orders_select on public.orders
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

-- Criação: staff do tenant (cozinha não cria pedidos hoje, mas caixa/checkout
-- futuro sim — manter uma única policy de insert evita reescrevê-la ali).
create policy orders_insert on public.orders
  for insert with check (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

-- Atualização: staff do tenant (mudança de status/prioridade é a operação
-- central do Painel da Cozinha).
create policy orders_update on public.orders
  for update using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

-- Exclusão física: restrita à gestão. Cozinha/caixa cancelam via status,
-- nunca apagam a linha.
create policy orders_delete on public.orders
  for delete using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

-- -----------------------------------------------------------------------------
-- order_items
-- -----------------------------------------------------------------------------
-- Leitura: junto do pedido, mesmo staff do tenant.
create policy order_items_select on public.order_items
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

-- Criação: junto da criação do pedido (staff do tenant).
create policy order_items_insert on public.order_items
  for insert with check (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

-- Itens são imutáveis por design nesta fase (sem edição de pedido) — update/
-- delete ficam restritos à gestão, só para correção administrativa pontual.
create policy order_items_update on public.order_items
  for update using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

create policy order_items_delete on public.order_items
  for delete using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );
