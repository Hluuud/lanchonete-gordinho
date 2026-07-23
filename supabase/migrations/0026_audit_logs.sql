-- =============================================================================
-- 0026 — audit_logs, Sprint 5.5, Fase 1
--
-- Log de auditoria append-only: login/logout, criação/alteração/exclusão de
-- entidades administrativas, mudança de preço (variante de "update" quando
-- os campos alterados incluem preço) e cancelamento de pedido.
--
-- `actor_id` referencia `profiles` com `on delete set null` — apagar um
-- perfil não deve apagar o histórico de auditoria que ele gerou;
-- `actor_email`/`actor_role` são um snapshot do momento da ação (mesmo
-- padrão de `profiles.email` espelhando `auth.users.email`), para o log
-- continuar legível mesmo que o ator mude de papel ou seja desativado
-- depois.
--
-- Sem "impressão" no check de `action` ainda — não existe execução real de
-- impressão no projeto (Sprint 5, Fase 8 foi só persistência de config).
-- Adicionar quando essa capacidade existir de verdade.
-- =============================================================================

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  actor_id    uuid references public.profiles (id) on delete set null,
  actor_email text,
  actor_role  public.user_role,
  action      text not null check (
    action in ('login', 'logout', 'create', 'update', 'delete', 'price_change', 'cancel')
  ),
  -- nulo para login/logout (a "entidade" é a própria sessão, não um registro de negócio)
  entity_type text,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_tenant_created on public.audit_logs (tenant_id, created_at desc);
create index idx_audit_logs_entity on public.audit_logs (tenant_id, entity_type, entity_id);

comment on table public.audit_logs is
  'Log de auditoria append-only. Sem policy de update/delete de propósito -- ninguém edita pela app, nem super_admin.';
