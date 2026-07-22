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

| Tabela       | Papel                                                    |
| ------------ | -------------------------------------------------------- |
| `tenants`    | Restaurantes (unidade de isolamento do SaaS).            |
| `profiles`   | Liga `auth.users` → `tenant_id` + `role`.                |
| `categories` | Seções do cardápio, por tenant.                          |
| `products`   | Itens do cardápio, por tenant. Preço em `price_cents`.   |

`user_role` (enum): `super_admin`, `owner`, `manager`, `kitchen`, `cashier`.

### Integridade multi-tenant

`products` referencia `categories` por **FK composta** `(category_id, tenant_id)`
→ `categories(id, tenant_id)`, garantindo que um produto e sua categoria
pertencem ao **mesmo tenant** no nível do banco.

## Migrations

- `0001_core_schema` — enum, tabelas, índices, triggers.
- `0002_rls_policies` — RLS + funções auxiliares (ver `security.md`).
- `0003_harden_function_search_path` — `search_path` imutável nas funções.

## Seed

`supabase/seed.sql` (idempotente): tenant `gordinho`, 4 categorias e 8 produtos.
Fotos ficam nulas nesta fase (placeholder gráfico na UI); imagens reais entram
na Fase 1 via Supabase Storage.

## Regeneração de tipos

Após mudanças de schema, regenerar `types/database.types.ts`
(MCP `generate_typescript_types` ou `supabase gen types`). Manter o alias
`UserRole` ao final do arquivo.

## Pendência conhecida

Tabela órfã `public.atualizar` (experimento anterior, 0 linhas) pode ser
removida com `drop table public.atualizar;` no painel.
