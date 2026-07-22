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

## Sprint 2 — Painel da Cozinha

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

## Sprint 3 — Checkout, Criação de Pedidos e Integração Loja → Cozinha

- ☐ **Endereço de entrega / número de mesa**: `dine_in` e `delivery` são
  selecionáveis no checkout, mas sem os campos complementares (endereço,
  número de mesa) — "arquitetura preparada", não implementação completa.
- ☐ **Rate limiting em `/api/checkout`**: risco já anunciado desde a
  Sprint 1 em `docs/security.md` ("entram junto das fases que introduzem
  escrita pelo cliente"); esta é essa fase, e o rate limiting em si ainda
  não foi implementado. Hoje um script poderia submeter pedidos em loop.
- ☐ **Sem teste de concorrência real do `create_order`**: verificado
  manualmente via MCP (números sequenciais corretos, rejeição de itens
  inválidos/pedido vazio), não como teste automatizado repetível — exigiria
  um Postgres de teste dedicado, que o projeto não tem.
- ☐ **Lacuna de DI na camada de services**: `services/*.ts` instanciam o
  client Supabase internamente, sem injeção de dependência — diferente dos
  repositories (sempre recebem `client` por parâmetro, testáveis). Isso
  significa que a orquestração de um service não é unit-testável
  isoladamente hoje. Corrigir é um refactor que afeta toda a camada, não só
  o checkout.
- ☐ **Taxa de serviço/cupom são só placeholders**: `service_fee_cents`,
  `discount_cents`, `coupon_code` existem no schema de `orders` (Fase 5),
  sempre `0`/`null` — sem lógica de aplicação de cupom ou cálculo de taxa
  ainda.
- ☐ **`/pedido/[id]` inexistente cai no 404 padrão do Next.js**, sem
  `not-found.tsx` customizado para essa rota (existe um customizado só em
  `(store)`).
- ☐ **Tela de confirmação e de acompanhamento são a mesma página**
  (`/pedido/[id]`) — decisão registrada em `docs/checkout.md`, não validada
  previamente com o usuário. Se o produto precisar de telas visualmente
  distintas para o momento "acabei de confirmar" vs. "acompanhando depois",
  é um desdobramento localizado desse componente.
- ☐ **Botão "Finalizar pedido" do carrinho fica visível também durante o
  checkout** (`/checkout` está dentro do route group `(store)`, que
  renderiza o `CartButton`/`CartPanel` no layout) — não chega a quebrar o
  fluxo, mas é um resquício de UI que vale revisar numa sprint de polimento
  visual futura.
