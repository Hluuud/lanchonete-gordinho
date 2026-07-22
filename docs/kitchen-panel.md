# Painel da Cozinha

Sprint 2 (Fase 2 do roadmap), redesenhado como painel industrial de alto
contraste na Sprint 4. Board de pedidos em tempo real para a equipe de
cozinha/gestão — `/cozinha`, protegido por `requireRole`.

## Identidade visual (Sprint 4)

`app/(kitchen)/layout.tsx` escopa a classe `.dark` a todo o módulo — não é
"modo escuro do sistema", é a identidade fixa da cozinha (tela limpa, alto
contraste, fonte grande, pensada para operação contínua em pico e leitura à
distância). Ver [ADR 0007](./adr/0007-module-scoped-visual-identities.md).

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

**"Finalizado" (completed) não é coluna do board.** O botão "Finalizar" (em
pedidos Entregues) arquiva o pedido — ele sai do board ativo
(`findActiveOrdersByTenant` exclui `status = 'completed'`). Uma tela de
histórico de pedidos finalizados é BACKLOG (Fase 4/Admin).

## Colunas visuais (Sprint 4)

O board mostra **4 colunas visuais**, não os 7 status reais — a máquina de
estados acima (`ALLOWED_TRANSITIONS`) não mudou, só a apresentação:

```
lib/kitchen/board-columns.ts

┌─ Novo ──────────┐  ┌─ Em preparo ─┐  ┌─ Pronto ─┐  ┌─ Finalizado ─┐
│ new              │  │ preparing     │  │ ready     │  │ delivered      │
│ accepted          │  └───────────────┘  └───────────┘  └────────────────┘
└──────────────────┘
```

`new`+`accepted` são fundidos em "Novo" (para o cozinheiro, ambos significam
"ainda não começou a fritar"; o `OrderStatusBadge` no card mostra o status
real para quem precisar distinguir). `completed` e `cancelled` ficam **fora**
das 4 colunas: `completed` porque já não é board ativo (acima);
`cancelled` porque poluiria as 4 colunas sem ação pendente — acessível pelo
filtro dedicado "Cancelados" (`CancelledOrdersList`, lista simples, sem
drag-and-drop).

### Drag-and-drop entre colunas visuais

`resolveDropPath(from, targetColumnId)` calcula a sequência de status reais
necessária, restrita a **exatamente uma coluna visual à frente**:

- `new` solto em "Em preparo" → `[accepted, preparing]` (2 PATCHes
  sequenciais, ambos transições já válidas em `ALLOWED_TRANSITIONS`).
- `new` solto em "Pronto" (pulando "Em preparo") → rejeitado (`null` +
  toast), mesmo que a cadeia de transições reais fosse tecnicamente
  alcançável — pular uma coluna visual inteira enganaria o cozinheiro sobre
  o que está acontecendo.
- Qualquer retrocesso → rejeitado.

`KitchenOrdersContext.changeStatusPath` executa o caminho passo a passo; se
um passo falhar, reverte **só aquele passo** (o pedido fica no último status
confirmado, nunca volta ao início do caminho) e avisa via toast. **O botão de
avançar (`ORDER_ADVANCE_ACTION_LABELS`) continua a interação primária** —
sempre visível, cobre teclado/touch impreciso/TV sem input; o
drag-and-drop é um atalho.

### Auto-hide de "Finalizado" (visual apenas)

Pedidos `delivered` somem da coluna "Finalizado" depois de
`KITCHEN_DONE_AUTOHIDE_MS` (`features/kitchen/config.ts`, 5 minutos) —
puramente para não acumular cartões numa tela de operação contínua. Um
botão "Mostrar N ocultos" reexibe. **Nunca chama a API automaticamente**: o
pedido continua `delivered` no servidor até alguém clicar "Finalizar"
(`delivered` → `completed`) manualmente.

## Anatomia do card

Senha em destaque (`order_number`, atribuída por trigger de banco —
sequencial por tenant, reinicia por dia; fonte grande, legível à distância),
horário de criação, tempo decorrido (timer ao vivo, colorido por urgência —
normal/`warning`/`critical` a partir de `KITCHEN_URGENCY_THRESHOLDS_MIN`,
`features/kitchen/urgency.ts`), tempo previsto (`estimated_ready_at`), badge
do status real (distingue `new`/`accepted` dentro da coluna "Novo"), itens
com observação individual, observação do pedido, tipo (retirada/entrega),
badges de prioridade e atraso, e botões de ação (avançar/cancelar/prioridade,
alvo de toque ≥48px) — sempre presentes como alternativa ao drag-and-drop
(acessibilidade: teclado, touch impreciso em tablet, TV da cozinha sem
input). O toggle de prioridade some em pedidos `delivered` (já entregue, sem
efeito operacional priorizar).

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

Tabs (Todos/Retirada/Entrega/Em atraso/Prioridade/Cancelados) + busca por
senha, produto ou cliente (client-side, sobre os dados já carregados — mesmo padrão de
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

- **Desktop/tablet:** as 4 colunas visuais são fluidas (`flex-1`, sem scroll
  horizontal — cabem lado a lado até em telas de TV da cozinha).
- **Mobile** (`useMediaQuery("(max-width: 767px)")`): alterna para Tabs — uma
  coluna de status por vez, reaproveitando o mesmo componente `Tabs` dos
  filtros. Drag-and-drop entre colunas não se aplica nessa visão (Radix só
  monta o painel ativo); os botões de ação cobrem a mudança de status.

## Limitações conhecidas

- Sem checkout real: pedidos vêm de `supabase/seed.sql` (ver
  [ADR 0002](./adr/0002-client-side-cart-state.md) e `BACKLOG.md`).
- Sem virtualização de lista — aceitável para o volume de uma lanchonete;
  ver `BACKLOG.md`.
- **Sprint 4:** toasts (sonner) e overlays Radix renderizam fora do escopo
  `.dark` (portal no `<body>`) — aparecem com os tokens claros da loja
  dentro da cozinha. Ver [ADR 0007](./adr/0007-module-scoped-visual-identities.md)
  e `BACKLOG.md`.
- **Sprint 4:** não foi possível autenticar como usuário `kitchen`/`manager`
  nesta sessão (sem credenciais de teste seedadas) para validar visualmente
  `/cozinha` via browser automatizado — o redesenho foi verificado por
  build/lint/typecheck/testes (`board-columns.test.ts`, `urgency.test.ts`) e
  revisão de código; recomenda-se validação manual com uma conta real antes
  do merge.
