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
| `orders`     | staff do tenant / super_admin (sem público) | insert/update: staff do tenant · delete: só gestão |
| `order_items`| staff do tenant / super_admin (sem público) | insert: staff do tenant · update/delete: só gestão (imutáveis) |

Verificado (role `anon`): vê 1 tenant, 4 categorias, 8 produtos; **0 perfis**,
**0 pedidos** (`orders`/`order_items` não têm policy pública).

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
- Sessão validada com `auth.getUser()` (valida token no servidor), nunca
  confiando apenas no cookie.

## Advisors — trade-offs aceitos nesta fase

- **SECURITY DEFINER executável por anon/authenticated** (`current_profile_*`):
  retornam apenas o tenant/papel **do próprio chamador** (via `auth.uid()`);
  anon recebe `null`. Exposição irrelevante e revogar `EXECUTE` quebraria a
  leitura pública do cardápio (avaliação das policies). Mantido conscientemente.
- `search_path` das funções: corrigido em `0003`.

## Roadmap de segurança

Rate limiting, CSRF em mutações de formulário, auditoria, e políticas de Storage
entram junto das fases que introduzem escrita pelo cliente (checkout, pedidos).
