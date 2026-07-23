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
| `tenants`      | Restaurantes (unidade de isolamento do SaaS). Campos de configuração operacional (Sprint 5, Fase 5). |
| `profiles`     | Liga `auth.users` → `tenant_id` + `role`.                        |
| `categories`   | Seções do cardápio, por tenant. Campos de gestão (Sprint 5): `icon`, `color`, `is_available`. |
| `products`     | Itens do cardápio, por tenant. Preço em `price_cents`. Campos de gestão (Sprint 5): `promo_price_cents`, `sku`, `is_bestseller`, `ingredients`, `allergens`, `tags`, `nutritional_info`. |
| `orders`       | Pedidos, por tenant. Ver seção dedicada.                         |
| `order_items`  | Itens de um pedido — snapshot de nome/preço, imutável após criar.|
| `order_counters` | Contador atômico de "senha", por tenant/dia (Sprint 3).        |
| `order_tracking_status` | Espelho de `orders` sem PII, para acompanhamento público (Sprint 3). |
| `modifier_groups` | Grupos de adicionais reutilizáveis por tenant (Sprint 5, Fase 3). Staff-only. |
| `modifier_options` | Opções de um grupo de adicionais (Sprint 5, Fase 3). Staff-only. |
| `product_modifier_groups` | Vínculo N:N entre produtos e grupos de adicionais (Sprint 5, Fase 3). Staff-only. |
| `combos` | Combos: produto principal fixo + slots de escolha (Sprint 5, Fase 4). Staff-only. |
| `combo_slots` | Slots de escolha de um combo (ex. "Escolha uma bebida"), Fase 4. Staff-only. |
| `combo_slot_products` | Produtos elegíveis de um slot de combo, Fase 4. Staff-only. |

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

### Adicionais (Sprint 5, Fase 3)

`modifier_groups` pertence ao **tenant**, não a um produto — reutilizável
entre vários produtos via `product_modifier_groups` (N:N). Cada grupo tem
`selection_type` (`single`/`multiple`), `min_selections`/`max_selections`
(checks garantem `min ≤ max` e `single → max ≤ 1`) e `is_required`.
`modifier_options` pertence a um grupo (FK composta `(group_id, tenant_id)`,
`on delete cascade`). O vínculo produto↔grupo também é `on delete cascade`
dos dois lados — apagar um grupo só desvincula produtos, nunca apaga
produtos; apagar um produto só desvincula grupos, nunca apaga grupos
(diferente de categorias→produtos, aqui não há necessidade de proteção
contra exclusão).

**RLS staff-only** (`is_tenant_staff` para leitura, `is_tenant_manager`
para escrita) — **sem policy pública** ainda, porque o storefront não
consome isso nesta sprint (só modelagem/CRUD administrativo; o cliente não
escolhe adicionais ao pedir — ver BACKLOG e o plano da Sprint 5).

A camada de serviço (`services/admin/modifiers.service.ts`) usa uma
estratégia de **substituição completa** para as opções de um grupo e para
os vínculos de um produto (`replaceModifierOptions`/
`setProductModifierGroups` em `repositories/modifiers.repository.ts`):
apaga tudo e reinsere do zero a cada save, em vez de diff/upsert — seguro
porque nenhuma outra tabela referencia `modifier_options`/
`product_modifier_groups` ainda.

### Combos (Sprint 5, Fase 4)

