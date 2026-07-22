# Arquitetura

Plataforma SaaS multi-restaurante de gestão de pedidos. Este documento descreve
a arquitetura estabelecida na **Fase 0 (Fundação)** e evoluída na
**Sprint 1 (Experiência da Loja)** — ver seção dedicada abaixo.

## Princípios

- **Multi-tenant desde o dia 1.** Um único Postgres, schema compartilhado, coluna
  `tenant_id` em toda tabela de domínio, isolamento por RLS. Um restaurante
  (Gordinho) hoje; dezenas/centenas depois, sem migration destrutiva.
- **Camadas estritas e baixo acoplamento.** A UI depende de tipos de domínio,
  nunca do formato do banco.
- **Regra de negócio centralizada** na camada de serviços. A interface não decide
  regras críticas; o backend (serviços + RLS) é a fonte de verdade.

## Camadas (fluxo de dados)

```
UI (components / features)
        │  (props: tipos de domínio)
        ▼
hooks (client)  ─────────────►  services (server, regra de negócio)
        │  fetch /api                     │
        ▼                                 ▼
Route Handlers (/api)             repositories (acesso a dados)
                                          │  (SupabaseClient injetado)
                                          ▼
                                  Supabase (Postgres + RLS)
```

- **`components/`** — design system genérico e primitivos reutilizáveis
  (`ui/`, `PriceTag`, `ProductBadge`). Sem acesso a dados.
- **`features/<domínio>/`** — composição de UI por domínio (ex.: `menu/`) e
  schemas Zod compartilhados.
- **`hooks/`** — consumo de dados no client (TanStack Query). Nunca importam
  Supabase diretamente.
- **`services/`** — regra de negócio. Orquestram repositórios e mapeiam Rows do
  banco para o **domínio** (`types/domain.ts`). Marcados `server-only`.
- **`repositories/`** — **única** camada que conhece o Supabase. Recebem o client
  por injeção (testáveis).
- **`lib/`** — clients Supabase (`server`/`client`/`admin`), resolução de tenant,
  auth, validação de env.
- **`types/`** — `database.types.ts` (gerado do schema) e `domain.ts` (linguagem
  de negócio).

Regra prática: **componentes visuais nunca acessam Supabase**; sempre via
service (server) ou hook (client).

## Resolução de tenant

`lib/tenant/get-tenant-context.ts` é o **ponto único** de resolução do tenant
atual. Hoje: header `x-tenant-slug` com fallback para `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`.
Evolução para subdomínio/host é mudança localizada aqui.

## Fatia vertical (prova da Fase 0)

`app/(store)/page.tsx` (Server Component) → `services/menu.service` →
`repositories/menu.repository` + `tenant.repository` → Supabase (RLS anon).
Renderiza com o design system e Skeleton via Suspense. O mesmo domínio é
exposto em `/api/menu` para consumo client (`hooks/use-menu`).

## Route groups

- `(store)` — loja pública do cliente (guest, sem login). `/`
- `(admin)` — painel administrativo (Fase 5), protegido. `/admin`
- `(kitchen)` — painel da cozinha (Fase 2), protegido. `/cozinha`

Proteção via `lib/auth/session.ts` (`requireRole`) + RLS no banco.

## Stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript strict · Tailwind v4 ·
shadcn/ui (convenção) · TanStack Query · React Hook Form · Zod · Framer Motion ·
Supabase (Postgres/Auth/Realtime/Storage). Deploy: Vercel + GitHub Actions.

Versões: sempre a estável mais recente (ver `package.json`).

---

## Sprint 1 — Experiência da Loja (UX)

Sprint puramente visual/UX sobre a Fase 0: **nenhuma regra de negócio ou schema
mudou**. Duas decisões arquiteturais valem registro:

### `StoreExperience` é um Client Component

`app/(store)/page.tsx` continua Server Component (busca o `Menu` via
`services/menu.service`, respeitando RLS). A partir daí, `StoreExperience`
(`features/menu/components/store-experience.tsx`) recebe o `Menu` já
carregado como prop e passa a renderizar tudo — Hero, carrossel, navegação,
busca, grade de produtos — no client.

