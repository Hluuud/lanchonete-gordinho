-- =============================================================================
-- 0009 — Corrige create_order (0007): o jsonb retornado esquecia
-- `coupon_code`, resultando em `undefined` (não `null`) no client TypeScript
-- ao ler o campo ausente. Redefine a função (create or replace) em vez de
-- editar 0007, seguindo a convenção do projeto (nunca alterar migration já
-- aplicada).
-- =============================================================================

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
    'discount_cents', o.discount_cents, 'coupon_code', o.coupon_code, 'is_priority', o.is_priority,
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
