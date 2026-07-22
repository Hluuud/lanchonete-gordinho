-- =============================================================================
-- 0013 — Campos de gestão em products (Sprint 5, Fase 2)
-- Nenhuma mudança de RLS: as policies de is_tenant_manager (0002) já
-- cobrem escrita nestas colunas novas.
-- =============================================================================

alter table public.products
  add column promo_price_cents integer,
  add column sku text,
  add column is_bestseller boolean not null default false,
  add column ingredients text[] not null default '{}',
  add column allergens text[] not null default '{}',
  add column tags text[] not null default '{}',
  add column nutritional_info jsonb;

alter table public.products
  add constraint products_promo_price_check check (
    promo_price_cents is null
    or (promo_price_cents >= 0 and promo_price_cents < price_cents)
  );

-- SKU único por tenant quando informado (permite muitos produtos sem SKU).
create unique index products_tenant_sku_key
  on public.products (tenant_id, sku)
  where sku is not null;

comment on column public.products.promo_price_cents is
  'Preço promocional (opcional) — sempre menor que price_cents quando presente.';
comment on column public.products.sku is
  'Código interno do lojista — único por tenant, opcional.';
comment on column public.products.is_bestseller is
  '"Mais vendido" — flag manual nesta sprint (Sprint 5). Calcular de vendas reais é evolução futura (BACKLOG).';
comment on column public.products.ingredients is
  'Lista simples de ingredientes (texto livre por item) — sem taxonomia compartilhada ainda.';
comment on column public.products.allergens is
  'Lista simples de alérgenos (texto livre por item).';
comment on column public.products.tags is
  'Tags livres do produto (texto livre por item).';
comment on column public.products.nutritional_info is
  'Reservado para informações nutricionais estruturadas — não exposto na UI ainda (placeholder, mesmo tratamento do campo rating no domínio).';
