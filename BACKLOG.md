# Backlog

Pendências, dívida técnica e melhorias futuras. Organizado por sprint/fase.
Todo item aqui deve ter origem rastreável (sprint que o gerou) — ver
`CHANGELOG.md` para o que já foi entregue e `docs/adr/` para decisões
arquiteturais associadas.

## Sprint 6 — Redesign da Experiência do Cliente (Fases 1-3: Sidebar, Home/Hero, Sobre/Contato/Footer)

Ver `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`
(spec geral) e specs/plans por fase. Achados dos reviews finais (branch
`dev`):

- ☐ **`useScrollSpy` sem nenhum teste** (achado no review da Fase 2):
  `features/menu/use-scroll-spy.ts` não tem `use-scroll-spy.test.ts` —
  cobertura zero no hook que toda a navegação por âncora (sidebar, drawer,
  agora também "Home") depende. Pré-existente, não introduzido pela Fase
  1/2, mas vale testar isoladamente (ids observados, `topOffsetPx`,
  cruzamento de seções) já que o hook ganhou mais um consumidor.
- ☐ **Import do ícone `Home` inconsistente entre sidebar e drawer**
  (achado Minor, Fase 2): `store-sidebar.tsx` agrupa com o import externo
  de `lucide-react`; `store-mobile-nav.tsx` ficou solto no meio dos
  imports internos. Cosmético, lint não acusa.
- ☐ **`SOCIAL_LINK_CLASS` duplicada em 2 arquivos** (achado Minor, Fase
  3): `store-contact-section.tsx` e `store-footer.tsx` redeclaram a mesma
  string utilitária (só o tamanho do ícone difere, `size-11` vs
  `size-10`). Extrair pra `social-icons.tsx` com um prop de tamanho se um
  terceiro consumidor aparecer.
- ☐ **Texto de "Sobre Nós" é rascunho aprovado, não conteúdo revisado
  pelo lojista**: história/missão/especialidade em `store-about.tsx`
  foram escritos nesta sessão baseados no tom das referências visuais do
  usuário — trocar pelo texto definitivo quando o lojista revisar.

- ☐ **TikTok sem ícone no rodapé de contato**: não existe campo no banco
  (`tenants` não tem coluna de TikTok) — decisão de escopo (sprint é
  frontend-only, sem alterar schema). Adicionar quando o campo existir.
- ☐ **WhatsApp usa ícone genérico (`MessageCircle`), não um ícone de marca**:
  `features/menu/social-icons.tsx` já tem `InstagramIcon`/`FacebookIcon`
  desenhados à mão (lucide-react instalado não tem ícones de marca) — um
  `WhatsAppIcon` no mesmo padrão deixaria o rodapé visualmente consistente
  (hoje lê como "chat, Instagram, Facebook" em vez de três marcas).
- ☐ **Rodapé de contato mobile sem `safe-area-inset-bottom`**:
  `StoreContactFooter` dentro do `StoreMobileNav` (Drawer) só tem `py-4`;
  a lista de categorias anterior tinha
  `pb-[calc(env(safe-area-inset-bottom)+1rem)]` para não colidir com a
  barra de gestos do iOS. Baixo impacto (~16px de folga), mas vale ajustar.
