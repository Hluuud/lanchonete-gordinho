# Lanchonete do Gordinho

Plataforma de gestão de pedidos para restaurantes — cardápio digital,
autoatendimento, painel da cozinha e administrativo. Construída desde o início
como **SaaS multi-restaurante** (multi-tenant), iniciando pela Lanchonete do
Gordinho.

## Stack

Next.js 16 (App Router / RSC) · React 19 · TypeScript · Tailwind v4 · shadcn/ui ·
TanStack Query · React Hook Form · Zod · Framer Motion · Supabase
(Postgres · Auth · Realtime · Storage). Deploy: Vercel + GitHub Actions.

## Começando

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev                  # http://localhost:3000
```

Variáveis de ambiente: ver `.env.example`. O `SUPABASE_SERVICE_ROLE_KEY`
(server-only) é obtido no painel do Supabase (Project Settings → API).

## Scripts

| Script                 | Descrição                          |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento        |
| `npm run build`        | Build de produção                  |
| `npm run start`        | Servidor de produção               |
| `npm run lint`         | ESLint                             |
| `npm run typecheck`    | TypeScript (`tsc --noEmit`)        |
| `npm run format`       | Prettier (write)                   |

## Documentação

Em [`docs/`](./docs): [arquitetura](./docs/architecture.md) ·
[banco](./docs/database.md) · [segurança](./docs/security.md) ·
[convenções](./docs/conventions.md) · [ADRs](./docs/adr).

Diretrizes de trabalho para agentes de IA: [`CLAUDE.md`](./CLAUDE.md).

## Status

**Fase 0 — Fundação** concluída: arquitetura em camadas, design system,
banco multi-tenant com RLS, autenticação base e a loja pública renderizando o
cardápio (fatia vertical de ponta a ponta). Próxima: Fase 1 (Cardápio Digital
completo — carrinho, busca, checkout).
