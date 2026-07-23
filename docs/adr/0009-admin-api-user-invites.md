# ADR 0009 — Convite de usuário via Supabase Admin API

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 5, Fase 6 (Painel Administrativo — Usuários)

## Contexto

O módulo Usuários precisa permitir que o dono/gerente de um tenant adicione novos funcionários (gerente, caixa, cozinha, garçom) ao painel, sem que esse funcionário precise se auto-cadastrar. Até aqui o projeto nunca criou um usuário de `auth.users` a partir do próprio backend — todo cadastro existente é feito manualmente (seed/Studio).

Opções consideradas:

1. **Convite via Supabase Admin API** (`auth.admin.inviteUserByEmail`), chamado só em rota de API server-side com a service-role key (`lib/supabase/admin.ts`, já existe desde o Fase 0 do produto mas nunca foi usado).
2. **Signup público** — o funcionário se cadastra sozinho (email/senha) e alguém promove o papel dele depois.
3. **Criar o usuário diretamente na tabela `profiles` sem linha em `auth.users`** — sem conta de autenticação real até o convite ser aceito.

## Decisão

Adotar **(1) Admin API**: a rota `POST /api/admin/users` (guardada por `getAdminApiUser`, papéis `owner`/`manager`/`super_admin`) chama `createSupabaseAdminClient().auth.admin.inviteUserByEmail(email)` — que cria o usuário em `auth.users` e dispara o email de convite do próprio Supabase Auth (definir senha) — e, com o `id` retornado, insere a linha correspondente em `profiles` (tenant, papel, nome) usando o client normal (respeitando RLS, o ator já é `is_tenant_manager`).

## Justificativa

- **(2) inverte o controle de quem entra no tenant**: qualquer pessoa poderia se cadastrar e só depois pedir para alguém promovê-la a um papel — errado para um sistema de gestão onde "quem tem acesso" precisa ser uma decisão do dono/gerente, não do futuro funcionário.
- **(3) deixaria `profiles.id` sem `auth.users` correspondente** — quebraria a suposição usada em todo o resto do projeto (`profiles.id` sempre referencia um usuário de auth real, FK implícita) e exigiria um fluxo separado de "vincular conta depois", complexidade desnecessária quando o Admin API já resolve isso numa chamada.
- **`lib/supabase/admin.ts` já existe e já documenta esse uso** ("operações administrativas de backend que exigem... bypassar RLS") — é a primeira vez que o projeto efetivamente usa essa capacidade, não uma dependência nova.
- **Nunca roda no client**: o `service` que chama `auth.admin.inviteUserByEmail` vive em `services/admin/users.service.ts`, importado só pela rota de API (`"server-only"` garante erro de build se algo tentar importar no client) — a service-role key nunca é exposta ao browser.

## Consequências

- **Usuário órfão em `auth.users` se a criação de `profiles` falhar depois do convite** (ex. corrida rara, erro de rede): o convite já foi enviado mas a linha de `profiles` não existe. `getCurrentUser()` trata "sem perfil" como sessão inválida, então o efeito prático é "o link do convite não funciona" — não é um buraco de segurança, mas é uma experiência ruim. Registrado no `BACKLOG.md` como melhoria futura (reenviar convite / limpar usuário órfão).
- **`profiles.email` não é sincronizado automaticamently** se o usuário trocar o próprio email em `auth.users` depois — é uma cópia escrita no momento do convite (ver `0021_profiles_email.sql`), não uma view. Aceito nesta v1 (listar usuários não pode fazer `join` em `auth.users` via RLS); registrado no `BACKLOG.md`.
- **Papel `super_admin` não é atribuível via este fluxo** (`ASSIGNABLE_ROLES` em `features/admin/users/schema.ts` o exclui) — é papel de plataforma, provisionar continua uma operação manual, mesmo tratamento que `tenants.slug`/`is_active` já recebem.
- **Achado de segurança relacionado, corrigido nesta mesma fase**: ao modelar `role`/`is_active` em `profiles`, foi identificado que a policy `profiles_update_self` (0002) permitia a qualquer usuário autenticado alterar o próprio `role`/`tenant_id` via update direto (RLS só garantia `id = auth.uid()`, sem restrição por coluna) — uma auto-escalação de privilégio pré-existente, não introduzida por esta sprint. Corrigido em `0023_protect_profile_privileged_fields.sql` com o mesmo padrão de trigger já usado em `0019` para `tenants`.

## Revisão

Se o projeto evoluir para permitir que o próprio convidado personalize a mensagem de convite (marca, idioma) ou reenviar convites expirados, revisar se o Admin API cobre isso nativamente (`inviteUserByEmail` aceita `options.data`) antes de introduzir um fluxo próprio de email.
