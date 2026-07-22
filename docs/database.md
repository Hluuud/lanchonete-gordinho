# Banco de dados

Postgres (Supabase). Projeto: `lanchonete-gordinho` (`gnnitmceayovzgkdxrkl`,
região `sa-east-1`). Migrations versionadas em `supabase/migrations/`.

## Convenções

- **Multi-tenant:** toda tabela de domínio tem `tenant_id` (FK → `tenants`).
- **Dinheiro em centavos** (`integer`), nunca `float`. Formatação só na UI.
- **UUID** como PK (`gen_random_uuid()`).
- `created_at` / `updated_at` (`timestamptz`); `updated_at` via trigger
  `set_updated_at()`.
- Índices por `tenant_id` (e `category_id` em `products`).
- Nenhuma alteração destrutiva: mudanças estruturais via novas migrations.

## Tabelas

| Tabela         | Papel                                                            |
| -------------- | ----------------------------------------------------------------- |
| `tenants`      | Restaurantes (unidade de isolamento do SaaS).                    |
| `profiles`     | Liga `auth.users` → `tenant_id` + `role`.                        |
| `categories`   | Seções do cardápio, por tenant.                                  |
| `products`     | Itens do cardápio, por tenant. Preço em `price_cents`.           |
| `orders`       | Pedidos (Painel da Cozinha), por tenant. Ver seção dedicada.     |
| `order_items`  | Itens de um pedido — snapshot de nome/preço, imutável após criar.|

`user_role` (enum): `super_admin`, `owner`, `manager`, `kitchen`, `cashier`.

### `orders` / `order_items` (Sprint 2)

- `order_status` (enum): `new → accepted → preparing → ready → delivered →
  completed`, mais `cancelled` (possível até `ready`). Máquina de estados
  centralizada em `lib/kitchen/order-status.ts` — nunca decidida só pelo
  schema.
- `order_type` (enum): `pickup`, `delivery`.
- **`order_number`** ("senha"): atribuído por trigger (`assign_order_number`,
  `0004_orders_schema`) — `coalesce(max(order_number), 0) + 1`, filtrado por
  `tenant_id` e o dia (`created_at::date`). **Limitação conhecida:** sob
  concorrência real (múltiplos caixas inserindo simultaneamente) há uma
  janela de corrida entre o `select` e o `insert` — aceitável para o volume
  atual (seed/uma lanchonete); ver `BACKLOG.md` para a solução definitiva
  (tabela de contador dedicada + lock) quando o checkout real chegar.
- `order_items.product_id` é **nullable, `on delete set null`**: o snapshot
  (`product_name_snapshot`, `unit_price_cents`) sobrevive à remoção do
  produto original do cardápio.
- FK composta `(order_id, tenant_id)` → `orders(id, tenant_id)` e
  `(product_id, tenant_id)` → `products(id, tenant_id)` — mesmo padrão de
  `products`/`categories` (0001), garantindo consistência de tenant entre
  tabelas relacionadas. Exigiu adicionar `unique (id, tenant_id)` em
  `products` (não existia antes — só `categories` tinha, aditivo, não
  destrutivo).
- Itens são **imutáveis após a criação** nesta fase (sem edição de pedido) —
  ver [ADR 0003](./adr/0003-kitchen-realtime-state-model.md).
- `estimated_ready_at` não é calculado automaticamente ainda (não existe
  fluxo real de criação de pedido) — populado diretamente no seed;
  automatizar isso (a partir do `prep_time_minutes` dos itens) é escopo da
  sprint de Checkout.

### Integridade multi-tenant

`products` referencia `categories` por **FK composta** `(category_id, tenant_id)`
→ `categories(id, tenant_id)`, garantindo que um produto e sua categoria
pertencem ao **mesmo tenant** no nível do banco.

## Migrations

- `0001_core_schema` — enum, tabelas, índices, triggers.
- `0002_rls_policies` — RLS + funções auxiliares (ver `security.md`).
- `0003_harden_function_search_path` — `search_path` imutável nas funções.
- `0004_orders_schema` — `orders`/`order_items`, enums `order_status`/
  `order_type`, trigger de `order_number`, `unique (id, tenant_id)` em
  `products`.
- `0005_orders_rls` — RLS de `orders`/`order_items` + helper `is_tenant_staff`.

## Seed

`supabase/seed.sql` (idempotente): tenant `gordinho`, 4 categorias, 8
produtos, e 10 pedidos de exemplo cobrindo as 6 colunas do Painel da
Cozinha, retirada/entrega, prioridade e um pedido propositalmente atrasado
(ver `docs/kitchen-panel.md`). Sem checkout real ainda — pedidos são só
dado de demonstração. Fotos ficam nulas nesta fase (placeholder gráfico na
UI); imagens reais entram na Fase 1 via Supabase Storage.

## Regeneração de tipos

Após mudanças de schema, regenerar `types/database.types.ts`
(MCP `generate_typescript_types` ou `supabase gen types`). Manter o alias
`UserRole` ao final do arquivo.

## Pendência conhecida

Tabela órfã `public.atualizar` (experimento anterior, 0 linhas) pode ser
removida com `drop table public.atualizar;` no painel.
