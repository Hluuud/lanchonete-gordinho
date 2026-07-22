-- =============================================================================
-- 0014 — Grupos de adicionais (modifiers), Sprint 5, Fase 3
-- Modelagem/CRUD administrativo apenas — o cliente ainda não escolhe
-- adicionais ao pedir (exige mudanças em carrinho/checkout/order_items,
-- fora do escopo desta sprint; ver BACKLOG e o plano da Sprint 5).
--
-- Grupos pertencem ao TENANT (reutilizáveis entre produtos), não a um único
-- produto — "Molhos" criado uma vez, vinculado a N produtos via
-- product_modifier_groups.
-- =============================================================================

create type public.modifier_selection_type as enum ('single', 'multiple');

create table public.modifier_groups (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  name            text not null,
  selection_type  public.modifier_selection_type not null default 'single',
  is_required     boolean not null default false,
  min_selections  integer not null default 0 check (min_selections >= 0),
  max_selections  integer not null default 1 check (max_selections >= 1),
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, tenant_id),
  check (min_selections <= max_selections),
  check (selection_type <> 'single' or max_selections <= 1)
);

create index idx_modifier_groups_tenant on public.modifier_groups (tenant_id);

create trigger trg_modifier_groups_updated_at
  before update on public.modifier_groups
  for each row execute function public.set_updated_at();

create table public.modifier_options (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  group_id     uuid not null,
  name         text not null,
  price_cents  integer not null default 0 check (price_cents >= 0),
  is_available boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  foreign key (group_id, tenant_id)
    references public.modifier_groups (id, tenant_id) on delete cascade
);

create index idx_modifier_options_tenant on public.modifier_options (tenant_id);
create index idx_modifier_options_group on public.modifier_options (group_id);

create trigger trg_modifier_options_updated_at
  before update on public.modifier_options
  for each row execute function public.set_updated_at();

-- Vínculo produto <-> grupo (N:N) — um grupo reutilizável em vários produtos.
create table public.product_modifier_groups (
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  product_id  uuid not null,
  group_id    uuid not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  primary key (product_id, group_id),
  foreign key (product_id, tenant_id)
    references public.products (id, tenant_id) on delete cascade,
  foreign key (group_id, tenant_id)
    references public.modifier_groups (id, tenant_id) on delete cascade
);

create index idx_product_modifier_groups_tenant on public.product_modifier_groups (tenant_id);
create index idx_product_modifier_groups_product on public.product_modifier_groups (product_id);
create index idx_product_modifier_groups_group on public.product_modifier_groups (group_id);

comment on table public.modifier_groups is
  'Grupos de adicionais reutilizáveis por tenant (ex. "Molhos", "Queijos"). Modelagem/CRUD administrativo (Sprint 5) — ainda não vendável na loja.';
comment on table public.product_modifier_groups is
  'Vínculo N:N entre produtos e grupos de adicionais.';
