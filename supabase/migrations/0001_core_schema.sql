-- =============================================================================
-- 0001 — Schema núcleo (multi-tenant)
-- Plataforma de gestão de pedidos. Toda tabela de domínio carrega tenant_id.
-- Dinheiro sempre em centavos (inteiro). Isolamento por RLS (ver 0002).
-- =============================================================================

create extension if not exists "pgcrypto";

-- Trigger genérico para manter updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Papéis de usuário na plataforma.
create type public.user_role as enum (
  'super_admin', -- plataforma (atravessa tenants)
  'owner',       -- dono do restaurante
  'manager',     -- gerente
  'kitchen',     -- cozinha
  'cashier'      -- caixa/atendente
);

-- -----------------------------------------------------------------------------
-- tenants: restaurantes (unidades de isolamento do SaaS).
-- -----------------------------------------------------------------------------
create table public.tenants (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- profiles: liga auth.users -> tenant + papel.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  role       public.user_role not null default 'cashier',
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_tenant on public.profiles (tenant_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- categories: seções do cardápio, por tenant.
-- -----------------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  name       text not null,
  slug       text not null,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  -- Permite FK composta a partir de products (mesmo tenant garantido).
  unique (id, tenant_id)
);

create index idx_categories_tenant on public.categories (tenant_id);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- products: itens do cardápio, por tenant.
-- -----------------------------------------------------------------------------
create table public.products (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants (id) on delete cascade,
  category_id       uuid not null,
  name              text not null,
  description       text,
  price_cents       integer not null check (price_cents >= 0),
  image_url         text,
  prep_time_minutes integer not null default 15 check (prep_time_minutes >= 0),
  is_available      boolean not null default true,
  is_published      boolean not null default true,
  is_featured       boolean not null default false,
  is_new            boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Garante que a categoria pertence ao mesmo tenant do produto.
  foreign key (category_id, tenant_id)
    references public.categories (id, tenant_id) on delete cascade
);

create index idx_products_tenant on public.products (tenant_id);
create index idx_products_category on public.products (category_id);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();
