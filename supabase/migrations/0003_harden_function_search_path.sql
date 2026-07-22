-- =============================================================================
-- 0003 — Endurece o search_path das funções (defense-in-depth).
-- Evita sequestro de search_path (linter: function_search_path_mutable).
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_profile_role() = 'super_admin';
$$;

create or replace function public.is_tenant_manager(target_tenant uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.current_profile_tenant() = target_tenant
     and public.current_profile_role() in ('owner', 'manager');
$$;
