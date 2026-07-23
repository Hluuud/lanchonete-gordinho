-- =============================================================================
-- 0025 — RLS de printers, Sprint 5, Fase 8
-- Leitura por qualquer staff do tenant (cozinha/caixa vão precisar ler isso
-- quando a impressão real for implementada); escrita só gestão — mesmo
-- formato de `combos_select`/`combos_write` (0017).
-- =============================================================================

alter table public.printers enable row level security;

create policy printers_select on public.printers
  for select using (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );

create policy printers_write on public.printers
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );
