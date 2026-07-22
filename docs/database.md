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
| `categories`   | Seções do cardápio, por tenant. Campos de gestão (Sprint 5): `icon`, `color`, `is_available`. |
| `products`     | Itens do cardápio, por tenant. Preço em `price_cents`. Campos de gestão (Sprint 5): `promo_price_cents`, `sku`, `is_bestseller`, `ingredients`, `allergens`, `tags`, `nutritional_info`. |
| `orders`       | Pedidos, por tenant. Ver seção dedicada.                         |
| `order_items`  | Itens de um pedido — snapshot de nome/preço, imutável após criar.|
| `order_counters` | Contador atômico de "senha", por tenant/dia (Sprint 3).        |
| `order_tracking_status` | Espelho de `orders` sem PII, para acompanhamento público (Sprint 3). |

`user_role` (enum): `super_admin`, `owner`, `manager`, `kitchen`, `cashier`.

### `orders` / `order_items`

- `order_status` (enum): `new → accepted → preparing → ready → delivered →
  completed`, mais `cancelled` (possível até `ready`). Máquina de estados
  centralizada em `lib/kitchen/order-status.ts` — nunca decidida só pelo
  schema.
- `order_type` (enum): `pickup`, `delivery`, `dine_in` (Sprint 3 —
  "consumo no local", sem campo de mesa ainda).
- **`order_number`** ("senha"): atribuído atomicamente dentro de
  `create_order` (Sprint 3) via `order_counters` — ver
  [ADR 0005](./adr/0005-atomic-order-number.md). `not null`, sem trigger
  associada (a trigger `assign_order_number` da Sprint 2, que tinha uma
  race condition de `MAX()+1`, foi removida em `0007`).
- `service_fee_cents`, `discount_cents`, `coupon_code` (Sprint 3):
  arquitetura preparada para taxa de serviço/cupom — sempre `0`/`null` por
  ora, sem lógica real. `Order.totalCents` é computado no domínio
  (`subtotalCents + serviceFeeCents - discountCents`), não armazenado.
- `order_items.product_id` é **nullable, `on delete set null`**: o snapshot
  (`product_name_snapshot`, `unit_price_cents`) sobrevive à remoção do
  produto original do cardápio.
- FK composta `(order_id, tenant_id)` → `orders(id, tenant_id)` e
  `(product_id, tenant_id)` → `products(id, tenant_id)` — mesmo padrão de
  `products`/`categories` (0001), garantindo consistência de tenant entre
  tabelas relacionadas. Exigiu adicionar `unique (id, tenant_id)` em
  `products` (não existia antes — só `categories` tinha, aditivo, não
  destrutivo).
- Itens são **imutáveis após a criação** (sem edição de pedido) — ver
  [ADR 0003](./adr/0003-kitchen-realtime-state-model.md).
- `estimated_ready_at` é calculado dentro de `create_order` a partir do
  maior `prep_time_minutes` entre os itens do pedido (não a soma — itens
  preparam em paralelo).

### `order_counters` (Sprint 3)

`(tenant_id, counter_date, last_number)`, PK composta. Sem nenhuma policy de
RLS — só a função `create_order` (`SECURITY DEFINER`) e `service_role` a
tocam; não é consultada em nenhum outro lugar da aplicação. Ver
[ADR 0005](./adr/0005-atomic-order-number.md) para o mecanismo de
incremento atômico (`insert ... on conflict do update`).

### `order_tracking_status` (Sprint 3)

Espelho de `orders` **sem PII** (sem `customer_name`/`customer_phone`/
`notes`/`cancelled_reason`), sincronizado por trigger
(`sync_order_tracking_status`, `after insert or update on orders`). Existe
porque a página pública de acompanhamento (`/pedido/[id]`) precisa de
Realtime, e Realtime só funciona em tabelas reais (não views) e respeita
RLS por linha inteira (não por coluna) — uma policy pública direto em
`orders` vazaria PII de todos os pedidos. Ver
[ADR 0006](./adr/0006-transactional-checkout-rpc.md) e `docs/security.md`.

### `categories` — campos de gestão (Sprint 5, Fase 1)

`icon` (nome de ícone lucide) e `color` (hex) são puramente cosméticos. O
par `is_active`/`is_available` espelha exatamente `is_published`/
`is_available` de `products`: `is_active` = aparece no cardápio,
`is_available` = pode ser pedida agora. Exclusão é bloqueada pela camada de
serviço (`services/admin/categories.service.ts`) quando a categoria ainda
tem produtos — o FK `products.category_id → categories.id` é `on delete
cascade` (existente desde `0001`, não alterado), então apagar sem essa
proteção apagaria os produtos junto.