Estrutura: `combos.main_product_id` (nullable, FK composta a `products`,
`on delete cascade` — sem o produto principal o combo não faz sentido,
mesma filosofia de "sem referência pendurada" do resto do schema) é o
"Produto Principal" fixo; `combo_slots` modela as escolhas ("Escolha uma
bebida"), cada slot com `min_selections`/`max_selections`/`is_required`
(mesmos checks de `modifier_groups`); `combo_slot_products` lista os
produtos elegíveis por slot, com `price_override_cents` opcional
(sobrescreve o preço normal do produto dentro do combo). `combos.price_cents`
nullable: `null` = preço calculado (principal + seleções, sem cálculo real
implementado ainda — fica para o checkout da Sprint 6), valor = preço fixo.

Mesma decisão de escopo dos Adicionais (0014): **RLS staff-only, sem
policy pública** — modelagem/CRUD administrativo apenas, o cliente ainda
não compra combos. Mesma estratégia de substituição completa
(`replaceComboSlots`, `repositories/combos.repository.ts`) para
slots+produtos a cada save.

### Configuração operacional do tenant (Sprint 5, Fase 5)

`tenants` ganha campos de identidade/contato/aparência/horário
(`phone`, `whatsapp`, `instagram`, `facebook`, `address`, `logo_url`,
`banner_url`, `promo_banner_url`, `primary_color`, `secondary_color`,
`welcome_message`, `closing_message`, `avg_prep_time_minutes`,
`store_mode`, `business_hours`). `store_mode` (`check`:
`open|closed|vacation|maintenance`) controla o badge Aberto/Fechado
independente do horário. `business_hours` (`jsonb`) usa o mesmo formato
já validado em `features/menu/store-info.ts` (Sprint 4): chaves `"0"`–`"6"`
(`Date#getDay()`, domingo primeiro), `{open,close}` em `"HH:MM"` ou `null`
(fechado o dia todo).

**RLS**: a policy `tenants_write_super_admin` (0002) restringia *toda*
escrita a `super_admin` — correta para `slug`/`is_active`
(provisionamento da plataforma), errada para estes campos operacionais,
que o dono/gerente precisa editar no dia a dia. `0019_tenant_config_rls.sql`
adiciona uma policy de `UPDATE` para `is_tenant_manager` (RLS combina
policies permissivas do mesmo comando com OR) **e** um trigger
(`protect_tenant_platform_fields`) que bloqueia alteração de `slug`/
`is_active` por quem não é `super_admin` — proteção por coluna que RLS
sozinha não oferece.

**Storefront**: a conexão do badge Aberto/Fechado
(`features/menu/components/store-open-badge.tsx`) e do tempo médio de
preparo a este dado real fica registrada no BACKLOG — o backend já está
pronto (`getAdminStoreSettings`), falta só o encanamento de props na
loja pública.

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

### Usuários (Sprint 5, Fase 6)

`profiles` ganha `email` (espelho de `auth.users.email`, escrito no convite
— RLS não alcança o schema `auth`, evita `join` em toda leitura) e
`is_active` (desativação lógica — `profiles.id` referencia `auth.users` com
`on delete cascade`, então "excluir" apagaria a conta de autenticação; ver
`0021_profiles_email.sql`/`0022_profiles_is_active.sql`).
`lib/auth/session.ts#getCurrentUser` trata um perfil `is_active = false`
como "sem perfil" — bloqueia todas as áreas guardadas (admin, cozinha) sem
precisar tocar na sessão do Supabase Auth.

Enum `user_role` ganha `'waiter'` (garçom) — `0020_add_waiter_role.sql`,
isolada em migration própria (Postgres não permite usar um valor de enum
recém-criado na mesma transação em que foi adicionado, mesmo padrão de
`0006`).

**Convite**: novo usuário é criado via Supabase Admin API
(`auth.admin.inviteUserByEmail`, `services/admin/users.service.ts`) — ver
[ADR 0009](./adr/0009-admin-api-user-invites.md). `super_admin` não é
atribuível por este fluxo (`ASSIGNABLE_ROLES` em
`features/admin/users/schema.ts`) — papel de plataforma, provisionamento
continua manual.

**Achado de segurança corrigido nesta fase**: a policy `profiles_update_self`
(0002) só garantia `id = auth.uid()` no `with check`, sem restringir quais
colunas mudam — um usuário autenticado comum podia alterar o próprio `role`
ou `tenant_id` direto via update, sem passar por nenhuma rota de API
(auto-escalação de privilégio pré-existente, não introduzida por esta
sprint). `0023_protect_profile_privileged_fields.sql` fecha o buraco com um
trigger que bloqueia mudança de `role`/`tenant_id`/`is_active` por quem não
é `is_tenant_manager`/`is_super_admin` do tenant — mesmo padrão já usado em
`0019` para `tenants`.

### Impressoras (Sprint 5, Fase 8)

`printers` (nova tabela): `name`, `role` (`kitchen|cashier|counter`),
`connection_type` (`usb|network|bluetooth`), `paper_width` (`58mm|80mm`),
`protocol` (default `'escpos'`), `ip_address` (`inet`, nullable), `port`,
`model`, `auto_print`, `allow_reprint`, `is_active`. `role`/
`connection_type`/`paper_width` usam `text` + `check` em vez de enum
Postgres — mesmo critério de `tenants.store_mode`: valores fechados o
suficiente para `check`, sem a rigidez de uma migration isolada por opção
nova. **Só persistência de configuração** — sem execução real de impressão
(ESC/POS) nesta fase, ver `docs/printing.md`.

**RLS**: leitura por qualquer staff do tenant (`is_tenant_staff` — cozinha/
caixa vão precisar ler isso quando a impressão real existir), escrita só
gestão (`is_tenant_manager`) — mesmo formato de `combos_select`/
`combos_write` (0017).

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
- `0014_product_modifiers` — cria `modifier_groups`, `modifier_options`,
  `product_modifier_groups` + enum `modifier_selection_type`. Sprint 5,
  Fase 3.
- `0015_product_modifiers_rls` — RLS staff-only das três tabelas acima
  (sem policy pública). Sprint 5, Fase 3.
- `0016_combos` — cria `combos`, `combo_slots`, `combo_slot_products`.
  Sprint 5, Fase 4.
- `0017_combos_rls` — RLS staff-only das três tabelas acima. Sprint 5,
  Fase 4.
- `0018_tenant_store_config` — `tenants` ganha campos de configuração
  operacional (identidade, contato, aparência, horário, modo da loja).
  Sprint 5, Fase 5.
- `0019_tenant_config_rls` — policy de `UPDATE` para `is_tenant_manager`
  + trigger protegendo `slug`/`is_active` de quem não é `super_admin`.
  Sprint 5, Fase 5.
- `0020_add_waiter_role` — enum `user_role` ganha `'waiter'`. Sprint 5,
  Fase 6.
- `0021_profiles_email` — `profiles` ganha `email` (espelho de
  `auth.users.email`, escrito no convite). Sprint 5, Fase 6.
- `0022_profiles_is_active` — `profiles` ganha `is_active` (desativação
  lógica). Sprint 5, Fase 6.
- `0023_protect_profile_privileged_fields` — trigger bloqueando
  auto-alteração de `role`/`tenant_id`/`is_active` por quem não é gestão do
  tenant (corrige achado de segurança pré-existente). Sprint 5, Fase 6.
- `0024_printers` — cria `printers`. Sprint 5, Fase 8.
- `0025_printers_rls` — RLS leitura-staff/escrita-gestão. Sprint 5, Fase 8.

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