**Trade-off consciente:** isso abre mão do particionamento fino de Server/Client
Components (ex.: manter `ProductCard` server-rendered via "children passthrough").
Optamos pela solução mais simples porque o catálogo de um restaurante é pequeno
(dezenas/centenas de produtos, não milhares) — o ganho de bundle size do
particionamento fino não compensa a complexidade adicional (viola KISS/YAGNI do
`CLAUDE.md`). A busca e os filtros são 100% client-side sobre dados já
carregados no servidor — **nenhuma chamada extra ao Supabase** acontece ao
digitar ou filtrar.

### Carrinho: estado client-side em memória

`features/cart/` (`CartProvider`/`useCart`) implementa um carrinho via
`useReducer` + Context, escopado ao layout `(store)`. **Sem persistência, sem
submissão de pedido** — isso é Fase 1 (checkout). A única "regra de negócio" é
somar preços já existentes (`priceCents * quantity`), não uma regra nova.
"Adicionais" ficam fora de escopo: não existe modelo de modificador de produto
no banco ainda (chega com combos/upsell, Fase 1/6). Ver
[ADR 0002](./adr/0002-client-side-cart-state.md).

### Novos componentes de design system

`Sheet` (Radix Dialog, drawer lateral desktop) e `Drawer` (vaul, bottom sheet
mobile) — escolhidos via `useMediaQuery`. `Button` ganhou `asChild` (Radix
Slot) para compor com `<Link>`. `EmptyState` é o padrão único para carrinho
vazio, busca sem resultado, erro e "não encontrado".

---

## Sprint 2 — Painel da Cozinha

Fase 2 do roadmap. Introduz o primeiro domínio de escrita autenticada da
plataforma (`orders`/`order_items`) e o primeiro uso de Supabase Realtime.
Detalhe completo em [`docs/kitchen-panel.md`](./kitchen-panel.md); duas
decisões arquiteturais têm ADR dedicado:

- [ADR 0003](./adr/0003-kitchen-realtime-state-model.md) — estado do board
  via reducer local + Realtime híbrido (otimista, com reversão em falha).
- [ADR 0004](./adr/0004-drag-and-drop-library.md) — `@dnd-kit` para o
  drag-and-drop entre colunas.

Camadas seguem exatamente o padrão estabelecido na Fase 0
(`repository → service → route/hook`): `repositories/orders.repository.ts` →
`services/kitchen-orders.service.ts` (máquina de estados de status
centralizada em `lib/kitchen/order-status.ts`) → `app/api/kitchen/orders/*`
→ `features/kitchen/*` (Client Components). Nenhuma camada anterior
(cardápio, carrinho, tenant, auth) foi alterada.

**Testes (novo nesta sprint):** o projeto não tinha framework de teste até
aqui. Vitest foi introduzido para a lógica pura mais crítica desta sprint
(máquina de estados, formatação de tempo decorrido) — ver
`docs/conventions.md`.

---

## Sprint 3 — Checkout, Criação de Pedidos e Integração Loja → Cozinha

Fecha a Fase 1 do roadmap (checkout era a peça que faltava desde a Sprint 1
— ver `docs/roadmap.md`, novo) e conecta a loja ao Painel da Cozinha com
pedidos reais. Detalhe completo em [`docs/checkout.md`](./checkout.md); duas
decisões têm ADR dedicado:

- [ADR 0005](./adr/0005-atomic-order-number.md) — número do pedido via
  contador atômico (`order_counters` + upsert), substituindo o `MAX()+1`
  da Sprint 2 (dívida técnica eliminada).
- [ADR 0006](./adr/0006-transactional-checkout-rpc.md) — criação do pedido
  via função Postgres única (`create_order`, `SECURITY DEFINER`),
  atômica, chamada por convidados sem papel de staff.

Mesmas camadas (`repository → service → route/hook`); o mapeamento
Row→domínio (`toOrder`/`toOrderItem`) foi extraído para
`lib/kitchen/order-mapper.ts` e passou a ser compartilhado entre o Painel
da Cozinha e o Checkout (evita duplicar a mesma lógica).

**Lacuna crítica encontrada e corrigida:** nenhuma tabela estava na
publicação `supabase_realtime` do Postgres — o Realtime nunca entregou um
evento sequer neste projeto, nem para o Painel da Cozinha (Sprint 2), só não
detectado porque aquela verificação usou dados mocados. Corrigido em
`0010_realtime_publication.sql` e verificado manualmente ponta a ponta
nesta sessão (ver `docs/checkout.md`).
