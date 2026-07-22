# Backlog

Pendências, dívida técnica e melhorias futuras. Organizado por sprint/fase.
Todo item aqui deve ter origem rastreável (sprint que o gerou) — ver
`CHANGELOG.md` para o que já foi entregue e `docs/adr/` para decisões
arquiteturais associadas.

## Sprint 1 — Experiência da Loja (UX)

- ☐ Verificação visual manual do bottom sheet mobile (Drawer/vaul) em
  device/DevTools real — não foi possível validar via automação de browser
  nesta sessão.
- ☐ "Promoções" / "Combos" / "Mais vendidos" como filtros reais — aguardando
  schema de promoções/combos (Fase 1 tardia / Fase 5).
- ☐ Slot de avaliação nos cards de produto — sem modelo de dados ainda.
- ☐ Checkout (submissão de pedido a partir do carrinho) — carrinho hoje é
  client-side, sem persistência; é pré-requisito de fato para o Painel da
  Cozinha ter pedidos reais fluindo (não apenas seed).

## Sprint 2 — Painel da Cozinha

- ☐ **Checkout real** (submissão de pedido a partir do carrinho) — hoje
  `orders` só tem dado de seed. Pré-requisito para o Painel da Cozinha
  operar com pedidos de verdade.
- ☐ **Concorrência de `order_number`**: a trigger `assign_order_number`
  (max+1 por tenant/dia) tem uma janela de corrida sob inserts simultâneos
  (múltiplos caixas). Resolver com tabela de contador dedicada + lock
  quando o checkout real introduzir escrita concorrente.
- ☐ **`estimated_ready_at` automático**: hoje só existe no seed. Calcular a
  partir do `prep_time_minutes` dos itens do pedido (máximo entre eles) é
  responsabilidade da sprint de Checkout.
- ☐ **Tela de histórico de pedidos finalizados** (`status = 'completed'`) —
  hoje eles só somem do board ativo, sem lugar para consultar depois. Fase
  4/Admin.
- ☐ **Virtualização de lista** nas colunas do Kanban — não implementada por
  YAGNI (volume real de uma lanchonete não justifica ainda); reavaliar se o
  volume crescer.
- ☐ **Verificação manual de drag-and-drop e responsividade mobile** — não
  foi possível validar via automação de browser nesta sessão (gestos de
  arrastar multi-etapa e `resize_window` têm limitação conhecida de
  ferramenta, já registrada na Sprint 1 para o bottom sheet). Lógica de
  transição de status está coberta por testes unitários.
- ☐ Ocultar o botão "Prioridade" em cards de pedidos em estado terminal
  (`cancelled`/`completed`) — hoje ele aparece mesmo sem sentido operacional
  (polimento menor, não bloqueia a sprint).
- ☐ **Motivo de cancelamento via UI**: o campo `cancelled_reason` existe no
  schema, mas o botão "Cancelar" do card não pede um motivo (cancela sem
  reason). Adicionar um diálogo (`shadcn dialog`, ainda não instalado no
  projeto) é a próxima melhoria natural aqui.
- ☐ Testes de componente (Testing Library + jsdom) para `features/kitchen/`
  — o Vitest introduzido nesta sprint só cobre lógica pura por ora (ver
  `docs/conventions.md`).
