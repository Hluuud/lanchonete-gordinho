-- =============================================================================
-- 0017 — RLS de combos/combo_slots/combo_slot_products
-- Staff-only (leitura e escrita) — sem policy pública ainda, mesma razão
-- de 0015 (product_modifiers): o storefront não vende combos nesta sprint.
-- =============================================================================

alter table public.combos              enable row level security;
alter table public.combo_slots         enable row level security;
alter table public.combo_slot_products enable row level security;

create policy combos_select on public.combos
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

create policy combos_write on public.combos
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

create policy combo_slots_select on public.combo_slots
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

create policy combo_slots_write on public.combo_slots
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

create policy combo_slot_products_select on public.combo_slot_products
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

create policy combo_slot_products_write on public.combo_slot_products
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );
