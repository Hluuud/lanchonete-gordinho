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
