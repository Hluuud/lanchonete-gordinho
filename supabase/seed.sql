-- =============================================================================
-- Seed — Lanchonete do Gordinho (tenant inicial). Idempotente.
-- Recria o cardápio do tenant a cada execução.
-- =============================================================================

do $$
declare
  v_tenant      uuid;
  v_lanches     uuid;
  v_porcoes     uuid;
  v_bebidas     uuid;
  v_sobremesas  uuid;
begin
  insert into public.tenants (slug, name)
  values ('gordinho', 'Lanchonete do Gordinho')
  on conflict (slug) do update set name = excluded.name
  returning id into v_tenant;

  -- Idempotência: limpa o cardápio antes de recriar.
  delete from public.products where tenant_id = v_tenant;
  delete from public.categories where tenant_id = v_tenant;

  insert into public.categories (tenant_id, name, slug, sort_order)
  values (v_tenant, 'Lanches', 'lanches', 1) returning id into v_lanches;
  insert into public.categories (tenant_id, name, slug, sort_order)
  values (v_tenant, 'Porções', 'porcoes', 2) returning id into v_porcoes;
  insert into public.categories (tenant_id, name, slug, sort_order)
  values (v_tenant, 'Bebidas', 'bebidas', 3) returning id into v_bebidas;
  insert into public.categories (tenant_id, name, slug, sort_order)
  values (v_tenant, 'Sobremesas', 'sobremesas', 4) returning id into v_sobremesas;

  insert into public.products
    (tenant_id, category_id, name, description, price_cents, prep_time_minutes, is_featured, is_new, sort_order)
  values
    (v_tenant, v_lanches, 'X-Gordinho',
      'Hambúrguer 180g, cheddar duplo, bacon, alface e maionese da casa', 3290, 20, true, false, 1),
    (v_tenant, v_lanches, 'X-Salada',
      'Hambúrguer 150g, queijo, alface, tomate e cebola', 2690, 18, false, false, 2),
    (v_tenant, v_lanches, 'X-Bacon Duplo',
      'Dois hambúrgueres 120g, muito bacon e cheddar cremoso', 3690, 22, false, true, 3),
    (v_tenant, v_porcoes, 'Batata Frita',
      'Porção de batata crocante com sal e orégano', 1890, 15, false, false, 1),
    (v_tenant, v_porcoes, 'Batata com Cheddar e Bacon',
      'Batata coberta com cheddar cremoso e bacon crocante', 2490, 17, true, false, 2),
    (v_tenant, v_bebidas, 'Coca-Cola Lata 350ml',
      'Refrigerante gelado', 690, 2, false, false, 1),
    (v_tenant, v_bebidas, 'Suco de Laranja 500ml',
      'Suco natural da fruta', 990, 5, false, false, 2),
    (v_tenant, v_sobremesas, 'Milkshake de Chocolate',
      'Milkshake cremoso 400ml com calda de chocolate', 1790, 8, false, true, 1);
end $$;

-- =============================================================================
-- Seed — Pedidos de exemplo (Painel da Cozinha, Sprint 2). Idempotente.
-- Cobre as 6 colunas do board, retirada/entrega, prioridade e um pedido
-- propositalmente atrasado (para exercitar o filtro "Em atraso").
-- Sem checkout real ainda: isso é só dado de demonstração (ver BACKLOG.md).
-- =============================================================================

do $$
declare
  v_tenant uuid;
  v_order  uuid;
