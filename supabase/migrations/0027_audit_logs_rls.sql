-- =============================================================================
-- 0027 — RLS de audit_logs, Sprint 5.5, Fase 1
--
-- Leitura restrita a gestão (`is_tenant_manager`/`is_super_admin`) --
-- cozinha/caixa/garçom não têm motivo para ver quem mudou preços ou papéis
-- de usuário. Escrita liberada para todo staff (`is_tenant_staff`) porque
-- login/logout de QUALQUER papel (inclusive cozinha) precisa conseguir
-- inserir o próprio evento. Sem policy de update/delete -- log é
-- append-only, ninguém apaga/edita pela app.
-- =============================================================================

alter table public.audit_logs enable row level security;

create policy audit_logs_select on public.audit_logs
  for select using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

create policy audit_logs_insert on public.audit_logs
  for insert with check (
    public.is_tenant_staff(tenant_id) or public.is_super_admin()
  );
