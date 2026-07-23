# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Added — Sprint 5 (Fase 7): Dashboard enriquecido

- Novo `services/admin/dashboard.service.ts`: agrega, em memória, 9
  métricas a partir de uma única consulta de `orders`/`order_items`
  (`repositories/orders.repository.ts#findOrdersInDateRange`, nova) — sem
  tabela nova, sem dado fabricado. Pedidos hoje/em andamento/finalizados
  hoje/cancelados hoje/ticket médio são escopados ao dia atual; produtos
  mais vendidos/horário de pico/pedidos por hora ativa/tempo médio de
  preparo usam uma janela de 30 dias para ter amostra (`WINDOW_DAYS`).
  Agregação em memória por decisão explícita de YAGNI — volume de uma
  lanchonete não justifica `group by` em SQL ainda; registrado no
  `BACKLOG.md` como evolução se o volume crescer.
- `/admin` (Dashboard) reescrito: 6 cards de pedidos/ticket/preparo, lista
  de produtos mais vendidos (`TopProductsList`), gráfico de barras CSS
  (sem lib nova) de pedidos por horário (`HourlyOrdersChart`) com pico e
  média de pedidos/hora — mantém os 3 cards de catálogo já existentes
  (produtos publicados/indisponíveis, categorias).
- `AdminDashboardMetrics`/`AdminTopProduct`/`AdminHourlyOrderCount`
  (`types/domain.ts`).

### Added — Sprint 5 (Fase 6): Usuários (RBAC)

- `profiles` ganha `email` (`0021`, espelho de `auth.users.email` escrito no
  convite) e `is_active` (`0022`, desativação lógica — `getCurrentUser()`
  trata inativo como sem perfil, bloqueia todo guard sem tocar na sessão de
  auth). Enum `user_role` ganha `'waiter'` (`0020`).
- **Convite de usuário via Supabase Admin API**
  (`auth.admin.inviteUserByEmail`) — primeira vez que o projeto cria contas
  de `auth.users` a partir do backend; ver
  [ADR 0009](docs/adr/0009-admin-api-user-invites.md). `super_admin` não é
  atribuível pelo painel (papel de plataforma, provisionamento manual).
- Novo `repositories/users.repository.ts`, `services/admin/users.service.ts`,
  `features/admin/users/` (schema, mutations, `UserInviteDialog`,
  `UsersManager`). Rotas `app/api/admin/users` (`GET`/`POST`) e
  `app/api/admin/users/[id]` (`PATCH` — papel/nome/ativação, sem `DELETE`).
- `/admin/funcionarios`: lista de usuários do tenant com papel e ativação
  editáveis inline (Select/Switch), dialog de convite. Usuário não pode
  alterar o próprio papel/ativação (`CannotModifySelfError`, bloqueado
  também na UI).
- **Achado de segurança corrigido**: `profiles_update_self` (0002) permitia
  auto-escalação de privilégio (`role`/`tenant_id` mudáveis pelo próprio
  usuário via update direto, sem passar por API) — pré-existente, não
  introduzido nesta sprint. Corrigido em
  `0023_protect_profile_privileged_fields.sql` (mesmo padrão de trigger já
  usado em `0019` para `tenants`). Ver `docs/database.md`.
- `AdminUser` (`types/domain.ts`).

### Added — Sprint 5 (Fase 5): Configuração da Loja

- `tenants` ganha campos operacionais (`0018_tenant_store_config.sql`):
  contato (telefone/WhatsApp/Instagram/Facebook/endereço), aparência
  (logo/banners/cores), mensagens (inicial/final), tempo médio de preparo,
  `store_mode` (aberto/fechado/férias/manutenção) e `business_hours`
  (mesmo formato já usado por `features/menu/store-info.ts` na Sprint 4).
- **RLS**: `0019_tenant_config_rls.sql` libera `UPDATE` para
  `is_tenant_manager` (antes só `super_admin` podia escrever em
  `tenants`) + trigger que protege `slug`/`is_active` de alteração por
  quem não é `super_admin` — proteção por coluna que RLS sozinha não
  oferece.
- `/admin/configuracoes`: formulário único com seções (Identidade,
  Contato, Horário, Aparência, Modo da loja); horário editado por dia da
  semana (`BusinessHoursEditor`); logo/banners via upload real
  (`ImageUpload`, Fase 0).
- Nova rota `app/api/admin/store-settings` (`GET`/`PATCH` — recurso
  singular, sem lista/paginação).
- `AdminStoreSettings`/`StoreMode` (`types/domain.ts`).
- **Conexão com o storefront registrada no BACKLOG**, não feita nesta
  etapa: o backend já está pronto, falta ligar
  `StoreOpenBadge`/`StoreTopbar` ao dado real do tenant em vez da
  constante `BUSINESS_HOURS` da Sprint 4.

### Added — Sprint 5 (Fase 4): Combos

- Novas tabelas `combos`, `combo_slots`, `combo_slot_products`
  (`0016_combos.sql`, `0017_combos_rls.sql`) — RLS staff-only, sem policy
  pública (mesma decisão de escopo dos Adicionais: modelagem/CRUD
  administrativo apenas, o cliente ainda não compra combos nesta sprint).
