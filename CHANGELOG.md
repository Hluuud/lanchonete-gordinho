# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Added — Sprint 8, Fase 0: Infraestrutura de assets de marca

Camada de identidade "fora da página": ícone da aba, ícone na home screen,
splash do PWA e card de compartilhamento. Nenhuma migration, nenhuma
alteração de fluxo. Todos os assets derivam de `public/brand/logo.png` — a
logo definitiva substitui esse arquivo e um comando regenera o conjunto.

- **Gerador (`scripts/generate-brand-assets.mjs`, `pnpm brand:assets`).**
  `sharp` produz 18 arquivos a partir da logo: `app/icon.png`,
  `public/favicon.ico`, `app/apple-icon.png`, `public/icons/icon-{192,512}.png`,
  `icon-maskable-512.png`, 11 splash screens de iOS e
  `public/brand/og-default.png` (1200×630). Recorta a moldura branca da logo
  original e aplica máscara circular — sem isso o ícone vira um quadrado
  branco na aba escura.
- **Fonte da verdade (`lib/brand/`).** `tokens.json` (nome, tagline, cores
  hex convertidas dos tokens `oklch` de `globals.css`) e
  `splash-targets.json` são lidos tanto pelo gerador (via `fs`) quanto pelo
  app (import tipado) — uma cor muda em um lugar só.
- **Manifest PWA (`app/manifest.ts`).** `/manifest.webmanifest` com
  `display: standalone`, `start_url: /` (quem instala é o cliente, não o
  admin), `background_color` no marrom da marca e ícone `maskable`.
- **Metadata (`app/layout.tsx`).** `metadataBase`, `openGraph`, `twitter`
  (`summary_large_image`), `icons`, `appleWebApp` e as tags
  `apple-touch-startup-image` por resolução.
- **`NEXT_PUBLIC_SITE_URL`** (opcional) em `lib/env.ts` e `.env.example`:
  base das URLs absolutas de Open Graph. Sem ela, cai em `VERCEL_URL` ou
  `localhost`.
- **Proxy.** O matcher passa a excluir `.ico`, `.webmanifest`, `.avif`,
  `.mp4` e `.webm` — assets públicos não precisam de revalidação de sessão.
- **ADR 0011** (`docs/adr/0011-brand-assets-generated-from-single-source.md`):
  por que gerar por script offline e commitar, em vez de exportar à mão,
  gerar no build ou gerar em runtime via `ImageResponse`. Sprint Report em
  `docs/superpowers/reports/2026-08-05-sprint-8-fase-0-brand-assets.md`.

### Changed — Sprint 7: Identidade Visual da Área do Cliente

Sprint exclusivamente de frontend da loja. Nenhuma migration, nenhuma
alteração em checkout, carrinho, realtime, admin, cozinha ou impressão.
Única exceção autorizada: três colunas a mais no `SELECT` público do
cardápio (mesma query, mesmo número de round-trips ao Supabase).

- **Paleta (Fase 0).** O bloco `:root` passa a ser preto/creme com vermelho
  pontual; o laranja da logo vira `--accent`. `.dark` (cozinha) e
  `.theme-admin` não mudaram. Novos tokens `--surface-dark*` descrevem a
  superfície escura da marca. Fonte de display Anton (`--font-display`).
  Ver `docs/adr/0010-storefront-brand-identity.md`.
- **Navegação (Fase 1).** `features/menu/nav.ts` (`STORE_NAV_ITEMS`) vira a
  fonte única da sidebar, do drawer mobile e dos links do rodapé; os itens
  eram blocos JSX duplicados entre sidebar e drawer. `StoreNavLink`
  concentra as regras de estado; sidebar passa a ser escura. `SocialLink`
  elimina a `SOCIAL_LINK_CLASS` repetida e `WhatsAppIcon` substitui o
  `MessageCircle` genérico.
- **Dados do produto (Fase 2).** `promo_price_cents`, `is_bestseller` e
  `tags` passam a chegar ao domínio público. `selectBestsellers` sinaliza
  quando caiu no fallback dos destaques.
