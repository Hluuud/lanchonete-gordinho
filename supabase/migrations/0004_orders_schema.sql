-- =============================================================================
-- 0004 — Schema de pedidos (fundação do Painel da Cozinha, Fase 2).
-- Dinheiro em centavos. Itens são imutáveis após a criação (snapshot de nome
-- e preço) — não há edição de pedido nesta fase, só transição de status.
-- =============================================================================

create type public.order_status as enum (
  'new',        -- Novo Pedido
  'accepted',   -- Aceito
  'preparing',  -- Em Preparo
  'ready',      -- Pronto
  'delivered',  -- Entregue
  'completed',  -- Finalizado (arquivado, sai do board ativo)
  'cancelled'   -- Cancelado
);

create type public.order_type as enum (
  'pickup',    -- Retirada
  'delivery'   -- Entrega
);

-- -----------------------------------------------------------------------------
-- orders: pedidos, por tenant.
-- -----------------------------------------------------------------------------
create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants (id) on delete cascade,
  order_number       integer, -- "senha": atribuído pela trigger abaixo.
  status             public.order_status not null default 'new',
  order_type         public.order_type not null default 'pickup',
  customer_name      text,
  customer_phone     text,
  notes              text,
  subtotal_cents     integer not null default 0 check (subtotal_cents >= 0),
  is_priority        boolean not null default false,
  estimated_ready_at timestamptz,
  accepted_at        timestamptz,
  preparing_at       timestamptz,
  ready_at           timestamptz,
  delivered_at       timestamptz,
  completed_at       timestamptz,
  cancelled_at       timestamptz,
  cancelled_reason   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Permite FK composta a partir de order_items (mesmo tenant garantido).
  unique (id, tenant_id)
);

create index idx_orders_tenant on public.orders (tenant_id);
create index idx_orders_tenant_status on public.orders (tenant_id, status);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- "Senha" do pedido: sequencial por tenant, reiniciando a cada dia.
-- Conhecido: sob concorrência real (múltiplos caixas simultâneos) há uma
-- janela de corrida entre o select e o insert — aceitável para o volume de
-- uma lanchonete/seed; ver docs/database.md e BACKLOG.md.
create or replace function public.assign_order_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.order_number is null then
    select coalesce(max(order_number), 0) + 1
      into new.order_number
      from public.orders
     where tenant_id = new.tenant_id
       and created_at::date = new.created_at::date;
  end if;
  return new;
end;
$$;

create trigger trg_orders_assign_number
  before insert on public.orders
  for each row execute function public.assign_order_number();

-- Permite FK composta (product_id, tenant_id) a partir de order_items, no
-- mesmo padrão já usado por categories → products (0001). Aditivo, não
-- destrutivo.
alter table public.products
  add constraint products_id_tenant_id_key unique (id, tenant_id);

-- -----------------------------------------------------------------------------
-- order_items: itens do pedido, por tenant. Imutáveis após criação.
-- -----------------------------------------------------------------------------
create table public.order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null,
  tenant_id             uuid not null references public.tenants (id) on delete cascade,
  product_id            uuid,
  product_name_snapshot text not null,
  unit_price_cents      integer not null check (unit_price_cents >= 0),
  quantity              integer not null default 1 check (quantity > 0),
  notes                 text,
  created_at            timestamptz not null default now(),
  -- Garante que o pedido pertence ao mesmo tenant do item.
  foreign key (order_id, tenant_id)
    references public.orders (id, tenant_id) on delete cascade,
  -- Snapshot preserva o histórico: produto pode ser removido depois sem perder o item.
  foreign key (product_id, tenant_id)
    references public.products (id, tenant_id) on delete set null
);

create index idx_order_items_order on public.order_items (order_id);
create index idx_order_items_tenant on public.order_items (tenant_id);
