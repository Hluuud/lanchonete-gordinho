-- =============================================================================
-- 0007 — Checkout real: criação atômica de pedidos (Sprint 3).
-- Substitui a geração de "senha" por MAX()+1 (dívida técnica da Sprint 2,
-- ver BACKLOG) por um contador atômico. Toda a criação de pedido (validação,
-- numeração, insert de orders/order_items) passa a acontecer em uma única
-- função Postgres (create_order), nunca em múltiplas chamadas do client.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- order_counters: contador atômico de "senha", por tenant/dia.
-- -----------------------------------------------------------------------------
create table public.order_counters (
  tenant_id    uuid not null references public.tenants (id) on delete cascade,
  counter_date date not null,
  last_number  integer not null default 0,
  primary key (tenant_id, counter_date)
);

-- Remove a dívida técnica da Sprint 2 (race condition de MAX()+1).
drop trigger if exists trg_orders_assign_number on public.orders;
drop function if exists public.assign_order_number();

-- order_number agora é sempre atribuído por create_order antes do insert.
alter table public.orders
  alter column order_number set not null;

-- Arquitetura preparada para taxa de serviço/cupom (sem lógica real ainda —
-- sempre 0/nulo nesta sprint; total é computado no domínio, não armazenado).
alter table public.orders
  add column service_fee_cents integer not null default 0 check (service_fee_cents >= 0),
  add column discount_cents    integer not null default 0 check (discount_cents >= 0),
  add column coupon_code       text;

-- -----------------------------------------------------------------------------
-- order_tracking_status: espelho SEM PII de orders, para a página pública de
-- acompanhamento (Realtime só funciona em tabelas reais, não em views, e RLS
-- não filtra por coluna — ver docs/security.md e ADR 0006).
-- -----------------------------------------------------------------------------
create table public.order_tracking_status (
  order_id           uuid primary key references public.orders (id) on delete cascade,
  tenant_id          uuid not null references public.tenants (id) on delete cascade,
  order_number       integer not null,
  status             public.order_status not null,
  order_type         public.order_type not null,
  subtotal_cents     integer not null,
  service_fee_cents  integer not null,
  discount_cents     integer not null,
  estimated_ready_at timestamptz,
  created_at         timestamptz not null,
  updated_at         timestamptz not null,
  accepted_at        timestamptz,
  preparing_at       timestamptz,
  ready_at           timestamptz,
  delivered_at       timestamptz,
  completed_at       timestamptz,
  cancelled_at       timestamptz
);

create index idx_order_tracking_status_tenant on public.order_tracking_status (tenant_id);

create or replace function public.sync_order_tracking_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.order_tracking_status (
    order_id, tenant_id, order_number, status, order_type,
    subtotal_cents, service_fee_cents, discount_cents, estimated_ready_at,
    created_at, updated_at, accepted_at, preparing_at, ready_at, delivered_at,
    completed_at, cancelled_at
  )
  values (
    new.id, new.tenant_id, new.order_number, new.status, new.order_type,
    new.subtotal_cents, new.service_fee_cents, new.discount_cents, new.estimated_ready_at,
    new.created_at, new.updated_at, new.accepted_at, new.preparing_at, new.ready_at,
    new.delivered_at, new.completed_at, new.cancelled_at
  )
  on conflict (order_id) do update set
    status = excluded.status,
    subtotal_cents = excluded.subtotal_cents,
    service_fee_cents = excluded.service_fee_cents,
    discount_cents = excluded.discount_cents,
    estimated_ready_at = excluded.estimated_ready_at,
    updated_at = excluded.updated_at,
    accepted_at = excluded.accepted_at,
    preparing_at = excluded.preparing_at,
    ready_at = excluded.ready_at,
    delivered_at = excluded.delivered_at,
    completed_at = excluded.completed_at,
    cancelled_at = excluded.cancelled_at;

  return new;
end;
$$;

create trigger trg_orders_sync_tracking
  after insert or update on public.orders
  for each row execute function public.sync_order_tracking_status();

