# Segurança

## Modelo

- **RLS habilitada** em todas as tabelas de domínio. É a última linha de defesa
  de autorização — nenhuma consulta escapa dela.
- **Guest-first:** o cliente lê o cardápio sem autenticar. Escrita e áreas
  restritas exigem sessão + papel.
- **Menor privilégio:** cada papel só enxerga/edita o que precisa.

## Funções auxiliares (RLS)

Definidas em `0002_rls_policies` (hardened em `0003`):

- `current_profile_tenant()` — tenant do usuário logado (`security definer`).
- `current_profile_role()` — papel do usuário logado (`security definer`).
- `is_super_admin()` — atalho de plataforma.
- `is_tenant_manager(tenant)` — `owner`/`manager` do tenant.
- `is_tenant_staff(tenant)` — `owner`/`manager`/`kitchen`/`cashier` do tenant
  (Sprint 2, `0005_orders_rls`) — o Painel da Cozinha é 100% staff, sem
  visão pública.

## Políticas (resumo)

| Tabela       | Leitura                                   | Escrita                                  |
| ------------ | ----------------------------------------- | ---------------------------------------- |
| `tenants`    | ativos (público) / próprio / super_admin  | super_admin                              |
| `profiles`   | próprio / gestão do tenant / super_admin  | próprio (self) / gestão / super_admin    |
| `categories` | ativas (público) / gestão / super_admin   | gestão do tenant / super_admin           |
| `products`   | publicados (público) / gestão / super_admin | gestão do tenant / super_admin         |
| `orders`     | staff do tenant / super_admin (**sem público** — tem PII) | insert/update: staff do tenant OU `create_order` (`security definer`) · delete: só gestão |
| `order_items`| **público** (sem PII) | insert: staff do tenant OU `create_order` · update/delete: só gestão (imutáveis) |
| `order_counters` | ninguém via API (sem policy — só `create_order`/`service_role`) | idem |
| `order_tracking_status` | **público** (espelho de `orders` sem PII) | nenhuma (só a trigger `sync_order_tracking_status` escreve) |

Verificado (role `anon`): vê 1 tenant, 4 categorias, 8 produtos; **0 perfis**.
`orders` continua sem policy pública (tem `customer_name`/`customer_phone`) —
o acompanhamento público lê `order_tracking_status`/`order_items` (Sprint 3,
ver `docs/checkout.md`), nunca `orders` diretamente.

## Segredos

- `NEXT_PUBLIC_*` são públicas (URL + chave publishable). Toda autorização real
  vem da RLS.
- `SUPABASE_SERVICE_ROLE_KEY` é **server-only**. O client admin
  (`lib/supabase/admin.ts`) é `import "server-only"` — vaza em client vira erro
  de build. Nunca commitar o segredo (`.env.local` é gitignored).

## Camada de aplicação

- Validação com **Zod** compartilhada client/server; o backend **sempre**
  revalida (`features/*/schema.ts`).
- `requireRole()` protege route groups restritos antes mesmo da RLS.
  Redireciona para `/login?redirect=<origem>` quando não há sessão/papel
  adequado (antes redirecionava para `/`, silencioso demais — não havia
  como voltar a tentar entrar).
- Sessão validada com `auth.getUser()` (valida token no servidor), nunca
  confiando apenas no cookie. `proxy.ts` (convenção do Next 16 para o antigo
  "middleware") revalida/renova o cookie a cada request.

### Login

`/login` (`features/auth/`) é único para todos os papéis — email/senha via
`supabase.auth.signInWithPassword`, client-side. Depois de autenticar, o
formulário lê o `role` do próprio perfil (`profiles_select` já permite
`id = auth.uid()`) e decide o destino (`lib/auth/landing-path.ts`):
`super_admin`/`owner`/`manager` → `/admin`, `kitchen` → `/cozinha`, os
demais papéis (`cashier`/`waiter`) → `/` (sem painel dedicado ainda).

**Bootstrap do primeiro usuário**: como convidar alguém (Fase 6, ADR 0009)
exige já estar logado como `owner`/`manager`, o *primeiro* usuário de um
tenant não pode nascer pelo próprio painel — é uma limitação estrutural,
não um bug. Provisionamento inicial é uma operação manual (Supabase Admin
API `auth.admin.createUser` + `insert` em `profiles` com `role = 'owner'`),
feita uma única vez por tenant, fora do fluxo normal do produto.

## Advisors — trade-offs aceitos nesta fase

- **SECURITY DEFINER executável por anon/authenticated** (`current_profile_*`):
  retornam apenas o tenant/papel **do próprio chamador** (via `auth.uid()`);
  anon recebe `null`. Exposição irrelevante e revogar `EXECUTE` quebraria a
  leitura pública do cardápio (avaliação das policies). Mantido conscientemente.
- **`create_order` — SECURITY DEFINER executável por anon (Sprint 3):**
  é o único caminho de escrita para um convidado sem papel de staff (as
  policies de insert de `orders`/`order_items` continuam staff-only). Toda
  validação de negócio (produto existe/publicado/disponível, quantidade,
  preço sempre lido do banco) acontece **dentro** da função — ela é o portão
  de escrita confiável, não uma policy de RLS permissiva. Ver
  [ADR 0006](./adr/0006-transactional-checkout-rpc.md).
- **`order_tracking_status`/`order_items` com policy pública (`using
  (true)`, Sprint 3):** aceito porque nenhuma das duas tem PII — o
  `order_id` (UUID) é a própria credencial de acesso ao acompanhamento,
  mesmo modelo de links de pedido/pagamento usado amplamente no mercado.
  `orders` (que tem `customer_name`/`customer_phone`) permanece
  deliberadamente sem policy pública. Ver `docs/checkout.md`.
- `search_path` das funções: corrigido em `0003`.

## Roadmap de segurança

Rate limiting, CSRF em mutações de formulário, auditoria, e políticas de
Storage seguem **pendentes** (`BACKLOG.md`) — o checkout (Sprint 3) é a
fase que este documento já antecipava como gatilho para isso, mas nenhum
desses itens foi implementado ainda. `/api/checkout` em particular não tem
rate limiting hoje: um script poderia submeter pedidos em loop.
