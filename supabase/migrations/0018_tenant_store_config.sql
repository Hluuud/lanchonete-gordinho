-- =============================================================================
-- 0018 — Configuração operacional da loja em tenants, Sprint 5, Fase 5
-- Fecha uma dívida técnica da Sprint 4: horário/tempo médio deixam de ser
-- constante client (features/menu/store-info.ts) e passam a ser dado real.
-- =============================================================================

alter table public.tenants
  add column phone text,
  add column whatsapp text,
  add column instagram text,
  add column facebook text,
  add column address text,
  add column logo_url text,
  add column banner_url text,
  add column promo_banner_url text,
  add column primary_color text,
  add column secondary_color text,
  add column welcome_message text,
  add column closing_message text,
  add column avg_prep_time_minutes integer,
  add column store_mode text not null default 'open',
  add column business_hours jsonb;

alter table public.tenants
  add constraint tenants_store_mode_check
  check (store_mode in ('open', 'closed', 'vacation', 'maintenance'));

alter table public.tenants
  add constraint tenants_avg_prep_time_check
  check (avg_prep_time_minutes is null or avg_prep_time_minutes >= 0);

comment on column public.tenants.store_mode is
  'Modo operacional da loja: open|closed|vacation|maintenance. Controla o badge Aberto/Fechado do storefront.';
comment on column public.tenants.business_hours is
  'Horário de funcionamento estruturado por dia da semana (jsonb) — substitui a constante client BUSINESS_HOURS da Sprint 4.';
