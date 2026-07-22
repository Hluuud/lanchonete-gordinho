# Painel da Cozinha

Sprint 2 (Fase 2 do roadmap). Kanban de pedidos em tempo real para a equipe
de cozinha/gestão — `/cozinha`, protegido por `requireRole`.

## Fluxo de status

```
Novo Pedido → Aceito → Em Preparo → Pronto → Entregue → Finalizado
                 ↘         ↘          ↘
                       Cancelado
```

Máquina de estados centralizada em `lib/kitchen/order-status.ts`
(`ALLOWED_TRANSITIONS`) — a única fonte de verdade, revalidada pelo serviço
(`services/kitchen-orders.service.ts`) a cada mudança, independentemente da
origem (drag, botão, ou uma futura integração externa). Cancelamento é
possível em qualquer etapa até "Pronto"; um pedido "Entregue" só avança para
"Finalizado".

**"Finalizado" não é coluna do board.** As 6 colunas visíveis são Novo
Pedido/Aceito/Em Preparo/Pronto/Entregue/Cancelado. O botão "Finalizar" (em
pedidos Entregues) arquiva o pedido — ele sai do board ativo
(`findActiveOrdersByTenant` exclui `status = 'completed'`). Uma tela de
histórico de pedidos finalizados é BACKLOG (Fase 4/Admin).

## Anatomia do card

Senha (`order_number`, atribuída por trigger de banco — sequencial por
tenant, reinicia por dia), horário de criação, tempo decorrido (timer ao
vivo), tempo previsto (`estimated_ready_at`), itens com observação
individual, observação do pedido, tipo (retirada/entrega), badges de
prioridade e atraso, e botões de ação (avançar/cancelar/prioridade) — sempre
presentes como alternativa ao drag-and-drop (acessibilidade: teclado, touch
impreciso em tablet, TV da cozinha sem input).

## Estado e tempo real

`KitchenOrdersProvider` (`features/kitchen/kitchen-orders-context.tsx`)
mantém os pedidos em `useReducer`, inicializado com os dados já carregados
no servidor (`app/(kitchen)/cozinha/page.tsx`). `useKitchenRealtime`
assina `postgres_changes` só na tabela `orders` (não `order_items` — itens
são imutáveis após a criação, sem edição de pedido nesta fase):

- Pedido **já conhecido** no estado local → patch direto dos campos
  (status, timestamps, prioridade).
- Pedido **desconhecido** (criado por outra origem — cashier/checkout
  futuro) → busca o detalhe completo via `GET /api/kitchen/orders/:id`
  (com itens) e toca o aviso sonoro de novo pedido.

Mudanças feitas pelo próprio painel (drag ou botão) são **otimistas**:
aplicam o patch local antes da resposta do servidor; falha do `PATCH`
reverte para o snapshot anterior + toast de erro (nunca deixa a UI mentir
sobre o estado real).

Ver [ADR 0003](./adr/0003-kitchen-realtime-state-model.md) para a decisão
completa (por que híbrido, por que não `useSyncExternalStore` aqui).

## Drag-and-drop

`@dnd-kit/core` + `@dnd-kit/sortable` (só pelo `coordinateGetter` de teclado
multi-container). Ver [ADR 0004](./adr/0004-drag-and-drop-library.md).
`PointerSensor` com `activationConstraint: { distance: 8 }` evita que um
clique em botão dentro do card dispare um drag. Drop inválido (transição não
permitida pela máquina de estados) é rejeitado no client com toast — o
servidor também revalida, então um drop tecnicamente "válido" na UI mas
enviado fora de ordem (race entre duas abas) ainda seria barrado no
`PATCH /api/kitchen/orders/:id/status` (409).

## Filtros e busca

Tabs (Todos/Retirada/Entrega/Em atraso/Prioridade) + busca por senha, produto
ou cliente (client-side, sobre os dados já carregados — mesmo padrão de
`features/menu`/`features/search`, sem chamada extra ao Supabase).
"Em atraso" é computado no client (`isOrderLate`, `lib/kitchen/order-status.ts`):
`estimated_ready_at` no passado e status ainda em `new`/`accepted`/`preparing`.

## Som de novo pedido

`lib/kitchen/notification-sound.ts` gera um beep de dois tons via Web Audio
API (`AudioContext` + oscillator) — sem depender de um arquivo de áudio a
licenciar/hospedar. Toggle persistido em `localStorage`, com
`useSyncExternalStore` (`kitchen-header.tsx`) reagindo à troca inclusive
entre abas/telas (útil se a cozinha tiver mais de um monitor com o painel
aberto).

## Responsividade

- **Desktop/tablet:** colunas lado a lado, scroll horizontal (`overflow-x-auto`
  + `snap-x`). Escala para telas grandes ("TV da cozinha") via breakpoint
  `2xl:` (colunas mais largas).
- **Mobile** (`useMediaQuery("(max-width: 767px)")`): alterna para Tabs — uma
  coluna de status por vez, reaproveitando o mesmo componente `Tabs` dos
  filtros. Drag-and-drop entre colunas não se aplica nessa visão (Radix só
  monta o painel ativo); os botões de ação cobrem a mudança de status.

## Limitações conhecidas desta sprint

- Sem checkout real: pedidos vêm de `supabase/seed.sql` (ver
  [ADR 0002](./adr/0002-client-side-cart-state.md) e `BACKLOG.md`).
- Verificação de drag-and-drop e do layout mobile via automação de browser
  não foi possível nesta sessão (mesma limitação de `resize_window`/gestos
  multi-etapa já registrada no `CHANGELOG.md` da Sprint 1) — lógica de
  transição está coberta por testes unitários (`lib/kitchen/order-status.test.ts`);
  recomenda-se validação manual em device/DevTools antes do merge.
- Sem virtualização de lista — aceitável para o volume de uma lanchonete;
  ver `BACKLOG.md`.
