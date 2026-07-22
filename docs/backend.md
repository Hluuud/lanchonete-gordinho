# Backend

Previsto no `CLAUDE.md`, criado agora (Sprint 3) — não existia como arquivo
até aqui. Convenções específicas da camada de backend (services,
repositories, Postgres); a visão geral de camadas está em
`docs/architecture.md`.

## Qual client Supabase usar

Três clients (`lib/supabase/`), escolha pelo contexto de quem chama:

| Client | Onde | RLS | Quando usar |
| --- | --- | --- | --- |
| `server.ts` (`createSupabaseServerClient`) | Server Components, Route Handlers, services | Respeita (com a sessão do cookie, se houver) | Padrão — quase tudo. Guest sem sessão = `anon`; staff logado = `authenticated` com o papel do perfil. |
| `client.ts` (`createSupabaseBrowserClient`) | Hooks client-side (`"use client"`) | Respeita (sempre `anon`/`authenticated` do browser) | Só para Realtime (`postgres_changes`) — nunca para mutações; nunca importado por componente visual diretamente. |
| `admin.ts` (`createSupabaseAdminClient`) | Server-only, escopo restrito | **Bypassa** | Só operações administrativas de backend que precisam atravessar tenants ou ignorar RLS (seed, jobs, webhooks). **Não** foi usado para o checkout — ver ADR 0006 (o portão ali é a função `SECURITY DEFINER`, não o client admin). |

## Quando usar `SECURITY DEFINER` em vez de policy de RLS

Um convidado (`anon`) às vezes precisa de uma escrita que a policy de RLS
staff-only não permite (ex.: criar um pedido). Duas formas de resolver, e
qual escolher:

- **Policy de RLS permissiva para `anon`** — só quando a validação de
  negócio para aquela escrita é trivial o bastante para caber inteiramente
  em uma expressão de policy (`using`/`with check`). Raramente é o caso.
- **Função Postgres `SECURITY DEFINER`** — quando a escrita precisa de
  validação real (produto existe, preço vem do banco, quantidade positiva,
  atomicidade entre múltiplas tabelas). A função *é* o portão de escrita —
  ninguém pode inserir diretamente contornando a validação, porque a policy
  de insert continua staff-only; só a função (rodando com o privilégio do
  seu dono) consegue. Padrão usado por `current_profile_tenant()`/
  `current_profile_role()` (Fase 0) e `create_order` (Sprint 3, ADR 0006).

Toda função `SECURITY DEFINER` tem `set search_path = public` (defense in
depth contra sequestro de search_path — convenção desde a `0003`) e seu
trade-off documentado em `docs/security.md`.

## Erros tipados por serviço

Cada `services/*.ts` que pode falhar por regra de negócio define sua própria
classe de erro (`extends Error`), nunca deixa um erro genérico do Postgres
vazar para a rota:

```ts
export class CheckoutValidationError extends Error { ... }
export class InvalidOrderTransitionError extends Error { ... }
export class OrderNotFoundError extends Error { ... }
```

A route handler faz `error instanceof X` e decide o status HTTP (422 para
erro de validação de negócio, 404 para não encontrado, 409 para conflito de
transição) — nunca um `try/catch` genérico que esconde qual erro aconteceu.
Erros vindos do Postgres via RPC (`error.code`, o `errcode` do
`raise exception`) são traduzidos para a classe de erro do serviço por uma
função pura e testável isoladamente (ex.:
`lib/checkout/error-messages.ts#mapOrderCreationErrorMessage`) — não dentro
do próprio serviço, que não é unit-testável sem um banco real (ver
`docs/conventions.md`).

## Estratégia transacional

Quando uma operação precisa escrever em mais de uma tabela de forma
atômica (ex.: pedido + itens + contador de senha), a transação vive **dentro
de uma função Postgres** (`plpgsql`), nunca coordenada por múltiplas
chamadas do client Next.js. Uma função é uma transação implícita — qualquer
`raise exception` no meio desfaz tudo que a mesma chamada já tinha escrito.
Ver [ADR 0006](./adr/0006-transactional-checkout-rpc.md) para o caso
completo (`create_order`).

## Mapeamento Row → domínio

Vive na camada de serviço (nunca no repositório, nunca na UI), e é
**compartilhado** entre serviços que operam sobre a mesma tabela — ex.:
`lib/kitchen/order-mapper.ts` (`toOrder`/`toOrderItem`) é usado tanto por
`kitchen-orders.service.ts` quanto por `checkout.service.ts`. Nunca duplicar
essa lógica por serviço.
