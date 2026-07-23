-- =============================================================================
-- 0023 — Bloqueia auto-escalação de privilégio em profiles, Sprint 5, Fase 6
--
-- Achado ao implementar o módulo Usuários: `profiles_update_self` (0002)
-- permite `for update using (id = auth.uid()) with check (id = auth.uid())`
-- — o "with check" só garante que o usuário não mude o próprio `id`, mas
-- QUALQUER outra coluna fica livre, incluindo `role` e `tenant_id`. Um
-- usuário autenticado comum (ex. 'waiter') poderia hoje rodar
-- `update profiles set role = 'super_admin' where id = auth.uid()` (ou
-- trocar de tenant) direto pelo client anônimo, sem passar por nenhuma rota
-- de API — RLS aceitaria a escrita.
--
-- Mesma solução já usada em 0019 para `tenants` (RLS não expressa restrição
-- por coluna sozinha): trigger que bloqueia mudança de `role`, `tenant_id`
-- ou `is_active` por quem não é `is_tenant_manager`/`is_super_admin` do
-- tenant, mesmo que a policy de linha já tenha permitido a operação.
-- =============================================================================

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     or new.tenant_id is distinct from old.tenant_id
     or new.is_active is distinct from old.is_active
  then
    if not (public.is_tenant_manager(old.tenant_id) or public.is_super_admin()) then
      raise exception 'Apenas gestão do tenant pode alterar papel, tenant ou ativação de um perfil.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_protect_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();
