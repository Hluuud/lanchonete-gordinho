# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Added — Sprint 5 (Fase 0): Fundação dos CRUDs administrativos

Primeira fase da Sprint 5 ("Painel Administrativo como Sistema de Gestão")
— instala as peças de design system e a infraestrutura que todo módulo de
gestão (Categorias, Produtos, Adicionais, Combos, Configuração, Usuários,
Impressoras) vai reusar, sem ainda implementar nenhum CRUD.

- Componentes shadcn/ui novos: `dialog`, `alert-dialog`, `select`,
  `textarea`, `checkbox`, `switch`, `table`, `pagination` — traduzidos para
  pt-BR e ajustados às variantes/tamanhos do `Button` já existente no
  projeto (`primary|secondary|accent|outline|ghost` / `sm|md|lg|icon`, sem
  `"default"`).
- **Supabase Storage**: bucket público `store-assets`
  (`0011_store_assets_bucket.sql`) com RLS reusando `is_tenant_manager`/
  `is_super_admin` — primeira vez que o projeto usa Storage. Ver
  [ADR 0008](docs/adr/0008-supabase-storage-for-media.md).
- `components/image-upload.tsx`: upload direto do browser, preview,
  validação de tipo (PNG/JPEG/WebP) e tamanho (5 MB).
- `components/confirm-dialog.tsx`: confirmação genérica de ações
  destrutivas (`AlertDialog`).
- `features/admin/pagination.ts`: paginação/busca/ordenação server-side
  (`parseListParams`, `sort` com allowlist), testado (12 testes novos).
- `getAdminApiUser()` (`lib/admin/roles.ts`), espelhando
  `getKitchenApiUser()` — guarda de autorização para as futuras rotas
  `/api/admin/*`.
- Padrões de formulário/mutação/paginação/exclusão para todo CRUD
  administrativo documentados em `docs/frontend.md`.

### Added — Sprint 4: Redesign UX/UI — Cardápio de Autoatendimento

Sprint exclusivamente de frontend (nenhum schema, migration, repository,
service ou API route mudou de contrato) — três módulos ganharam identidade
visual própria e a loja virou um verdadeiro cardápio digital de
autoatendimento (referências de experiência: New Dog, Goomer, Consumer).
Detalhe completo em `docs/frontend.md` (novo).

- **Paleta da marca**: tokens migrados do vermelho/âmbar da Sprint 1 para
  laranja/preto/branco derivados da logo oficial (`public/brand/logo.png`,
  `BrandLogo`); `themeColor` do PWA atualizado.
- **Loja — shell de autoatendimento**: `StoreSidebar` fixa (desktop/totem)
  com busca e navegação de seções com ScrollSpy; `StoreTopbar` sticky com
  status Aberto/Fechado, tempo médio de preparo e carrinho; `StoreMobileNav`
  (drawer) complementa a `CategoryNav` horizontal no celular.
- **Seções virtuais derivadas de badges** (`features/menu/virtual-sections.ts`):
  "Promoções & Destaques" (`isFeatured`) e "Novidades" (`isNew`), ocultas
  quando vazias — "Combos"/"Mais Vendidos" ficam de fora até existir schema
  (nada de dado fabricado).
- **Cards de produto maiores**: grid relaxado (1/2/3 colunas), botão
  "Adicionar" com rótulo, banner principal maior (carrossel existente
  redesenhado).
- **Carrinho redesenhado**: estimativa de preparo (`estimateCartPrepMinutes`
  — maior tempo entre os itens), pulso animado no contador ao adicionar,
  drawer mobile quase fullscreen, oculto durante `/checkout`.
- **Painel da Cozinha — redesenho industrial**: identidade `.dark` escopada
  ao módulo (alto contraste); board reduzido a **4 colunas visuais**
  (`lib/kitchen/board-columns.ts`) agrupando os 7 status reais — a máquina
  de estados (`lib/kitchen/order-status.ts`) não mudou; drag-and-drop
  resolvido por `resolveDropPath` (uma coluna visual por vez,
  `changeStatusPath` reverte só o passo que falhar); auto-hide visual de
  pedidos finalizados após 5 min (`KITCHEN_DONE_AUTOHIDE_MS`, nunca chama a
  API); cartão com senha gigante, cor por urgência do tempo de espera,
  toggle de prioridade oculto em pedidos já entregues (fecha item da
  Sprint 2), cancelados movidos para um filtro dedicado fora das colunas.
- **Painel Administrativo — shell + primeiras páginas reais**: menu lateral
  ERP (`features/admin/nav.ts`), identidade `.theme-admin`; Dashboard,
  Pedidos e Produtos com dados reais (reusam `getActiveKitchenOrders` e
  `getMenuByTenantSlug` direto do Server Component, sem backend novo);
  demais itens do menu como placeholders "Em breve".
- **ADR 0007**: identidades visuais por módulo via classes de escopo de
  tokens CSS (`:root`/`.dark`/`.theme-admin`) — zero duplicação de
  componentes do design system.
