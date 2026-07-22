# Convenções

## Estrutura de pastas

```
app/            rotas (App Router): (store) (admin) (kitchen) api
components/     design system genérico  (ui/ + primitivos)
features/       módulos por domínio (UI + schema Zod)
hooks/          consumo de dados no client (TanStack Query)
services/       regra de negócio (server-only)
repositories/   acesso a dados (única camada com Supabase)
lib/            supabase clients, tenant, auth, env
types/          database.types.ts (gerado) + domain.ts
utils/          utilitários puros
styles/         tokens/tema global (Tailwind v4)
supabase/       migrations + seed
docs/           documentação + ADRs
```

## Camadas — regra de ouro

Componentes visuais **nunca** acessam Supabase. Sempre:
`UI → hook (client) / service (server) → repository → Supabase`.

## Nomenclatura

- Arquivos: `kebab-case` (`menu.service.ts`, `product-card.tsx`).
- Componentes React: `PascalCase`. Hooks: `useX`.
- Repositórios: `find*` (leitura) / `create*` `update*` `delete*` (escrita).
- Services: verbo de negócio (`getMenuByTenantSlug`).

## Domínio vs. banco

Rows do Supabase (`snake_case`) são mapeadas para tipos de domínio
(`camelCase`, `types/domain.ts`) na camada de serviço. A UI só conhece domínio.

## Dinheiro

Sempre `price_cents` (inteiro). Formatação via `utils/format.ts`
(`formatCentsToBRL`) apenas na borda de UI (`PriceTag`).

## Estilo e qualidade

- TypeScript **strict**. Sem `any` implícito.
- Prettier (`prettier-plugin-tailwindcss` ordena classes). ESLint (`next`).
- Comentários explicam **por quê**, não o óbvio.
- Acessibilidade: contraste AA, foco visível, `aria-*`, HTML semântico.

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `format` / `format:check`.

## shadcn/ui

`components.json` configurado (Tailwind v4, css `styles/globals.css`, alias
`@/*`). Novos componentes: `npx shadcn@latest add <componente>`.

## Migrations

Nunca editar migrations já aplicadas — sempre adicionar uma nova. Toda mudança
de schema regenera `types/database.types.ts`.

## Estado controlado (client)

Componentes de input que participam de lógica derivada (busca, filtros) são
**controlados pelo pai** (`value`/`onChange`), sem estado interno duplicado —
evita dessincronia quando o pai precisa resetar (ex.: `SearchBar`). Debounce é
responsabilidade de quem consome o valor (`useDebounce`), não do input em si.

## APIs de navegador (matchMedia, online/offline)

Assinar APIs externas ao React via `useSyncExternalStore`, não
`useEffect` + `useState` — evita um render extra e satisfaz a regra de lint
`react-hooks/set-state-in-effect`. Ver `hooks/use-media-query.ts` e
`components/offline-banner.tsx`. Vale também para leituras pontuais de
`localStorage` corrigidas após o mount (ex.: `lib/kitchen/notification-sound.ts`
+ `features/kitchen/components/kitchen-header.tsx`) — não só para valores que
mudam continuamente.

Exceção deliberada: assinaturas que precisam disparar efeitos colaterais
assíncronos a cada evento (fetch, toast, som) — não apenas sincronizar um
valor lido — usam `useEffect` tradicional (ex.: `use-kitchen-realtime.ts`).
`useSyncExternalStore` exige que `getSnapshot` seja puro; forçar um caso
assim nesse hook seria a abstração errada. Ver
[ADR 0003](./adr/0003-kitchen-realtime-state-model.md).

## Testes

Vitest (`vitest.config.ts`, script `test`/`test:watch`). Por ora, cobre só
lógica pura server/client-agnóstica (máquinas de estado, formatters,
mapeamento de erros) — sem Testing Library/DOM ainda. Exemplos:
`lib/kitchen/order-status.test.ts`, `utils/format.test.ts`,
`lib/checkout/error-messages.test.ts`. Ao introduzir testes de componente,
adicionar `@testing-library/react` + ambiente `jsdom` neste momento, não
antes (evita dependência não utilizada).

`import "server-only"` precisa de alias no Vitest (`server-only` →
`node_modules/server-only/empty.js`, já configurado em
`vitest.config.ts`) — o pacote lança erro por padrão fora da condição
`react-server` do bundler do Next, que o Vitest não aplica.

**Lacuna conhecida de testabilidade:** `services/*.ts` instanciam o client
Supabase internamente (`createSupabaseServerClient()`), sem injeção de
dependência — diferente de `repositories/*.ts`, que sempre recebem o
`client` por parâmetro (e por isso são mockáveis/testáveis, ver
`repositories/orders.repository.test.ts`). Isso significa que a orquestração
de um service (ex.: `submitCheckout`, `getActiveKitchenOrders`) não é
unit-testável isoladamente hoje — só a lógica pura que puder ser extraída
para fora do service (ex.: `mapOrderCreationErrorMessage` em
`lib/checkout/error-messages.ts`) é. Corrigir isso de verdade (DI no nível
de service) é um refactor que afeta toda a camada, não só um domínio —
registrado no `BACKLOG.md`.
