-- =============================================================================
-- 0022 — profiles ganha is_active, Sprint 5, Fase 6
-- "Desativar" um usuário em vez de excluir (profiles.id referencia
-- auth.users com on delete cascade — excluir a linha exigiria excluir o
-- usuário de auth.users, fora do escopo de uma ação de admin comum).
-- `getCurrentUser()` passa a tratar um perfil inativo como "sem perfil"
-- (bloqueia todas as áreas guardadas sem precisar tocar na sessão do
-- Supabase Auth) — ver lib/auth/session.ts.
-- =============================================================================

alter table public.profiles
  add column is_active boolean not null default true;

comment on column public.profiles.is_active is
  'Desativação lógica — getCurrentUser() trata inativo como sem perfil (bloqueia guards sem revogar a sessão de auth).';