- Novos testes (lógica pura): seções virtuais, horário/status da loja,
  estimativa de preparo do carrinho, mapeamento de colunas visuais da
  cozinha, limiares de urgência (38 testes novos — 33 → 71).
- `KITCHEN_BOARD_COLUMNS` (`lib/kitchen/order-status.ts`) removido — órfão
  desde que o board passou a usar `KITCHEN_VISUAL_COLUMNS`.

### Known limitations

- Verificação visual em viewport mobile via automação de browser não foi
  possível nesta sessão (`resize_window` não altera o viewport real neste
  ambiente — mesma limitação já registrada nas Sprints 1/2); responsividade
  revisada por código (classes `lg:`/`md:` seguem o mesmo padrão já testado
  visualmente em sprints anteriores). Recomenda-se validação manual em
  device/DevTools antes do merge.
- Não foi possível autenticar como `kitchen`/`manager` nesta sessão (sem
  credenciais de teste seedadas) para validar visualmente `/cozinha` e
  `/admin` via browser — verificado por build/lint/typecheck/testes e
  revisão de código.
- Toasts e overlays Radix não são "cientes" do tema do módulo (portal no
  `<body>`, fora do escopo `.dark`/`.theme-admin`) — ver ADR 0007.

### Added — Sprint 3: Checkout, Criação de Pedidos e Integração Loja → Cozinha

Fluxo completo ponta a ponta: carrinho → checkout → pedido persistido →
Realtime → Painel da Cozinha, e página pública de acompanhamento com QR
Code. Fecha a Fase 1 do roadmap (checkout era a peça que faltava).

- **Número do pedido atômico**: `order_counters` + upsert atômico substitui
  o `MAX()+1` da Sprint 2 (dívida técnica eliminada) —
  [ADR 0005](docs/adr/0005-atomic-order-number.md).
- **Criação de pedido transacional**: função Postgres única `create_order`
  (`SECURITY DEFINER`) valida produto/quantidade/disponibilidade, nunca
  confia em preço do client, gera a senha e retorna o pedido completo numa
  única chamada — [ADR 0006](docs/adr/0006-transactional-checkout-rpc.md).
- **Checkout** (`/checkout`): tipo de pedido (retirada/consumo no
  local/entrega), nome opcional, observação, resumo, confirmação com
  loading/erro/retry (`features/checkout/`).
- **Acompanhamento público** (`/pedido/[id]`): senha, itens, total, stepper
  de status em tempo real, tempo estimado, QR Code (gerado no servidor,
  `lib/checkout/qr-code.ts`) e link compartilhável. Serve tanto de
  confirmação pós-checkout quanto de alvo do QR.
- **Segurança do tracking público**: nova tabela `order_tracking_status`
  (espelho de `orders` sem PII, sincronizada por trigger) — `orders`
  continua staff-only; só ela e `order_items` (sem PII) ficam públicas.
- Novos módulos: `features/checkout/`, `lib/checkout/`,
  `services/checkout.service.ts`, `app/api/checkout/`, `app/pedido/[id]/`.
  Mapper `toOrder`/`toOrderItem` extraído para `lib/kitchen/order-mapper.ts`
  (compartilhado com o Painel da Cozinha).
- `docs/roadmap.md` e `docs/backend.md` criados (previstos no `CLAUDE.md`,
  nunca existiam).
- Testes expandidos: validação de checkout, mapeamento de erros do
  repository/service, máquina de estados (Vitest).

### Fixed

- **Crítico**: nenhuma tabela estava na publicação `supabase_realtime` do
  Postgres — o Realtime nunca entregou um evento sequer neste projeto, nem
  para o Painel da Cozinha (Sprint 2). Só não foi detectado antes porque a
  verificação da Sprint 2 usou dados mocados. Corrigido
  (`0010_realtime_publication.sql`) e verificado ponta a ponta nesta sessão.
- Seed da Sprint 2 quebrou com a remoção da trigger de `order_number`
  (schema agora exige o valor explícito) — `supabase/seed.sql` atualizado
  para atribuir a senha diretamente e sincronizar `order_counters`.

### Known limitations

- Sem endereço de entrega ou número de mesa (`dine_in`/`delivery`
  selecionáveis, sem os campos complementares).
- Sem rate limiting em `/api/checkout` (risco já anunciado desde a Sprint 1
  em `docs/security.md`, ainda não implementado).
- Sem teste de concorrência real do `create_order` — verificado manualmente
  via MCP, não como teste automatizado (exigiria Postgres de teste dedicado).

### Added — Sprint 2: Painel da Cozinha

Kanban de pedidos em tempo real para a cozinha (`/cozinha`, Fase 2 do
roadmap). Primeira sprint com domínio de escrita autenticada
(`orders`/`order_items`) e primeiro uso de Supabase Realtime na plataforma.

- **Schema**: migrations `0004_orders_schema` (`orders`, `order_items`,
  enums `order_status`/`order_type`, trigger de "senha" sequencial por
  tenant/dia) e `0005_orders_rls` (RLS + helper `is_tenant_staff`). Seed
  estendido com 10 pedidos de exemplo cobrindo as 6 colunas do board.