- **Hero (Fase 3).** `HeroMedia` com vídeo em autoplay mudo, pôster e
  placeholder; URLs em `features/menu/media.ts` (hoje nulas). Faixa de três
  promessas (`StoreValueProps`) logo abaixo.
- **Cardápio (Fase 4).** Descrição por categoria
  (`features/menu/category-content.ts`), cabeçalho em fonte de display,
  card com badge de mais vendido, rótulos do lojista, tempo de preparo sobre
  a foto e hover mais presente. Busca considera os rótulos; filtro ganha o
  chip "Mais vendidos".
- **Seções novas (Fase 5).** `#mais-vendidos`, `#combos` e `#promocoes`
  completam os sete itens de navegação. Combos são sugestões montadas com
  produtos reais do cardápio (`combo-suggestions.ts`), somando o preço real
  dos itens e usando o carrinho existente.
- **Institucional (Fase 6).** Sobre/Contato repaginados, rodapé sobre o
  preto da marca com links vindos de `STORE_NAV_ITEMS`, área segura do iOS
  corrigida no Drawer e skeleton alinhado ao novo shell.

Duas coisas ficaram deliberadamente fora, por não terem como ser honestas
hoje (ambas registradas no BACKLOG):

- **Preço promocional na vitrine.** `create_order` (migration 0009) calcula
  `unit_price_cents` a partir de `products.price_cents` e ignora
  `promo_price_cents` — anunciar o desconto cobraria o preço cheio.
- **Combos reais do banco.** A RLS de `combos` é staff-only (migration
  0017) e o checkout não vende combo.

### Added — Sprint 6 (Fase 5): Redesign da Experiência do Cliente — Promoções

- Nova faixa full-width `StorePromoBanner` (`#promocoes`), entre a Home e o
  Cardápio: gradiente laranja/preto (mesma paleta do Hero), ícone
  `Sparkles`, título "Fique de olho nas nossas promoções", botão "Ver
  Cardápio" (rola até `#cardapio`).
- Banner único estático, sem carrossel (sem lib nova instalada) e sem item
  de navegação próprio (não entra na sidebar/drawer nem no
  `useScrollSpy`) — decisões confirmadas com o usuário.
- Conteúdo é rascunho editável, sem inventar desconto/oferta específica;
  `promoBannerUrl` real (admin) segue fora de escopo — não mapeado pelo
  service/repository público do storefront. Registrado no BACKLOG.
- Escopo: quinta e última fase do redesign da área do cliente — ver
  `docs/superpowers/specs/2026-07-25-client-promo-banner-design.md`.

### Added — Sprint 6 (Fase 4): Redesign da Experiência do Cliente — Cardápio Premium

- `ProductCard`: imagem mais alta (`aspect-5/4`→`aspect-4/3`), hover com
  leve "levantada" 3D (`hover:scale-[1.01]` somado a `-translate-y-1`/
  `shadow-xl` já existentes).
- `MenuSection`: cabeçalho de categoria mais forte — ícone maior
  (`size-12`/`rounded-2xl`), título `text-2xl font-black` (`sm:text-3xl`),
  separador `border-b` entre categorias.
- Novo item de navegação "Cardápio" (ícone `UtensilsCrossed`) acima da
  lista de categorias, na sidebar desktop e no drawer mobile — visual
  discreto de cabeçalho de grupo, rola até `#cardapio`, sem estado ativo
  próprio (as categorias abaixo já mostram o delas).
- Fora de escopo (confirmado com o usuário, mesma categoria de restrição
  da Fase 1): tags "Mais Vendido"/"Promoção"/"Artesanal" e descrição/
  imagem por categoria — dado não existe no service/repository público do
  cardápio. Registrado no BACKLOG.
- Escopo: quarta de 5 fases do redesign da área do cliente — ver
  `docs/superpowers/specs/2026-07-25-client-menu-polish-design.md`.

### Added — Sprint 6 (Fase 3): Redesign da Experiência do Cliente — Sobre Nós/Contato/Footer

