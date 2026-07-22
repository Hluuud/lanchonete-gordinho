-- =============================================================================
-- 0012 — Campos de gestão em categories (Sprint 5, Fase 1)
-- Nenhuma mudança de RLS: as policies de is_tenant_manager (0002) já
-- cobrem escrita nestas colunas novas.
-- =============================================================================

alter table public.categories
  add column icon text,
  add column color text,
  add column is_available boolean not null default true;

comment on column public.categories.icon is
  'Nome de ícone lucide-react (ex. "sandwich") — puramente cosmético.';
comment on column public.categories.color is
  'Cor em hex (ex. "#f97316") usada como acento visual no admin/cardápio.';
comment on column public.categories.is_available is
  'Pode ser pedida agora — distinto de is_active (aparece no cardápio). Mesmo par já usado em products (is_published/is_available).';
