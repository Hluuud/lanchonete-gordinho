-- =============================================================================
-- 0019 — Permite gestão do tenant editar configuração operacional da loja
-- Sprint 5, Fase 5.
--
-- A policy `tenants_write_super_admin` (0002) restringe TODA escrita a
-- super_admin — correto para provisionamento (slug, is_active), errado
-- para os campos operacionais novos (0018), que o dono/gerente do
-- restaurante precisa editar no dia a dia.
--
-- Solução: nova policy de UPDATE para is_tenant_manager (RLS combina
-- policies permissivas do mesmo comando com OR) + trigger que bloqueia
-- alteração de `slug`/`is_active` por quem não é super_admin, mesmo que a
-- policy de RLS já tenha permitido a linha.
-- =============================================================================

create policy tenants_update_manager on public.tenants
  for update using (
    public.is_tenant_manager(id)
  ) with check (
    public.is_tenant_manager(id)
  );

create or replace function public.protect_tenant_platform_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    if new.slug is distinct from old.slug or new.is_active is distinct from old.is_active then
      raise exception 'Apenas super_admin pode alterar slug ou is_active de um tenant.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_tenants_protect_platform_fields
  before update on public.tenants
  for each row execute function public.protect_tenant_platform_fields();
