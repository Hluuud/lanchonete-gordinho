-- =============================================================================
-- 0024 — Impressoras, Sprint 5, Fase 8
-- Só persistência de configuração (conforme pedido) — sem execução real de
-- impressão ainda; prepara a arquitetura para ESC/POS futuro (ver
-- docs/printing.md). `role`/`connection_type`/`paper_width` usam `text` +
-- `check` em vez de enum Postgres, mesmo critério já usado em `combos`/
-- `tenants.store_mode`: valores fechados o suficiente para `check`, sem a
-- rigidez de precisar de uma migration isolada para adicionar uma opção.
-- =============================================================================

create table public.printers (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  name           text not null,
  role           text not null check (role in ('kitchen', 'cashier', 'counter')),
  connection_type text not null check (connection_type in ('usb', 'network', 'bluetooth')),
  paper_width    text not null default '80mm' check (paper_width in ('58mm', '80mm')),
  protocol       text not null default 'escpos',
  ip_address     inet,
  port           integer check (port is null or (port > 0 and port <= 65535)),
  model          text,
  auto_print     boolean not null default false,
  allow_reprint  boolean not null default true,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_printers_tenant on public.printers (tenant_id);

create trigger trg_printers_updated_at
  before update on public.printers
  for each row execute function public.set_updated_at();

comment on table public.printers is
  'Configuração de impressoras por tenant — só persistência nesta fase, execução real (ESC/POS) é evolução futura (docs/printing.md).';
