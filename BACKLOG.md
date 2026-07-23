# Backlog

Pendências, dívida técnica e melhorias futuras. Organizado por sprint/fase.
Todo item aqui deve ter origem rastreável (sprint que o gerou) — ver
`CHANGELOG.md` para o que já foi entregue e `docs/adr/` para decisões
arquiteturais associadas.

## Sprint 5 — Painel Administrativo como Sistema de Gestão

- ☐ **Reordenação de categorias por arrastar-e-soltar**: hoje `sortOrder` é
  um campo numérico no formulário; drag-and-drop (reaproveitando
  `@dnd-kit`, já instalado para o board da cozinha) seria mais natural para
  o lojista com muitas categorias.
- ☐ **Validação manual de `/admin/categorias` com conta real** (criar,
  editar, excluir, bloqueio de exclusão com produtos) — sem credenciais de
  teste seedadas nesta sessão; coberto por build/lint/typecheck e revisão
  de código, não por teste end-to-end real.
- ☐ **Animação de fechamento do dialog de produto**: `ProductFormDialog` é
  remontado (via `key`) a cada abertura para evitar sincronizar estado
  local por efeito (lint `react-hooks/set-state-in-effect`) — troca
  aceitável: a abertura sempre parte de estado fresco, mas o fechamento
  perde a transição de saída do Radix (a árvore desmonta junto do
  `open=false`). Polimento visual menor.
- ☐ **"Mais vendido" calculado de vendas reais**: hoje `is_bestseller` é um
  toggle manual (`products.is_bestseller`); os dados para calcular
  automaticamente já existem em `order_items` (ver Fase 7 — Dashboard).
- ☐ **Taxonomia compartilhada de ingredientes/alérgenos/tags**: hoje são
  `text[]` de texto livre por produto (decisão de escopo da Fase 2) — sem
  filtro "todos os produtos com glúten" nem autocompletar entre produtos.
  Migrar para tabelas normalizadas (`tags`, `allergens` + tabelas de
  vínculo) se precisar de reuso/filtro entre produtos.
- ☐ **Conectar o storefront à configuração real da loja** (Fase 5): o
  backend já está pronto (`tenants.business_hours`/`store_mode`/
  `avg_prep_time_minutes`, `getAdminStoreSettings`) — falta passar esses
  dados de `app/(store)/page.tsx` até `StoreOpenBadge`/`StoreTopbar` em
  vez da constante `BUSINESS_HOURS` (`features/menu/store-info.ts`,
  Sprint 4). Também aplicar `logo_url`/`primary_color`/`secondary_color`
  reais em vez dos valores fixos da Sprint 4.
- ☐ **Adicionais e Combos vendáveis na loja** (Sprint 6): Fases 3 e 4 desta
  sprint só modelam/administram — o cliente ainda não escolhe adicionais
  nem monta combos ao pedir. Exige mudanças em carrinho/checkout/
  `order_items` (fora do escopo desta sprint, decisão registrada no plano
  da Sprint 5).

## Sprint 4 — Redesign UX/UI: Cardápio de Autoatendimento

- ☐ **Horário de funcionamento por tenant no banco**: hoje `BUSINESS_HOURS` é
  uma constante client (`features/menu/store-info.ts`). Mover para uma
  tabela de configuração do tenant quando existir (`docs/frontend.md`).
- ☐ **`ADD_TO_CART_FEEDBACK` como configuração por tenant**: hoje é uma
  constante client (`features/cart/config.ts`, sempre `"toast"`).
- ☐ **Toaster/overlays theme-aware por rota**: toasts (sonner) e diálogos
  Radix renderizam num portal fora do escopo `.dark`/`.theme-admin` — usam
  os tokens claros da loja mesmo dentro da cozinha/admin. Ver
  [ADR 0007](docs/adr/0007-module-scoped-visual-identities.md).
- ☐ **Verificação visual em viewport mobile via automação de browser**: não
  foi possível nesta sessão (`resize_window` não altera o viewport real
  neste ambiente). Responsividade revisada por código; recomenda-se
  validação manual em device/DevTools antes do merge.
- ☐ **Validação manual de `/cozinha` e `/admin` com conta real**: sem
  credenciais de teste seedadas nesta sessão para autenticar como
  `kitchen`/`manager` e verificar visualmente os redesenhos — cobertos por
  testes de lógica pura e revisão de código, não por inspeção visual real.
- ☐ **Estimativa de preparo do carrinho vinda do backend**: hoje
  `estimateCartPrepMinutes` é `max(prepTimeMinutes)` calculado no client;
  idealmente viria de `estimatedReadyAt` uma vez que o pedido existir.
- ☐ **Admin — CRUD real das 7 páginas placeholder** (Categorias, Clientes,
  Cupons, Relatórios, Configurações, Impressoras, Funcionários) — hoje
  "Em breve"; cada uma precisa de backend próprio (Fase 4/5).
- ☐ **Admin — histórico de pedidos finalizados e realtime na lista de
  Pedidos**: a página atual só mostra pedidos ativos (mesma fonte da
  cozinha) sem realtime; consultar pedidos `completed` é BACKLOG desde a
  Sprint 2.
- ☐ **Home separada do cardápio, estilo New Dog**: pedido do usuário
  (2026-07-22) para uma futura tela de vitrine (hero fullscreen com fotos
  de produtos + carrossel), acessada ao clicar na logo/nome da loja —
  ainda não implementada nesta sprint, aguarda fotos reais dos produtos.

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