- `/admin/combos`: CRUD de combos (produto principal fixo + slots de
  escolha, ex. "Escolha uma bebida"), com slots e seus produtos elegíveis
  editados inline via `useFieldArray` aninhado (`combo-slot-fields.tsx`,
  componente próprio por slot — hooks não podem ser chamados em loop).
  Preço fixo opcional (`null` = calculado, sem cálculo real ainda) e
  sobrescrita de preço por produto dentro de um slot.
- Novas rotas `app/api/admin/combos` (`GET`/`POST`) e
  `app/api/admin/combos/[id]` (`PATCH`/`DELETE`).
- `AdminCombo`/`AdminComboSlot`/`AdminComboSlotProduct`
  (`types/domain.ts`); novo `repositories/combos.repository.ts` e
  `listProductOptions` (`services/admin/products.service.ts`) para
  popular os selects de produto do formulário de combo.

### Added — Sprint 5 (Fase 3): Grupos de Adicionais

- Novas tabelas `modifier_groups`, `modifier_options`,
  `product_modifier_groups` (N:N) + enum `modifier_selection_type`
  (`0014_product_modifiers.sql`, `0015_product_modifiers_rls.sql`) — RLS
  staff-only, sem policy pública (modelagem/CRUD administrativo apenas
  nesta sprint; o cliente ainda não escolhe adicionais ao pedir).
- `/admin/adicionais`: CRUD de grupos reutilizáveis (ex. "Molhos",
  "Queijos") com suas opções editadas inline no mesmo formulário
  (`react-hook-form` `useFieldArray`) — seleção única/múltipla,
  obrigatório, mínimo/máximo, preço por opção.
- `/admin/produtos`: novo campo "Grupos de adicionais" (checklist) —
  vincula/desvincula grupos existentes ao produto.
- Novas rotas `app/api/admin/modifier-groups` (`GET`/`POST`) e
  `app/api/admin/modifier-groups/[id]` (`PATCH`/`DELETE`).
- `AdminModifierGroup`/`AdminModifierOption` (`types/domain.ts`);
  `AdminProduct` ganha `modifierGroupIds`.
- Novo `repositories/modifiers.repository.ts` (tabelas novas o
  suficiente para justificar arquivo próprio, diferente de
  Categorias/Produtos que estendem `menu.repository.ts`).

### Added — Sprint 5 (Fase 2): CRUD de Produtos

- `products` ganha `promo_price_cents`, `sku` (único por tenant), `is_bestseller`,
  `ingredients`/`allergens`/`tags` (`text[]`), `nutritional_info`
  (`0013_products_admin_fields.sql`, reservado/placeholder — mesmo
  tratamento do campo `rating` no domínio).
- `/admin/produtos`: listagem paginada/buscável (nome/SKU)/filtrável por
  categoria, formulário completo (imagem via upload real — `ImageUpload`,
  Fase 0 —, preço e preço promocional em reais na UI/centavos no domínio,
  SKU, tempo de preparo, ordem, ingredientes/alérgenos/tags como texto
  separado por vírgula, 5 toggles de situação), excluir com confirmação.
- Novas rotas `app/api/admin/products` (`GET`/`POST`) e
  `app/api/admin/products/[id]` (`PATCH`/`DELETE`).
- `AdminProduct` (`types/domain.ts`) — superset de gestão de `Product`; o
  tipo público (vitrine) não muda.
- Removida `features/admin/components/products-table.tsx` (Sprint 4,
  somente leitura) — substituída pelo CRUD completo.

### Added — Sprint 5 (Fase 1): CRUD de Categorias

Primeiro CRUD administrativo ponta a ponta — valida o template inteiro
(migration → repository → service → rota → schema Zod → formulário →
tabela → confirmação) que as próximas fases (Produtos, Adicionais, Combos...)
replicam.

- `categories` ganha `icon`, `color`, `is_available`
  (`0012_categories_admin_fields.sql`) — `is_active`/`is_available` passa a
  espelhar o par já existente em `products`
  (`is_published`/`is_available`).
- `/admin/categorias`: listagem paginada/buscável/ordenável (server-side),
  criar/editar (dialog único, `react-hook-form` + Zod), excluir (com
  confirmação e bloqueio se a categoria ainda tiver produtos — o FK é `on
  delete cascade`, apagaria os produtos junto).
- Novas rotas `app/api/admin/categories` (`GET`/`POST`) e
  `app/api/admin/categories/[id]` (`PATCH`/`DELETE`), seguindo o mesmo
  padrão auth→Zod→service→erro-de-domínio já usado pela cozinha.
- `AdminCategory` (novo tipo de domínio, `types/domain.ts`) — superset de
  gestão de `MenuCategory`, não exposto à vitrine pública.
- `lib/slug.ts` (`slugify`, testado): deriva o slug do nome, acento-
  insensível, mesma técnica de normalização já usada em
  `features/search/search-utils.ts`.
- `features/admin/components/{admin-list-toolbar,admin-list-pagination}.tsx`:
  busca (debounced) e paginação reutilizáveis por toda listagem
  administrativa futura.

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