begin
  select id into v_tenant from public.tenants where slug = 'gordinho';

  delete from public.order_items where tenant_id = v_tenant;
  delete from public.orders where tenant_id = v_tenant;

  -- Sprint 3: order_number não é mais atribuído por trigger — o seed atribui
  -- explicitamente (1-10) e sincroniza order_counters no final, para que o
  -- próximo pedido real criado via create_order continue a sequência do dia
  -- corretamente (sem colidir com estas senhas de demonstração).

  -- A: novo pedido, retirada, recém-chegado.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, subtotal_cents, created_at, estimated_ready_at)
  values
    (v_tenant, 1, 'new', 'pickup', 'Ana Souza', 3290, now() - interval '3 minutes', now() + interval '17 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'X-Gordinho'), 'X-Gordinho', 3290, 1);

  -- B: novo pedido, entrega, com observação.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, customer_phone, notes, subtotal_cents, created_at, estimated_ready_at)
  values
    (v_tenant, 2, 'new', 'delivery', 'Carlos Lima', '(11) 91234-5678', 'Sem cebola', 6070, now() - interval '1 minutes', now() + interval '25 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'X-Salada'), 'X-Salada', 2690, 2),
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Coca-Cola Lata 350ml'), 'Coca-Cola Lata 350ml', 690, 1);

  -- C: aceito, retirada.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, subtotal_cents, created_at, accepted_at, estimated_ready_at)
  values
    (v_tenant, 3, 'accepted', 'pickup', 'Fernanda Alves', 2880, now() - interval '9 minutes', now() - interval '4 minutes', now() + interval '11 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Batata Frita'), 'Batata Frita', 1890, 1),
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Suco de Laranja 500ml'), 'Suco de Laranja 500ml', 990, 1);

  -- D: aceito, entrega, prioridade.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, is_priority, subtotal_cents, created_at, accepted_at, estimated_ready_at)
  values
    (v_tenant, 4, 'accepted', 'delivery', 'Roberto Dias', true, 6180, now() - interval '6 minutes', now() - interval '2 minutes', now() + interval '14 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'X-Bacon Duplo'), 'X-Bacon Duplo', 3690, 1),
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Batata com Cheddar e Bacon'), 'Batata com Cheddar e Bacon', 2490, 1);

  -- E: em preparo, ATRASADO (estimated_ready_at no passado) — exercita o filtro "Em atraso".
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, subtotal_cents, created_at, accepted_at, preparing_at, estimated_ready_at)
  values
    (v_tenant, 5, 'preparing', 'pickup', 'Juliana Prado', 6580, now() - interval '15 minutes', now() - interval '13 minutes', now() - interval '10 minutes', now() - interval '2 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'X-Gordinho'), 'X-Gordinho', 3290, 2);

  -- F: em preparo, entrega, prioridade.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, is_priority, subtotal_cents, created_at, accepted_at, preparing_at, estimated_ready_at)
  values
    (v_tenant, 6, 'preparing', 'delivery', 'Marcos Vinicius', true, 4480, now() - interval '10 minutes', now() - interval '9 minutes', now() - interval '7 minutes', now() + interval '8 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'X-Salada'), 'X-Salada', 2690, 1),
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Milkshake de Chocolate'), 'Milkshake de Chocolate', 1790, 1);

  -- G: pronto, retirada.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, subtotal_cents, created_at, accepted_at, preparing_at, ready_at, estimated_ready_at)
  values
    (v_tenant, 7, 'ready', 'pickup', 'Patrícia Gomes', 1890, now() - interval '22 minutes', now() - interval '20 minutes', now() - interval '18 minutes', now() - interval '1 minutes', now() - interval '2 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Batata Frita'), 'Batata Frita', 1890, 1);

  -- H: entregue, entrega.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, subtotal_cents, created_at, accepted_at, preparing_at, ready_at, delivered_at)
  values
    (v_tenant, 8, 'delivered', 'delivery', 'Diego Martins', 4380, now() - interval '40 minutes', now() - interval '38 minutes', now() - interval '35 minutes', now() - interval '10 minutes', now() - interval '3 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'X-Bacon Duplo'), 'X-Bacon Duplo', 3690, 1),
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Coca-Cola Lata 350ml'), 'Coca-Cola Lata 350ml', 690, 1);

  -- I: cancelado, retirada.
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, subtotal_cents, created_at, cancelled_at, cancelled_reason)
  values
    (v_tenant, 9, 'cancelled', 'pickup', 'Sem retorno', 2690, now() - interval '25 minutes', now() - interval '20 minutes', 'Cliente não compareceu para retirada')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'X-Salada'), 'X-Salada', 2690, 1);

  -- J: novo pedido, entrega, recém-chegado (menos de 1 minuto — exercita o rótulo "agora").
  insert into public.orders
    (tenant_id, order_number, status, order_type, customer_name, subtotal_cents, created_at, estimated_ready_at)
  values
    (v_tenant, 10, 'new', 'delivery', 'Marina Ribeiro', 2780, now() - interval '30 seconds', now() + interval '20 minutes')
  returning id into v_order;
  insert into public.order_items (order_id, tenant_id, product_id, product_name_snapshot, unit_price_cents, quantity)
  values
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Milkshake de Chocolate'), 'Milkshake de Chocolate', 1790, 1),
    (v_order, v_tenant, (select id from public.products where tenant_id = v_tenant and name = 'Suco de Laranja 500ml'), 'Suco de Laranja 500ml', 990, 1);

  -- Sincroniza o contador atômico com as senhas de demonstração acima, para
  -- que o próximo create_order() real continue a partir de 11 hoje.
  insert into public.order_counters (tenant_id, counter_date, last_number)
  values (v_tenant, current_date, 10)
  on conflict (tenant_id, counter_date)
  do update set last_number = greatest(public.order_counters.last_number, 10);
end $$;