- **Board**: colunas Novo Pedido/Aceito/Em Preparo/Pronto/Entregue/Cancelado,
  atualizadas via Supabase Realtime (reducer local + patch otimista com
  reversão em falha — [ADR 0003](./docs/adr/0003-kitchen-realtime-state-model.md)).
  Drag-and-drop entre colunas (`@dnd-kit` —
  [ADR 0004](./docs/adr/0004-drag-and-drop-library.md)), com botão de ação
  equivalente em todo card (acessibilidade/tablet/TV da cozinha).
- **Card**: senha, horário, timer de tempo decorrido, tempo previsto, itens
  com observação, tipo (retirada/entrega), badges de prioridade e atraso.
- **Filtros e busca**: Todos/Retirada/Entrega/Em atraso/Prioridade + busca
  por senha, produto ou cliente (client-side, sem chamada extra ao Supabase).
- **Som**: aviso de novo pedido via Web Audio API (sem asset de áudio),
  toggle persistido e sincronizado entre abas/telas.
- **Responsividade**: colunas com scroll horizontal em desktop/tablet/TV;
  Tabs (uma coluna por vez) em mobile.
- **Testes**: Vitest introduzido (novo no projeto) para a máquina de estados
  de status e os formatters de tempo.
- Novo módulo `features/kitchen/`, `lib/kitchen/`,
  `repositories/orders.repository.ts`, `services/kitchen-orders.service.ts`,
  `app/api/kitchen/orders/*`. Novo primitivo de design system: `warning` no
  `Badge`; `Tabs`/`Input` (shadcn).

### Known limitations

- Sem checkout real: pedidos vêm de `supabase/seed.sql`, não de um fluxo de
  compra — ver `BACKLOG.md`.
- Verificação de drag-and-drop e do layout mobile via automação de browser
  não foi possível nesta sessão (mesma limitação de ferramenta já registrada
  abaixo, agora também para gestos de arrastar multi-etapa) — lógica de
  transição de status está coberta por testes unitários; recomenda-se
  validação manual em device/DevTools antes do merge.

### Added — Sprint 1: Experiência da Loja (UX)

Redesign completo da loja pública, inspirado em iFood/McDonald's/Burger
King/Goomer, mantendo a identidade da Lanchonete do Gordinho. Sprint
exclusivamente visual/UX — nenhuma regra de negócio ou schema alterado.

- **Home**: Hero de boas-vindas, banner rotativo de destaques (`is_featured`,
  dados reais), fileira de "Novidades" (`is_new`), navegação de categorias
  sticky com indicador de seção ativa (scroll-spy) e ícones.
- **Busca**: instantânea, com debounce, por nome/descrição/categoria
  (acento-insensível); alterna para um modo de resultados com contagem e
  estado vazio dedicado.
- **Filtros**: por badge (Destaques/Novidades) e ordenação por preço.
  "Promoções"/"Combos"/"Mais vendidos" ficam de fora até existir schema e
  dados reais (ver `docs/architecture.md`).
- **Cards de produto**: redesenhados — imagem maior, sombra e elevação no
  hover, preço em destaque, slot de avaliação preparado (sem dado ainda),
  estado "indisponível" explícito.
- **Carrinho**: novo (`features/cart/`) — botão flutuante com contagem e
  subtotal ao vivo, painel adaptativo (Drawer/bottom sheet no mobile via
  `vaul`, Sheet lateral no desktop via Radix Dialog), quantidade, observação
  por item, subtotal em tempo real. Client-side, sem persistência — ver
  [ADR 0002](./docs/adr/0002-client-side-cart-state.md).
- **Estados**: skeleton redesenhado (sem spinners), vazio (carrinho, busca),
  offline (`components/offline-banner.tsx`), erro e não-encontrado
  (`app/(store)/error.tsx`, `not-found.tsx`) com boundaries do App Router.
- **Acessibilidade**: `aria-live` em busca/carrinho, foco visível, navegação
  por teclado nos painéis (Radix/vaul), animações respeitam
  `prefers-reduced-motion` (Framer Motion).
- Novos primitivos de design system: `Sheet`, `Drawer`, `EmptyState`,
  `QuantityStepper`; `Button` ganhou suporte a `asChild`.

### Fixed

- `SearchBar` mantinha estado de input não sincronizado com o pai — limpar
  filtros externamente não limpava o texto digitado. Corrigido tornando o
  componente totalmente controlado.
- Indicador de categoria ativa não atualizava corretamente para a última
  seção (curta) da página; troca de margem percentual por uma "linha de
  detecção" medida em runtime.
- Ícone nativo de limpar busca (`type="search"`) duplicava o botão de limpar
  customizado.

### Known limitations

- Verificação visual do bottom sheet mobile não foi possível nesta sessão
  (limitação da ferramenta de automação de browser, `resize_window` não
  surtiu efeito no ambiente). Lógica responsiva (`useMediaQuery` + `vaul`) é
  padrão e devidamente tipada, mas recomenda-se validação manual em
  dispositivo/DevTools antes do merge.