- Nova seção `#sobre` (`StoreAbout`): história, missão, qualidade dos
  ingredientes e especialidade da casa (texto aprovado), grid de 3 itens,
  placeholders de imagem (ambiente/lanches — nenhuma foto real ainda).
- Nova seção `#contato` (`StoreContactSection`): mapa do Google embutido
  (sem chave de API), cards de endereço/telefone/horário (reaproveitando
  `StoreOpenBadge`) e redes sociais, botão "Como chegar".
- Novo rodapé institucional (`StoreFooter`), uma vez só no fim da página:
  Empresa/Contato/Links úteis (âncoras internas)/Redes sociais/Direitos
  autorais (ano dinâmico + CNPJ real).
- `SLOGAN` centralizado em `contact-info.ts` (antes duplicado só na
  sidebar); novo `MAPS_EMBED_LINK` derivado do endereço real.
- "Sobre Nós" e "Contato" viram 2º/3º itens de navegação na sidebar
  desktop e no drawer mobile.
- Escopo: terceira de 5 fases do redesign da área do cliente — ver
  `docs/superpowers/specs/2026-07-24-client-about-contact-footer-design.md`.

### Added — Sprint 6 (Fase 2): Redesign da Experiência do Cliente — Home/Hero

- Nova seção `#home` (`StoreHero`) acima do cardápio: título "O Hambúrguer
  que vai conquistar seu dia.", subtítulo, CTAs "Ver Cardápio" (rola até
  `#cardapio`) e "Fazer Pedido" (abre o carrinho) — placeholder gradiente
  com ícone (nenhum produto tem foto real ainda), prop `videoUrl` já
  preparada para receber vídeo local/CDN no futuro.
- "Home" vira o primeiro item de navegação na sidebar desktop e no drawer
  mobile, reaproveitando o `useScrollSpy`/`scrollToSection` já existentes.
- Escopo: segunda de 5 fases do redesign da área do cliente — ver
  `docs/superpowers/specs/2026-07-24-client-home-hero-design.md`.

### Added — Sprint 6 (Fase 1): Redesign da Experiência do Cliente — Sidebar

- Sidebar do autoatendimento redesenhada: cabeçalho com slogan, botão "Peça
  Agora" (rola até `#cardapio`) e rodapé de contato compartilhado
  (`StoreContactFooter`) entre a sidebar desktop e o drawer mobile —
  WhatsApp/Instagram/Facebook, telefone, endereço (link "Como chegar") e
  status de horário. Lista de categorias (ScrollSpy) mantida sem alteração
  de comportamento.
- Novo `features/menu/contact-info.ts`: dados reais de contato/redes como
  constante frontend (mesmo padrão de `BUSINESS_HOURS`) — repository/service
  público do cardápio ainda não busca esses campos do tenant, ver BACKLOG.
- `BUSINESS_HOURS` corrigido para o horário real da loja (terça a domingo,
  13:00–00:00, segunda fechado).
- Novo `features/menu/social-icons.tsx` (ícones de Instagram/Facebook,
  desenhados à mão — a versão instalada de `lucide-react` não inclui ícones
  de marca).
- Escopo: primeira de 5 fases do redesign da área do cliente — ver
  `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`.

### Added — Sprint 5.5 (Fase 5): Painel de Status

- Novo `/admin/sistema`: 3 cards de status real (banco de dados, Storage,
  Realtime — checagens reais reusadas de `/health`, Fase 4, via novo
  `lib/observability/health-checks.ts` compartilhado) + links para os
  dashboards nativos da Vercel e do Supabase (URL do projeto derivada de
  `NEXT_PUBLIC_SUPABASE_URL`, não hardcoded).
- **Sem CPU/memória fabricados** — decisão de escopo confirmada com o
  usuário antes de planejar esta sprint: não existe processo próprio para
  medir isso em serverless, e os dashboards nativos já fazem isso melhor.
- Novo `features/admin/system-status/use-realtime-status.ts` — canal
  Realtime "sonda" (sem tabela/evento) só para testar conectividade, sem
  lógica de negócio.