### `products` — campos de gestão (Sprint 5, Fase 2)

`promo_price_cents` (nullable, `check` garante que é sempre menor que
`price_cents` quando presente), `sku` (único por tenant via índice parcial
`products_tenant_sku_key`, permite múltiplos produtos sem SKU), `is_bestseller`
("mais vendido" — flag manual nesta sprint; calcular de vendas reais é
BACKLOG), `ingredients`/`allergens`/`tags` (`text[]`, texto livre por item,
sem taxonomia compartilhada — decisão de escopo da Sprint 5), e
`nutritional_info` (`jsonb`, reservado/não exposto na UI ainda — mesmo
tratamento do campo `rating` no domínio: slot preparado, sem dado real).

O tipo de domínio `Product` (vitrine pública) **não muda** — os campos
novos só existem em `AdminProduct` (`types/domain.ts`), consumido
exclusivamente pelo Painel Administrativo.

### Storage (Sprint 5)

Bucket público `store-assets` (`storage.buckets`), primeira vez que o
projeto usa Supabase Storage — ver
[ADR 0008](./adr/0008-supabase-storage-for-media.md). Convenção de path:
`{tenant_id}/products/{uuid}.{ext}`, `{tenant_id}/branding/{uuid}.{ext}`.
RLS em `storage.objects`: leitura pública; escrita (`insert`/`update`/
`delete`) restrita a `is_tenant_manager` do tenant dono do primeiro
segmento do path (`(storage.foldername(name))[1]`), ou `is_super_admin()`
— mesmo formato de `categories_write`/`products_write`, só que o
`tenant_id` vem do path em vez de uma coluna.

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
- `0006_checkout_order_creation` — enum `order_type` ganha `dine_in`
  (isolado em migration própria — Postgres não permite usar um valor de
  enum recém-criado na mesma transação em que foi adicionado).
- `0007_checkout_order_creation_schema` — `order_counters`,
  `order_tracking_status` + trigger de sincronização, remove a trigger de
  `order_number` da Sprint 2, adiciona `service_fee_cents`/`discount_cents`/
  `coupon_code`, cria a função `create_order`.
- `0008_checkout_rls` — RLS pública de `order_tracking_status` e
  `order_items`.
- `0009_create_order_coupon_code_fix` — corrige `create_order` (esquecia
  `coupon_code` no retorno `jsonb`) via `create or replace function`, sem
  editar `0007`.
- `0010_realtime_publication` — adiciona `orders` e `order_tracking_status`
  à publicação `supabase_realtime` (nenhuma tabela estava publicada até
  então — ver `docs/checkout.md`, "Lacuna crítica").
- `0011_store_assets_bucket` — cria o bucket `store-assets` e as policies de
  Storage (Sprint 5, Fase 0 — ver ADR 0008).
- `0012_categories_admin_fields` — `categories` ganha `icon`, `color`,
  `is_available` (Sprint 5, Fase 1). Nenhuma mudança de RLS.
- `0013_products_admin_fields` — `products` ganha `promo_price_cents`
  (com `check`), `sku` (único parcial por tenant), `is_bestseller`,
  `ingredients`/`allergens`/`tags` (`text[]`), `nutritional_info` (`jsonb`,
  reservado). Sprint 5, Fase 2. Nenhuma mudança de RLS.

## Seed

`supabase/seed.sql` (idempotente): tenant `gordinho`, 4 categorias, 8
produtos, e 10 pedidos de exemplo cobrindo as 6 colunas do Painel da
Cozinha, retirada/entrega, prioridade e um pedido propositalmente atrasado
(ver `docs/kitchen-panel.md`). `order_number` é atribuído explicitamente
(1-10) e `order_counters` é sincronizado ao final (`last_number = 10`) para
que o próximo pedido real criado via `create_order` continue a sequência
sem colidir. Sem checkout real além do seed — pedidos de exemplo continuam
sendo dado de demonstração; pedidos reais (via `/checkout`) coexistem com
eles. Fotos ficam nulas nesta fase (placeholder gráfico na UI); imagens
reais entram via Supabase Storage.

## Regeneração de tipos

Após mudanças de schema, regenerar `types/database.types.ts`
(MCP `generate_typescript_types` ou `supabase gen types`). Manter o alias
`UserRole` ao final do arquivo.

## Pendência conhecida

Tabela órfã `public.atualizar` (experimento anterior, 0 linhas) pode ser
removida com `drop table public.atualizar;` no painel.
