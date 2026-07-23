-- =============================================================================
-- 0016 — Combos, Sprint 5, Fase 4
-- Modelagem/CRUD administrativo apenas — o cliente ainda não compra
-- combos (mesma decisão de escopo dos Adicionais, 0014); vira Sprint 6
-- junto com a integração de adicionais ao carrinho/checkout.
--
-- Estrutura: "Produto Principal" fixo (main_product_id) + N slots de
-- escolha ("Escolha uma bebida"), cada slot com produtos elegíveis via
-- combo_slot_products.
-- =============================================================================

create table public.combos (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants (id) on delete cascade,
  name             text not null,
  description      text,
  image_url        text,
  -- null = preço calculado (principal + seleções); informado = preço fixo do combo.
  price_cents      integer,
  main_product_id  uuid,
  is_available     boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (id, tenant_id),
  check (price_cents is null or price_cents >= 0),
  foreign key (main_product_id, tenant_id)
    references public.products (id, tenant_id) on delete cascade
);

create index idx_combos_tenant on public.combos (tenant_id);
create index idx_combos_main_product on public.combos (main_product_id);

create trigger trg_combos_updated_at
  before update on public.combos
  for each row execute function public.set_updated_at();

create table public.combo_slots (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  combo_id        uuid not null,
  name            text not null,
  is_required     boolean not null default true,
  min_selections  integer not null default 1 check (min_selections >= 0),
  max_selections  integer not null default 1 check (max_selections >= 1),
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, tenant_id),
  check (min_selections <= max_selections),
  foreign key (combo_id, tenant_id)
    references public.combos (id, tenant_id) on delete cascade
);

create index idx_combo_slots_tenant on public.combo_slots (tenant_id);
create index idx_combo_slots_combo on public.combo_slots (combo_id);

create trigger trg_combo_slots_updated_at
  before update on public.combo_slots
  for each row execute function public.set_updated_at();

create table public.combo_slot_products (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants (id) on delete cascade,
  slot_id              uuid not null,
  product_id           uuid not null,
  -- null = usa o price_cents normal do produto.
  price_override_cents integer,
  sort_order           integer not null default 0,
  created_at           timestamptz not null default now(),
  check (price_override_cents is null or price_override_cents >= 0),
  foreign key (slot_id, tenant_id)
    references public.combo_slots (id, tenant_id) on delete cascade,
  foreign key (product_id, tenant_id)
    references public.products (id, tenant_id) on delete cascade
);

create index idx_combo_slot_products_tenant on public.combo_slot_products (tenant_id);
create index idx_combo_slot_products_slot on public.combo_slot_products (slot_id);
create index idx_combo_slot_products_product on public.combo_slot_products (product_id);

comment on table public.combos is
  'Combos (produto principal + slots de escolha). Modelagem/CRUD administrativo (Sprint 5) — ainda não vendável na loja.';
comment on column public.combos.price_cents is
  'Preço fixo do combo, se definido; null = calculado (principal + seleções) — cálculo é responsabilidade da camada de serviço/checkout futuro.';