-- -----------------------------------------------------------------------------
-- create_order: cria pedido + itens atomicamente (uma função = uma transação).
-- SECURITY DEFINER — é o único portão de escrita para convidados (anon), que
-- não têm papel de staff e não passam pelas policies de insert de orders/
-- order_items. Nunca confia no preço enviado pelo client: sempre lê
-- products.price_cents. p_items: jsonb [{product_id, quantity, notes}].
-- -----------------------------------------------------------------------------
create or replace function public.create_order(
  p_tenant_id uuid,
  p_order_type public.order_type,
  p_customer_name text,
  p_customer_phone text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id     uuid;
  v_order_number integer;
  v_subtotal     integer := 0;
  v_max_prep     integer := 0;
  v_item         jsonb;
  v_product      record;
  v_result       jsonb;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Pedido sem itens.' using errcode = 'P0001';
  end if;

  -- Valida cada item e computa o subtotal a partir do preço real no banco.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if coalesce((v_item->>'quantity')::int, 0) <= 0 then
      raise exception 'Quantidade inválida.' using errcode = 'P0003';
    end if;

    select id, name, price_cents, prep_time_minutes
      into v_product
      from public.products
     where id = (v_item->>'product_id')::uuid
       and tenant_id = p_tenant_id
       and is_published
       and is_available;

    if not found then
      raise exception 'Produto inválido ou indisponível.' using errcode = 'P0002';
    end if;

    v_subtotal := v_subtotal + v_product.price_cents * (v_item->>'quantity')::int;
    v_max_prep := greatest(v_max_prep, v_product.prep_time_minutes);
  end loop;

  -- Número atômico: upsert-increment, nunca MAX()+1, nunca vindo do client.
  insert into public.order_counters (tenant_id, counter_date, last_number)
  values (p_tenant_id, current_date, 1)
  on conflict (tenant_id, counter_date)
  do update set last_number = public.order_counters.last_number + 1
  returning last_number into v_order_number;

  insert into public.orders (
    tenant_id, order_number, status, order_type,
    customer_name, customer_phone, notes, subtotal_cents, estimated_ready_at
  )
  values (
    p_tenant_id, v_order_number, 'new', p_order_type,
    nullif(p_customer_name, ''), nullif(p_customer_phone, ''), nullif(p_notes, ''),
    v_subtotal, now() + (v_max_prep || ' minutes')::interval
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select id, name, price_cents into v_product
      from public.products
     where id = (v_item->>'product_id')::uuid;

    insert into public.order_items (
      order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity, notes
    )
    values (
      v_order_id, p_tenant_id, v_product.id, v_product.name, v_product.price_cents,
      (v_item->>'quantity')::int, nullif(v_item->>'notes', '')
    );
  end loop;

  select jsonb_build_object(
    'id', o.id, 'tenant_id', o.tenant_id, 'order_number', o.order_number,
    'status', o.status, 'order_type', o.order_type,
    'customer_name', o.customer_name, 'customer_phone', o.customer_phone, 'notes', o.notes,
    'subtotal_cents', o.subtotal_cents, 'service_fee_cents', o.service_fee_cents,
    'discount_cents', o.discount_cents, 'is_priority', o.is_priority,
    'estimated_ready_at', o.estimated_ready_at,
    'created_at', o.created_at, 'updated_at', o.updated_at,
    'accepted_at', o.accepted_at, 'preparing_at', o.preparing_at, 'ready_at', o.ready_at,
    'delivered_at', o.delivered_at, 'completed_at', o.completed_at,
    'cancelled_at', o.cancelled_at, 'cancelled_reason', o.cancelled_reason,
    'order_items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', oi.id, 'product_id', oi.product_id,
        'product_name_snapshot', oi.product_name_snapshot,
        'unit_price_cents', oi.unit_price_cents, 'quantity', oi.quantity, 'notes', oi.notes
      )), '[]'::jsonb)
      from public.order_items oi where oi.order_id = o.id
    )
  )
  into v_result
  from public.orders o
  where o.id = v_order_id;

  return v_result;
end;
$$;
