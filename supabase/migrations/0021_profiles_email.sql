-- =============================================================================
-- 0021 — profiles ganha email, Sprint 5, Fase 6
-- Necessário para listar usuários com email sem juntar auth.users em toda
-- leitura (RLS não alcança o schema auth). Escrito no momento do convite
-- (services/admin/users.service.ts), não sincronizado por trigger nesta v1
-- — ver BACKLOG (drift se o email mudar em auth.users).
--
-- Nenhuma mudança de RLS: as policies de profiles (0002) já cobrem esta
-- coluna (profiles_manage permite insert/update por is_tenant_manager).
-- =============================================================================

alter table public.profiles
  add column email text;

comment on column public.profiles.email is
  'Espelho de auth.users.email, escrito no convite — evita join com auth.users em toda leitura (RLS não alcança o schema auth).';