- Verificado no navegador: os 3 cards mostraram "Operacional" com dados
  reais (banco/Storage/Realtime realmente conectados).

### Added — Sprint 5.5 (Fase 4): Health checks

- `/live` (processo respondendo, sem checar dependências), `/ready`
  (banco responde, `503` quando não — para orquestradores) e `/health`
  (banco + Storage, resposta detalhada — para monitores externos tipo
  UptimeRobot). Todas públicas, sem autenticação.
- `proxy.ts` passa a excluir essas três rotas do matcher — não usam
  sessão, e podem ser pingadas com alta frequência por um monitor
  externo; revalidar cookie de auth nelas seria trabalho descartado.
- Verificado via `curl` real contra o dev server: as três respondem 200
  com o banco/Storage realmente acessíveis, e `/health` confirmadamente
  não recebe mais `x-request-id` (prova de que o proxy está pulando a rota).

### Added — Sprint 5.5 (Fase 3): Exportação de dados de negócio

- Nova rota `GET /api/admin/export?resource=orders|products|settings|audit-logs&format=json|csv`
  — guardada por `getAdminApiUser` (só gestão). Reusa as listagens
  administrativas já existentes (`listAdminProducts`, `getAdminStoreSettings`,
  `listAdminAuditLogs`, `findOrdersInDateRange` da Fase 7 do Sprint 5) em
  vez de repositórios novos.
- Novo `lib/export/to-csv.ts` — conversor JSON→CSV próprio (sem
  dependência nova), com 6 testes cobrindo escaping e valores aninhados.
- `/admin/configuracoes` ganha a seção "Exportar dados" — download direto
  via link `<a download>`, sem JavaScript adicional.
- **Escopo explícito**: isto é exportação de dados de negócio para uso
  operacional, não backup do banco — o backup em si é responsabilidade do
  Supabase (backups automáticos/PITR do plano). Documentado em
  `docs/backup.md` (novo), incluindo como verificar se está ativo.
- Verificado via `fetch()` real no navegador logado: os 5 pares
  recurso/formato testados retornaram 200 com conteúdo correto (incluindo
  um evento de auditoria real da Fase 1 aparecendo no CSV exportado).

### Added — Sprint 5.5 (Fase 1): Auditoria

- Nova tabela `audit_logs` (append-only) — login/logout, criação/
  alteração/exclusão de entidades administrativas, mudança de preço
  (variante de "alteração" quando os campos que mudaram incluem preço) e
  cancelamento de pedido. RLS: leitura só gestão, escrita todo staff, sem
  `update`/`delete` (ninguém edita o log pela app).
- Novo `services/admin/audit.service.ts#recordAuditLog` — "best effort":
  falha ao gravar não derruba a operação de negócio que a motivou, só loga
  o erro (via `logger.error` da Fase 0, que já encaminha ao Sentry).
- Instrumentado em `categories`, `products`, `modifiers`, `combos`,
  `store-settings`, `users`, `printers` (todos os `services/admin/*`) e em
  `kitchen-orders.service.ts` (cancelamento de pedido). Todo `updateAdmin*`
  passou a buscar o estado "antes" da escrita — antes só os `delete`
  faziam essa busca.
- Novo `/admin/auditoria`: lista paginada somente-leitura, filtros por
  ação/entidade, dialog de detalhes com `before`/`after`/`metadata`.
- **Achado e corrigido durante a instrumentação**: o campo "Cor" de
  Categorias e Configuração da Loja rejeitava string vazia mesmo sendo
  opcional (`z.string().regex(...).optional().nullable()` — o regex roda
  antes da normalização `"" → null`, então salvar sem preencher a cor
  sempre falhava a validação). Corrigido tornando a parte hexadecimal do
  regex opcional dentro do próprio padrão.
- `AdminAuditLog`/`AuditAction` (`types/domain.ts`).

### Added — Sprint 5.5 (Fase 0): Observabilidade base

- **Sentry** (`@sentry/nextjs`): `instrumentation.ts` (servidor) +
  `instrumentation-client.ts` (browser), convenção do SDK v10+. DSN em
  `NEXT_PUBLIC_SENTRY_DSN`, no-op se ausente. `tracesSampleRate: 0.1`
  (amostragem baixa, cota do plano gratuito).
