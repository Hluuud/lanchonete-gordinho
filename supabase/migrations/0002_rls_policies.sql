-- =============================================================================
-- 0002 — Row Level Security (isolamento por tenant + leitura pública do cardápio)
-- Princípio do menor privilégio. O cliente (anon) só lê cardápio publicado.
-- Escrita é restrita ao staff do próprio tenant; super_admin atravessa tenants.
-- =============================================================================

-- Helpers (security definer para ler profiles sem recursão de RLS).
create or replace function public.current_profile_tenant()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select public.current_profile_role() = 'super_admin';
$$;

-- Staff de gestão do tenant do produto/categoria (pode editar cardápio).
create or replace function public.is_tenant_manager(target_tenant uuid)
returns boolean
language sql
stable
as $$
  select public.current_profile_tenant() = target_tenant
     and public.current_profile_role() in ('owner', 'manager');
$$;

-- Habilita RLS.
alter table public.tenants    enable row level security;
alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- -----------------------------------------------------------------------------
-- tenants
-- -----------------------------------------------------------------------------
-- Leitura pública de restaurantes ativos (loja resolve tenant por slug).
create policy tenants_select_public on public.tenants
  for select using (
    is_active
    or id = public.current_profile_tenant()
    or public.is_super_admin()
  );

-- Provisionamento de tenant é operação de plataforma.
create policy tenants_write_super_admin on public.tenants
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- Vê o próprio perfil; gestão vê perfis do mesmo tenant; super_admin vê tudo.
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or (
      tenant_id = public.current_profile_tenant()
      and public.current_profile_role() in ('owner', 'manager')
    )
    or public.is_super_admin()
  );

-- Usuário atualiza o próprio perfil (sem trocar de tenant/papel via app).
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Gestão do tenant e plataforma administram perfis.
create policy profiles_manage on public.profiles
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------
-- Cardápio é público: categorias ativas visíveis a qualquer visitante.
create policy categories_select on public.categories
  for select using (
    is_active
    or public.is_tenant_manager(tenant_id)
    or public.is_super_admin()
  );

create policy categories_write on public.categories
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
-- Produtos publicados são visíveis publicamente (indisponíveis aparecem esmaecidos).
create policy products_select on public.products
  for select using (
    is_published
    or public.is_tenant_manager(tenant_id)
    or public.is_super_admin()
  );

create policy products_write on public.products
  for all using (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  ) with check (
    public.is_tenant_manager(tenant_id) or public.is_super_admin()
  );
