-- =============================================================================
-- 0015 — RLS de modifier_groups/modifier_options/product_modifier_groups
-- Staff-only (leitura e escrita) — sem policy pública ainda, porque o
-- storefront não consome isso nesta sprint (ver 0014).
-- =============================================================================

alter table public.modifier_groups        enable row level security;
alter table public.modifier_options       enable row level security;
alter table public.product_modifier_groups enable row level security;

create policy modifier_groups_select on public.modifier_groups
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

create policy modifier_groups_write on public.modifier_groups
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

create policy modifier_options_select on public.modifier_options
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

create policy modifier_options_write on public.modifier_options
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

create policy product_modifier_groups_select on public.product_modifier_groups
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

create policy product_modifier_groups_write on public.product_modifier_groups
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );
