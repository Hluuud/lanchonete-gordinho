# Auditoria Técnica — Pré-Sprint 6

> Revisão completa do projeto conduzida como Principal Engineer, a pedido do
> usuário em 2026-07-24, antes de iniciar a Sprint 6. Cobre estrutura de
> código, banco de dados/RLS, performance, segurança, cobertura de testes,
> observabilidade, prontidão multi-tenant e prontidão de produção.
>
> Metodologia: 4 investigações paralelas somente-leitura (estrutura/módulos;
> banco/migrations/RLS/índices; testes/observabilidade/segurança;
> performance/queries/multi-tenant scale), cruzadas contra `BACKLOG.md`
> existente para separar achados **novos** de achados que **estendem** dívida
> já rastreada. Nenhuma mudança de código foi feita nesta auditoria.

## Resumo executivo

O projeto está em bom estado estrutural: camada services/repositories real e
consistente, RLS em 100% das tabelas com isolamento por `tenant_id` reforçado
por FK composta, toda rota admin/kitchen autentica antes de tocar o banco,
Realtime já filtra por tenant no servidor (sem vazamento cross-tenant), env
validado com Zod e nenhum segredo hardcoded. `BACKLOG.md` já rastreia boa
parte da dívida técnica conhecida de forma disciplinada.

O maior risco não está em bugs pontuais, mas em três lacunas estruturais que
combinam mal com a meta declarada no `CLAUDE.md` de virar SaaS multi-tenant:
(1) CI não roda a suíte de testes que já existe, (2) a resolução de tenant é
hoje uma env var fixa — não há multi-tenant real ainda, apesar do schema
estar pronto — e (3) não há rede de segurança de teste nas áreas de maior
risco de negócio (auth, checkout, admin write-paths). Nenhuma delas é difícil
de corrigir isoladamente; juntas, formam a lacuna que mais separa o projeto
do objetivo de "plataforma SaaS para dezenas/centenas de restaurantes"
descrito no `CLAUDE.md`.

## Pontos fortes confirmados

- **RLS**: 16/16 tabelas com `ENABLE ROW LEVEL SECURITY`; `order_counters` é a
  única com RLS habilitado e zero policies — por design documentado na própria
  migration (só a função `create_order`, `SECURITY DEFINER`, e `service_role`
  tocam nela).
- **Isolamento multi-tenant no schema**: `tenant_id` presente e indexado em
  todas as 16 tabelas de domínio; FKs compostas `(id, tenant_id)` usadas
  deliberadamente para impedir referência cross-tenant no nível de banco.
- **Segurança de rota**: os 18 arquivos de rota sob `app/api/{admin,kitchen}/**`
  chamam `getAdminApiUser()`/`getKitchenApiUser()` (`lib/admin/roles.ts`,
  `lib/kitchen/roles.ts`) antes de qualquer acesso ao banco. As únicas rotas
  públicas (`app/api/checkout/route.ts`, `app/api/menu/route.ts`) são
  intencionais e revalidam tudo no lado servidor via função Postgres
  `create_order` (`SECURITY DEFINER`).
- **Realtime multi-tenant seguro**: `use-kitchen-realtime.ts:62` e
  `use-order-tracking-realtime.ts:34` filtram no próprio canal Postgres
  (`tenant_id=eq.${tenantId}` / `order_id=eq.${orderId}`), não client-side —
  sem vazamento de dados entre tenants mesmo com volume real.
- **Paginação**: allowlist consistente (`features/admin/pagination.ts`, cap
  100) aplicada em produtos, categorias, combos, usuários e audit logs.
- **Query patterns**: nenhum N+1 encontrado nos caminhos de listagem
  inspecionados — uso consistente de nested-select do Supabase
  (`repositories/menu.repository.ts`, `orders.repository.ts`,
  `combos.repository.ts`).
- **Config/segredos**: `lib/env.ts` valida env com Zod e falha rápido;
  `SUPABASE_SERVICE_ROLE_KEY` isolado em `getServiceRoleKey()`; nenhum padrão
  de segredo hardcoded encontrado no código rastreado; `.env.local` fora do
  git.
- **Migrations**: 28 arquivos sequenciais sem gaps, nunca editadas após
  aplicadas (fixes são migrations novas); nenhum `DROP COLUMN`/`DROP TABLE`
  sem guarda — únicas alterações "destrutivas" são `ALTER TYPE ADD VALUE`
  (aditivas).

## 🔴 Crítico

Bloqueadores sugeridos antes/durante a Sprint 6 — risco de segurança, dado ou
de regressão silenciosa.

### 1. CI não executa a suíte de testes

`.github/workflows/ci.yml` roda `lint`, `typecheck`, `format:check` e `build`,
mas nunca `npm run test`. Existem 14 arquivos Vitest (`lib/kitchen/`,
`lib/checkout/`, `features/*/`, `repositories/orders.repository.test.ts`,
`utils/format.test.ts`, etc.) que não protegem nenhum PR hoje — podem quebrar
silenciosamente sem bloquear merge.

**Ação**: adicionar `npm run test` (ou `vitest run`) ao workflow de CI.
Baixíssimo esforço, alto retorno.

### 2. Zero cobertura de teste nas áreas de maior risco de negócio

Não há nenhum teste de: `services/admin/*.service.ts`, rotas
`app/api/admin/**`, autenticação/RBAC (`lib/auth/session.ts`,
`lib/admin/roles.ts`, fluxo `/login`), `services/checkout.service.ts` /
`app/api/checkout/route.ts`, e upload de storage. A cobertura hoje é só lógica
pura (máquina de estado da cozinha, formatadores, schemas Zod).

**Ação**: priorizar testes de integração/service para checkout (fluxo mais
crítico de receita) e RBAC (maior superfície de segurança) antes de agregar
mais features na Sprint 6. Isso é destravado mais barato depois do item 11
(lacuna de DI nos services).

### 3. Multi-tenant é hoje mono-tenant hardcoded — **não está no BACKLOG.md**

`lib/tenant/get-tenant-context.ts:16-23` (`resolveTenantSlug`) resolve o
tenant via header opcional `x-tenant-slug` (só para testes/preview) com
fallback para `env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG` (`lib/env.ts:14`, default
`"gordinho"`). Não existe roteamento por subdomínio nem por path — nenhum
middleware inspeciona `Host`, nenhuma rota dinâmica `[tenant]`.

O comentário em `get-tenant-context.ts:7-15` já documenta isso como decisão
deliberada de Fase 0 ("quando o SaaS evoluir... será uma mudança localizada
aqui"). RLS e `tenant_id` estão prontos no schema — mas hoje não existe
mecanismo real de rotear dois hosts de produção para dois tenants diferentes
sem um header que um navegador real nunca envia.

**Ação**: este é o item que mais separa o projeto do objetivo declarado de
SaaS multi-tenant. Vale decidir explicitamente se a Sprint 6 endereça isso
(estratégia de subdomínio vs. path) ou se permanece adiado — mas como decisão
consciente, registrada em ADR, não como lacuna silenciosa.

### 4. Rate limiting ausente em `/api/checkout` e `/login`

Já rastreado em `BACKLOG.md:224-226` e `:58-61`, mas elevando a prioridade
aqui: as env vars `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` já estão
provisionadas em `.env.example:14-16` e **não conectadas a nenhum código**.
Um script pode hoje submeter pedidos em loop ou tentar senhas contra
`signInWithPassword` sem nenhuma camada adicional do app (Supabase Auth aplica
algum rate limit próprio, mas não há reforço no lado da aplicação).

**Ação**: como a dependência já está provisionada, o esforço de implementar é
baixo relativo ao risco — bom candidato a resolver cedo na Sprint 6.

### 5. Upload de imagem validado só no client

`components/image-upload.tsx:43-50` valida `ACCEPTED_TYPES`
(`image/png|jpeg|webp`) e `MAX_FILE_SIZE_BYTES` (5MB) — mas só no client. A
definição do bucket (`supabase/migrations/0011_store_assets_bucket.sql:6-8`)
não define `file_size_limit` nem `allowed_mime_types` no nível do Storage. Uma
chamada direta à API do Supabase Storage (fora da UI) contorna a validação
inteira.

**Ação**: adicionar `file_size_limit`/`allowed_mime_types` na definição do
bucket via migration nova — corrige na camada certa sem exigir mudança de UI.

### 6. `0028_store_assets_select_restricted.sql` não commitado

Migration já escrita, corrigindo achado real do Supabase Advisor ("Public
Bucket Allows Listing" — a policy `store_assets_select_public` de 0011
permitia a qualquer `anon`/`authenticated` listar **todos** os arquivos do
bucket `store-assets`, incluindo de outros tenants, via `.list()`). A
substituição (`store_assets_select_manager`) restringe `SELECT` em
`storage.objects` ao gestor do tenant do path ou super admin, sem afetar
fetch direto por URL pública (único uso real hoje, em `image-upload.tsx`).

**Ação**: commitar e aplicar antes de qualquer outra coisa — é o fix de
segurança mais barato e mais pronto desta lista.

## 🟡 Importante

Não bloqueiam a Sprint 6, mas de alta prioridade — tendem a virar críticos com
volume/tenants reais.

### 7. Sem cache/revalidation no cardápio público

Nenhum `revalidate`, `unstable_cache` ou opção de cache do `fetch` encontrado
em código de aplicação. `app/(store)/page.tsx:15-34` e
`app/api/menu/route.ts:11-23` usam `createSupabaseServerClient()`
(`lib/supabase/server.ts:16-40`, que lê cookies via `next/headers`), forçando
renderização dinâmica em toda visita — sem SSG/ISR. O único cache existente é
`staleTime: 60_000` do TanStack Query no client (`app/providers.tsx:13-20`),
que não ajuda no primeiro carregamento nem em SSR.

**Ação**: cardápio público é o caminho de maior tráfego potencial (visitante
anônimo, sem sessão) — candidato natural a ISR com `revalidate` curto ou
`unstable_cache` por tenant.

### 8. `exportOrders` sem nenhum cap

`services/admin/export.service.ts:26-36` chama `findOrdersInDateRange`
diretamente, sem usar `EXPORT_PAGE_SIZE = 10_000` (linha 24) que protege os
outros três caminhos de export. Para um range de data amplo, é uma consulta
genuinamente ilimitada — estende o item já rastreado em `BACKLOG.md:43-47`,
que só cobria produtos/audit logs.

### 9. `findActiveOrdersByTenant` sem `LIMIT`

`repositories/orders.repository.ts:38-51` (board da cozinha) busca todos os
pedidos não-`completed` do tenant sem nenhum teto. Distinto do item já
rastreado sobre virtualização de lista (`BACKLOG.md:203-205`, que é sobre
renderização client-side) — aqui o problema é a própria query sem `LIMIT`.

### 10. Inconsistência de camada services/repositories

`features/auth/components/login-form.tsx:13,32-49` e
`components/image-upload.tsx:9,57-65` chamam o client Supabase diretamente
dentro do componente (auth + leitura de `profiles.role`; upload de storage),
diferente do resto do projeto que passa por
`services/*.service.ts`→`repositories/*.repository.ts`. Os 3 hooks de
Realtime (`use-kitchen-realtime.ts`, `use-order-tracking-realtime.ts`,
`use-realtime-status.ts`) também acessam o client direto, mas isso é
defensável — canais Realtime precisam rodar no browser e não cabem numa
chamada request/response de service.

**Ação**: extrair um `auth.service.ts` (login + leitura de perfil) e mover a
lógica de upload para dentro de um service, mantendo o componente só como UI.

### 11. Lacuna de DI na camada de services

Já rastreado em `BACKLOG.md:232-237`. `services/*.ts` instanciam o client
Supabase internamente ao invés de recebê-lo por parâmetro (diferente dos
repositories, que sempre recebem `client` injetado e por isso são
testáveis). Resolver isso é pré-requisito barato para destravar o item 2
(teste de services admin/checkout) sem exigir mocks pesados.

### 12. Sem posição documentada sobre pooling de conexão / limites serverless

Nenhum `vercel.json` ou config equivalente no repo — sem override de
`maxDuration`/memória de função serverless. `lib/supabase/server.ts:16-40` e
`lib/supabase/admin.ts:16-27` criam client novo por invocação (padrão correto
para `@supabase/ssr`, que fala PostgREST via HTTP, não conexão Postgres
crua) — então pool sizing é inteiramente responsabilidade do lado Supabase,
sem visibilidade/decisão documentada no lado da aplicação.

**Ação**: não é um defeito de código, é uma lacuna de decisão operacional —
vale um parágrafo em `docs/deployment.md` (ou criar o arquivo, que consta na
lista de docs esperados no `CLAUDE.md` mas não existe ainda) documentando o
modo de pooling escolhido no projeto Supabase.

### 13. Dashboard agrega em memória, sem `GROUP BY` SQL

Já rastreado em `BACKLOG.md:123-128` como decisão YAGNI explícita.
`services/admin/dashboard.service.ts:67-142` busca até 30 dias de
pedidos+itens sem `LIMIT` e agrega em JS (top produtos, contagem por hora,
tempo médio de preparo) — roda em toda visita ao dashboard. Combinado com o
item 3 (multi-tenant real), é o primeiro ponto que quebra quando volume ou
número de tenants crescer de verdade.

## 🟢 Desejável

Backlog contínuo — sem urgência, mas vale rastrear.

14. `TenantNotFoundError` duplicada em 7 services (`BACKLOG.md:118-122`) —
    extrair para `services/admin/errors.ts` compartilhado.
15. Redundância: dashboard e menu resolvem tenant cada um por conta própria
    (`resolveTenantOrThrow` privado por service) — 2 queries de `tenants` por
    render de dashboard. Mesma causa raiz do item 14.
16. `features/` mistura componentes, hooks e schema por domínio (115
    arquivos) — decidir se é convenção intencional de co-localização antes
    que cresça mais; hoje não há sinal de que seja acidental, mas também não
    está documentado como decisão em `docs/conventions.md`.
17. Sem e2e (Playwright/Cypress) — só `vitest` de lógica pura. Fluxos
    completos (checkout → cozinha → status) dependem hoje só de validação
    manual (documentada como pendente em vários pontos do `BACKLOG.md`).
18. `npm audit`: 2 vulnerabilidades transitivas via dependências do próprio
    Next.js (postcss/sharp) — já rastreado (`BACKLOG.md:15-19`), sem ação
    manual recomendada (fix automático sugeriria downgrade incorreto).
19. Sem upload de source maps ao Sentry — stack traces chegam minificados em
    produção (já rastreado, `BACKLOG.md:20-22`).

## Plano de ação recomendado antes da Sprint 6

**Fazer antes de abrir a Sprint 6** (baixo esforço, risco desproporcional se
adiado):
1. Commitar `0028_store_assets_select_restricted.sql` (item 6).
2. Ligar `npm run test` no CI (item 1).
3. Adicionar `file_size_limit`/`allowed_mime_types` no bucket `store-assets`
   (item 5).

**Decidir conscientemente no planejamento da Sprint 6** (não são "5 minutos",
mas moldam o escopo):
4. Se a Sprint 6 vai endereçar multi-tenant real (item 3) ou adiar
   explicitamente com ADR.
5. Rate limiting em checkout/login (item 4) — dependência já provisionada.
6. DI nos services (item 11) como pré-requisito de testabilidade (item 2).

**Acompanhar como dívida de alta prioridade, sem bloquear**:
itens 7, 8, 9, 10, 12, 13 — nenhum quebra hoje, todos pioram com volume real.

**Backlog contínuo**: itens 14–19, já em grande parte rastreados.
