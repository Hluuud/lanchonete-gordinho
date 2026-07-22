# Roadmap

Previsto no `CLAUDE.md`, criado agora (Sprint 3) — não existia como arquivo
até aqui. Reflete o estado real do projeto nesta data; atualizar a cada
sprint que mudar o status de uma fase.

## Fase 0 — Fundação ✅

Arquitetura, design system, componentes, autenticação, banco,
infraestrutura. Concluída antes da Sprint 1.

## Fase 1 — Cardápio Digital, Autoatendimento ✅ (fechada na Sprint 3)

- Cardápio, busca, filtros, carrinho — Sprint 1.
- **Checkout** (a peça que faltava) — Sprint 3: `features/checkout/`,
  `POST /api/checkout`, criação atômica de pedido (`create_order`, ADR
  0005/0006), página de acompanhamento pública com QR Code (`/pedido/[id]`).

Pendente dentro da Fase 1 (não bloqueia o fechamento, registrado no
`BACKLOG.md`): endereço de entrega, número de mesa (`dine_in`), rate
limiting em `/api/checkout`.

## Fase 2 — Painel da Cozinha ✅ (integração real fechada na Sprint 3)

- Kanban, drag-and-drop, filtros, timers — Sprint 2 (sobre dados de seed).
- **Integração real com pedidos do checkout** — Sprint 3: os pedidos que
  chegam pelo Kanban agora podem vir de `/checkout`, não só do seed.
- **Correção crítica** (Sprint 3): nenhuma tabela estava na publicação
  `supabase_realtime` — o Realtime do Painel da Cozinha nunca funcionou de
  verdade até esta sprint corrigir (`0010_realtime_publication.sql`, ver
  `docs/checkout.md`).

## Fase 3 — Impressão automática 🔜 próxima

ESC/POS, QR Code (já gerado desacopladamente em
`lib/checkout/qr-code.ts` — reaproveitável para impressão térmica),
reimpressão, impressão por setor.

## Fase 4 — Painel Administrativo 🚧 iniciada na Sprint 4

- **Shell + Dashboard/Pedidos/Produtos** (somente leitura) — Sprint 4:
  `app/(admin)/admin/`, identidade visual própria (`.theme-admin`, ADR
  0007), reuso direto dos services da loja/cozinha (sem backend novo).
- Pendente: CRUD real de Categorias/Clientes/Cupons/Funcionários,
  Relatórios, Configurações, Impressoras (hoje placeholders "Em breve"),
  histórico de pedidos finalizados, realtime na lista de pedidos.

## Fase 5 — Recursos Premium

Favoritos, combos, upsell, histórico, cupons, promoções. `coupon_code` e
`discount_cents`/`service_fee_cents` já existem no schema de `orders`
(Sprint 3, arquitetura preparada, sem lógica real ainda).

## Fase 6 — Expansão SaaS

Multiempresa, multiunidade, permissões, API pública, marketplace. A base
multi-tenant (Fase 0, ADR 0001) já sustenta isso.