- ☐ **Dados reais de contato ainda não vêm do banco**: telefone, WhatsApp,
  Instagram, Facebook e endereço (`features/menu/contact-info.ts`) são
  constantes frontend, não `tenants.phone/whatsapp/instagram/facebook/address`
  — mesma pendência já registrada abaixo ("Conectar o storefront à
  configuração real da loja"), que também cobre esses campos agora.
- ☐ **Verificação visual real (browser) não realizada**: `claude-in-chrome`
  indisponível nesta sessão para a Fase 1 (mesma limitação já registrada em
  sprints anteriores) — validado só por build/typecheck/lint/testes (98/98)
  e revisão de código; recomenda-se conferência manual em navegador/device
  antes ou logo após o merge de `dev` para `main`.

## Pré-Sprint 6 — Auditoria Técnica

Achados novos da auditoria completa (Principal Engineer, 2026-07-24) — ver
relatório detalhado em [`docs/audit-pre-sprint-6.md`](docs/audit-pre-sprint-6.md)
com file:line e plano de ação. Itens que já existiam neste backlog (rate
limiting, DI nos services, dashboard sem `GROUP BY`, etc.) permanecem nas
seções originais abaixo, só ganharam referência cruzada no relatório.

- ☐ **Multi-tenant é hoje mono-tenant hardcoded** (🔴 crítico): tenant
  resolvido só via `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`
  (`lib/tenant/get-tenant-context.ts`), sem roteamento por subdomínio/path.
  RLS e `tenant_id` estão prontos no schema, mas não há mecanismo real de
  rotear dois hosts de produção para tenants diferentes. Maior gap contra o
  objetivo declarado de SaaS multi-tenant (Fase 6 do roadmap) — decidir
  conscientemente (ADR) se a Sprint 6 endereça isso ou adia.
- ☐ **Sem cache/revalidation no cardápio público** (🟡 importante):
  `app/(store)/page.tsx` e `app/api/menu/route.ts` fazem round-trip completo
  ao DB em toda visita, sem `revalidate`/`unstable_cache`. Candidato a ISR
  por tenant quando tráfego real justificar.
- ☐ **`exportOrders` sem nenhum cap** (🟡 importante):
  `services/admin/export.service.ts` chama `findOrdersInDateRange` direto,
  sem o `EXPORT_PAGE_SIZE = 10_000` que protege os outros exports — para
  range de data amplo é consulta ilimitada. Estende o item já rastreado
  abaixo sobre `EXPORT_PAGE_SIZE`.
- ☐ **`findActiveOrdersByTenant` sem `LIMIT`** (🟡 importante): board da
  cozinha busca todos pedidos ativos do tenant sem teto
  (`repositories/orders.repository.ts`). Distinto da virtualização de lista
  já rastreada (que é sobre renderização, não a query).
- ☐ **Inconsistência de camada services/repositories** (🟡 importante):
  `login-form.tsx` e `image-upload.tsx` acessam o client Supabase direto no
  componente, pulando services/repositories usado no resto do projeto.
  Extrair `auth.service.ts` e mover lógica de upload para um service.
- ☐ **Sem posição documentada sobre connection pooling / limites
  serverless** (🟡 importante): nenhum `vercel.json`, nenhuma decisão
  registrada sobre modo de pooling do lado Supabase. Vale um parágrafo em
  `docs/deployment.md` (arquivo esperado pelo `CLAUDE.md`, ainda não criado).

## Sprint 5.5 — Hardening

- ☐ **`logger.info`/`logger.warn` sem uso ainda** (Fase 0): só
  `logger.error` foi conectado, no ponto onde já havia lacuna clara (rotas
  de API sem log nenhum). Instrumentar pontos de sucesso relevantes é
  decisão para quando surgir necessidade real de observar algo
  específico, não preventiva.
- ☐ **npm audit aponta 2 vulnerabilidades (postcss/sharp)**, achado ao
  instalar `@sentry/nextjs` (Fase 0) — ambas são dependências transitivas
  do próprio Next.js, e `npm audit fix --force` sugeriria downgrade para
  `next@9.x` (claramente errado). Rastrear se uma versão futura do Next
  resolve nativamente antes de qualquer ação manual.
- ☐ **Sem upload de source maps ao Sentry**: precisaria de `org`/
  `project`/`authToken` novos no `withSentryConfig` — eventos chegam sem
  stack trace desminificado por ora. Ver `docs/observability.md`.
- ☐ **Auditoria de "impressão" não implementada** (decisão de escopo, ver
  o plano da sprint): não existe nenhum código de execução real de
  impressão ainda (Sprint 5, Fase 8, foi só persistência de configuração)
  — criar um evento de auditoria para uma ação inexistente seria simular
  dado. Vira gancho natural quando a impressão real (ESC/POS) existir.
- ☐ **Auditoria de cancelamento cobre só a transição para `cancelled`**
  (Fase 1) — generalizar para toda transição de status do pedido
  (`changeOrderStatus`) é uma extensão natural se der valor rastrear todo
  o ciclo, não só o cancelamento.
- ☐ **Verificar se campos de URL (`logoUrl`/`bannerUrl`/`promoBannerUrl`
  em Configuração da Loja, `imageUrl` em Produtos/Combos) têm o mesmo bug
  que o campo "Cor" tinha** (regex/validação rodando antes da
  normalização de string vazia) — não confirmado, só suspeita por ser o
  mesmo padrão (`z.string().url().optional().nullable()`); investigar na
  Fase 6 (revisão de segurança) desta sprint.
- ☐ **Exportação de pedidos usa janela fixa de 30 dias** (Fase 3) — a rota
  aceita `from`/`to` via query string, mas a UI (`/admin/configuracoes`)
  não oferece seletor de período, só o link com o padrão. Adicionar um
  seletor de data é uma melhoria de UX natural se o período fixo não for
  suficiente na prática.
- ☐ **`EXPORT_PAGE_SIZE = 10_000` é um limite implícito** (Fase 3) — se um
  tenant algum dia tiver mais de 10 mil produtos/logs de auditoria, a
  exportação trunca silenciosamente em vez de paginar ou avisar. Não é um
  risco real no volume de uma lanchonete de porte único, mas fica
  registrado.

## Login e primeiro acesso

- ☐ **Sem "esqueci minha senha" na tela de login**: `/login` só cobre o
  caminho feliz (email/senha corretos); não há link de recuperação
  (`supabase.auth.resetPasswordForEmail`) nem tela para definir nova senha.
- ☐ **Bootstrap do primeiro usuário é manual** (fora do painel): documentado
  em `docs/security.md`, mas seria natural ter um comando/script oficial
  (`npm run seed:owner` ou similar) em vez de um script ad-hoc a cada novo
  tenant.
- ☐ **Sem rate limiting em `/login`**: mesma lacuna já registrada para
  `/api/checkout` desde a Sprint 1 — um script poderia tentar senhas em
  loop contra `signInWithPassword` (o próprio Supabase Auth aplica algum
  rate limit por padrão, mas não há camada adicional do lado do app).
- ☐ **`cashier`/`waiter` não têm painel dedicado**: `resolveLandingPath`
  manda esses papéis para `/` (loja pública) após o login, por não existir
  ainda uma tela de caixa/garçom — revisar quando essas telas existirem.

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
- ☐ **Usuário de auth órfão se o convite falhar entre `auth.admin.inviteUserByEmail`
  e o `insert` em `profiles`** (Fase 6): o convite já foi enviado mas sem
  perfil correspondente, o link fica inutilizável — sem rotina de
  reenvio/limpeza ainda. Ver [ADR 0009](docs/adr/0009-admin-api-user-invites.md).
- ☐ **`profiles.email` não sincroniza se o usuário trocar o email em
  `auth.users`** (Fase 6): é uma cópia escrita no convite, não uma view —
  RLS não alcança o schema `auth` para fazer `join` em toda leitura.
- ☐ **Sem proteção contra remover o último `owner`/`manager` de um tenant**
  (Fase 6): a UI permite desativar ou trocar o papel de qualquer usuário
  (exceto o próprio ator) — nada impede desativar todos os gestores de uma
  vez, deixando o tenant sem ninguém com acesso de gestão.
- ☐ **Validação manual de `/admin/funcionarios` com conta real** (convite,
  troca de papel, ativação/desativação) — sem credenciais de teste
  seedadas nesta sessão; coberto por build/lint/typecheck e revisão de
  código, não por teste end-to-end real (mesma limitação das fases
  anteriores).
- ☐ **`TenantNotFoundError` duplicada em cada `services/admin/*.service.ts`**:
  cada service redefine a mesma classe de erro local — funcional (services
  independentes, sem acoplamento entre módulos), mas é repetição literal
  crescendo a cada fase (7 arquivos até aqui). Extrair para um módulo
  compartilhado (`services/admin/errors.ts`) se crescer mais.
- ☐ **Dashboard: agregação em memória, sem `group by` em SQL** (Fase 7):
  `getAdminDashboard` busca até 30 dias de pedidos e agrega em JS —
  aceitável para uma lanchonete de porte único (decisão explícita de
  YAGNI, ver ADR/CHANGELOG da fase), mas não escala para tenants de alto
  volume; migrar para agregação em SQL (`group by`/views materializadas)
  quando o volume justificar.
- ☐ **Dashboard não tem seletor de período**: a janela de 30 dias
  (`WINDOW_DAYS`) é fixa no service — sem UI para o lojista escolher
  "hoje"/"semana"/"mês"/intervalo customizado.
- ☐ **"Pedidos por hora ativa" pode enganar em dias de baixíssimo volume**:
  a métrica divide o total de pedidos pelas horas com pelo menos 1 pedido
  na janela — uma única hora isolada com 1 pedido em 30 dias conta como
  "hora ativa", inflando a média num tenant com poucos dados. Efeito
  diminui com volume real; sem correção nesta fase (YAGNI).
- ☐ **Validação manual do Dashboard com conta real e pedidos reais** (Fase
  7) — sem credenciais de teste seedadas nesta sessão; coberto por
  build/lint/typecheck e revisão de código, não por inspeção visual real
  dos números (mesma limitação das fases anteriores).
- ☐ **Impressão real (ESC/POS)** (Fase 8): `printers` só persiste
  configuração — nenhuma rota/serviço envia bytes para uma impressora de
  verdade ainda. Próximo passo natural: um worker/serviço que reaja a
  pedidos novos (`auto_print`) e monte o payload ESC/POS por `paper_width`/
  `protocol`, respeitando `role` (cozinha/caixa/balcão) para rotear a
  impressão certa.
- ☐ **Sem teste de conectividade da impressora na UI** (Fase 8): o
  formulário salva IP/porta mas não oferece um botão "testar conexão" —
  só faz sentido depois que a impressão real existir.
- ☐ **Validação manual de `/admin/impressoras` com conta real** (Fase 8) —
  sem credenciais de teste seedadas nesta sessão; coberto por
  build/lint/typecheck e revisão de código, não por teste end-to-end real
  (mesma limitação das fases anteriores).

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
- ☑ **Home separada do cardápio, estilo New Dog**: pedido do usuário
  (2026-07-22) — Fase 2 do redesign implementada (`#home`, `StoreHero`, ver
  `docs/superpowers/specs/2026-07-24-client-home-hero-design.md`). Segue
  como placeholder gradiente até existir vídeo/fotos reais dos produtos —
  `StoreHero` já aceita `videoUrl` pronta para o asset futuro.
- ☐ **Verificação de interação real (clique/scroll/highlight) da Home e
  nav "Home" pendente**: `claude-in-chrome` indisponível nesta sessão para
  Fases 1-2 (mesma limitação já registrada) — validado por
  build/typecheck/lint/testes + fetch de HTML real do dev server, não por
  interação de fato. Recomenda-se conferência manual antes do merge
  `dev` → `main`.

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