- **Logs estruturados**: novo `lib/observability/logger.ts` —
  `logger.error` sempre encaminha ao Sentry; no servidor imprime JSON por
  linha (indexado nativamente pela Vercel), no browser imprime legível no
  DevTools.
- **Request ID**: `proxy.ts` gera `x-request-id` por requisição (respeita
  valor de upstream se já vier setado), propaga no request (lido via
  `lib/observability/request-id.ts#getRequestId()`) e na resposta.
  Correlaciona logs + Sentry + auditoria futura da mesma requisição —
  tratado como o mesmo conceito de "correlation ID" do pedido original
  (ver justificativa em `docs/observability.md`).
- Todos os ~16 route handlers de `app/api/*` agora chamam `logger.error`
  antes do `throw error;` final (erro não reconhecido) — antes disso,
  zero logging existia em qualquer rota da aplicação.
- Novos `app/error.tsx` (raiz) e `app/global-error.tsx` — antes só
  `(store)` tinha boundary de erro; `(admin)`/`(kitchen)`/`/login`
  caíam no boundary genérico do Next sem nenhum log.
- Novo `docs/observability.md`.

### Added — Login e primeiro acesso

- **`/login`**: até aqui não existia nenhuma tela de autenticação — `/admin`
  e `/cozinha` estavam com guards funcionais mas inacessíveis na prática
  (`requireRole` redirecionava para `/`, e não havia como logar). Novo
  `features/auth/` (schema, `LoginForm`, `SignOutButton`), email/senha via
  `supabase.auth.signInWithPassword`; destino pós-login decidido pelo papel
  (`lib/auth/landing-path.ts`): admin → `/admin`, cozinha → `/cozinha`.
- `requireRole()` agora redireciona para `/login?redirect=<origem>` (antes:
  `/`) — preserva a rota de origem para voltar direto após autenticar.
- Botão "Sair" adicionado ao `AdminHeader` e ao `KitchenHeader`
  (`SignOutButton`) — também inexistente até aqui.
- **Achado**: convite de usuário (Fase 6) exige já estar logado como
  gestor — o primeiro usuário de um tenant não pode nascer pelo próprio
  painel. Documentado como limitação estrutural em `docs/security.md`
  ("Bootstrap do primeiro usuário"); provisionamento inicial via Admin API
  é uma operação manual, feita uma vez por tenant.

### Added — Sprint 5 (Fase 8): Impressoras

- Nova tabela `printers` (`0024_printers.sql`): setor (cozinha/caixa/
  balcão), conexão (USB/rede/Bluetooth), largura de papel (58mm/80mm),
  protocolo (`escpos` por padrão), IP/porta (rede), modelo, impressão
  automática, permite reimpressão, ativa. `role`/`connection_type`/
  `paper_width` usam `text` + `check` (mesmo critério de
  `tenants.store_mode`), não enum Postgres.
- **RLS** (`0025_printers_rls.sql`): leitura por qualquer staff do tenant
  (cozinha/caixa vão precisar quando a impressão real existir), escrita só
  gestão — mesmo formato de `combos_select`/`combos_write`.
- **Só persistência de configuração** — sem execução real de impressão
  (ESC/POS) nesta fase, conforme escopo definido no plano da Sprint 5.
- Novo `repositories/printers.repository.ts`,
  `services/admin/printers.service.ts`, `features/admin/printers/`
  (schema com `refine` exigindo IP para conexão de rede, labels,
  mutations, `PrinterFormDialog`, `PrintersManager`). Rotas
  `app/api/admin/printers` (`GET`/`POST`) e `app/api/admin/printers/[id]`
  (`PATCH`/`DELETE`).
- `/admin/impressoras`: CRUD completo com campos condicionais (IP/porta só
  aparecem para conexão de rede).
- `AdminPrinter`/`PrinterRole`/`PrinterConnectionType`/`PrinterPaperWidth`
  (`types/domain.ts`).

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
