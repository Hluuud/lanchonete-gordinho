# Backlog

Pendências, dívida técnica e melhorias futuras. Organizado por sprint/fase.
Todo item aqui deve ter origem rastreável (sprint que o gerou) — ver
`CHANGELOG.md` para o que já foi entregue e `docs/adr/` para decisões
arquiteturais associadas.

## Sprint 8.1 — Refinamento da Experiência do Cliente

- ☐ **Combos não entram na navegação simplificada (Task 9, Fase B).**
  `grep -n "isCombo\|combo" types/domain.ts features/menu/store-info.ts`
  não encontra nenhum campo de produto que marque "é combo" —
  `StoreCombos` monta sugestões a partir de produtos reais
  (`combo-suggestions.ts`), não de um badge/categoria filtrável. Seguindo a
  regra de honestidade documentada em `virtual-sections.ts`, não foi criada
  uma seção virtual "Combos" nested sob "Cardápio" (inventaria um filtro que
  não existe). Combos só entra na navegação da Fase B quando existir dado
  real de combo (ex.: um campo/categoria que marque o produto como parte de
  um combo, ou a liberação das tabelas `combos`/`combo_slots` já
  rastreada no Sprint 7).
- ☐ **`--ring` (anel de foco) ainda é o vermelho da ADR 0010** —
  off-brand agora que `--primary` é laranja (ADR 0013), embora ainda WCAG
  AA compliant. Polimento de baixa prioridade: trocar para um tom
  derivado do novo laranja (ou de `--primary-text`, já testado contra
  contraste) quando a paleta for revisitada.
- ☐ **Margens de recorte das poses do mascote são hardcoded para o layout
  atual de `Versoes_boneco.png`.** `scripts/cutout-mascot.mjs` extrai cada
  pose por coordenadas fixas de pixel (grade 4×2, célula 384×512) — se a
  folha de origem for regenerada/substituída por uma nova versão, essas
  margens precisam ser re-derivadas. O método de derivação está comentado
  no código, mas o script real de varredura de pixels usado para achá-las
  não foi commitado.
- ☐ **`public/brand/mascote-full.png` gerado e comitado, mas sem uso no
  código ainda.** Corpo inteiro do mascote, fundo transparente — disponível
  para um momento futuro (ex. confirmação de pedido, quando o checkout
  entrar em escopo de UI).
- ☐ **Vídeo do Hero sem `poster` e com nome de arquivo provisório.**
  `public/brand/video_teste.mp4` (3,1 MB) não tem imagem de pôster
  configurada em `HERO_MEDIA` — usuários com `prefers-reduced-motion` caem
  no placeholder gráfico genérico em vez de um still real do vídeo. O
  nome do arquivo também é literalmente "teste". Revisitar os dois pontos
  quando existir o vídeo institucional definitivo.
- ☐ **`TONE_HEADING.light` ainda usa `hover:text-primary` puro, não
  `--primary-text`.** `features/menu/components/store-nav-link.tsx` — o
  heading "Cardápio" do drawer mobile tem a mesma classe de problema de
  contraste AA que a revisão final desta sprint corrigiu em outros
  lugares (tagline, links, badges), mas esse caso específico não estava
  no escopo enumerado da revisão.

## Sprint 8 — Branding, Experiência Visual e Mídia

Fases 0-9 estão entregues — ver `CHANGELOG.md` e `docs/frontend.md`. O que
resta é quase todo **material bruto**, não código: a estrutura já existe e
degrada com elegância (placeholder, seção oculta, link condicional) até o
lojista fornecer cada item.

### Bloqueado por material do lojista

- ☐ **Logo definitiva.** O erro de grafia foi corrigido (o selo agora diz
  "LANCHONETE"), mas `public/brand/logo.png` segue sendo um selo circular de
  500×500 **sem canal alfa** — o fundo branco é recortado pelo `trim()` do
  gerador, o que só funciona porque a arte é circular sobre branco. Arte
  definitiva de preferência em PNG quadrado ≥1024 px com fundo transparente;
  se vier em SVG, trocar a fonte e simplificar `trim()`/máscara circular.
  Trocar o arquivo + `pnpm brand:assets` regenera os 18 assets.
- ☐ **Logo horizontal / monocromática / marca d'água.** Pipeline pronto
  desde a Fase 1 (`tokens.source.logoHorizontal`/`logoMono`/`watermark`,
  `brandAsset()`, `<BrandLogo variant>`) — falta a arte-fonte de cada
  variante em `public/brand/`.
- ☐ **Fotos profissionais dos produtos.** O upload já existe
  (`components/image-upload.tsx` → bucket `store-assets`); falta o material.
  Sem foto, o card cai no placeholder gráfico.
- ☐ **Vídeo em loop e pôster do Hero.** `HERO_MEDIA`
  (`features/menu/media.ts`) segue vazio; `HeroMedia`/`StoreHero` já tratam
  os três estados (vídeo mudo em autoplay → pôster → placeholder), o layout
  full-bleed cinematográfico e o parallax leve. Preferir MP4 H.264 curto
  (≤8 s) e sem áudio, mais um WebM equivalente (`HERO_MEDIA.sources`, ordem
  de preferência).
- ☐ **Fotos da galeria institucional (`#galeria`).** `GALLERY_ITEMS`
  (`features/menu/gallery.ts`) está vazia — fachada, ambiente, cozinha,
  equipe, clientes e os produtos em foto. Sem pelo menos uma, a seção e o
  item "Galeria" da navegação não aparecem (ADR 0012). Fotos de
  `fachada`/`ambiente`, quando existirem, também substituem os dois
  placeholders da seção Sobre.
- ☐ **Depoimentos de clientes (`#depoimentos`).** `TESTIMONIALS`
  (`features/menu/testimonials.ts`) está vazia — nome, nota, comentário e
  foto opcional. Sem pelo menos um, a seção e o item "Depoimentos" da
  navegação não aparecem (ADR 0012).
- ☐ **Linha do tempo da casa.** `ABOUT_TIMELINE`
  (`features/menu/about-content.ts`) está vazia — nenhum marco/ano real
  registrado ainda. Inventar uma data seria mentir pro cliente (ADR 0012).
- ☐ **Perfil do TikTok.** `TIKTOK_LINK` (`features/menu/contact-info.ts`) é
  `null`; `TikTokIcon` já existe e renderiza condicionalmente na seção de
  contato e no rodapé quando houver link.
- ☐ **Ícones próprios.** A loja usa `lucide-react` inteiro. Um set autoral
  (categorias, formas de pagamento) só faz sentido depois da logo nova, para
  herdar o traço dela.

### Depende de código, não de material

- ☐ **Open Graph por página.** Hoje há uma imagem única
  (`/brand/og-default.png`) para o site inteiro — `lib/seo/page-metadata.ts`
  (Fase 8) já centraliza `canonical`/Open Graph/Twitter por rota, mas todas
  apontam pra mesma imagem. Preview por produto ou promoção pede
  `opengraph-image.tsx` dinâmico (`ImageResponse`) na rota — exige embutir a
  fonte Anton como arquivo, já que `next/font` não funciona dentro do
  `ImageResponse`.
- ☐ **Splash de iOS só em retrato.** Em paisagem o Safari cai no branco.
  Cobrir exige dobrar as 11 imagens em `lib/brand/splash-targets.json`;
  adiado porque o app é declaradamente `orientation: portrait`.
- ☐ **Service worker / offline.** O manifest torna o app instalável, mas não
  há cache offline — abrir sem rede mostra a página de erro do navegador.
  Decisão própria (Workbox vs. handler manual), não é pré-requisito de
  instalação.
- ☐ **Cores duplicadas entre `globals.css` (oklch) e `tokens.json` (hex).**
  O gerador não interpola `oklch`; a conversão foi feita uma vez, à mão. Se
  a paleta mudar, os dois arquivos precisam mudar juntos — não há teste que
  detecte a divergência.
- ☐ **`pnpm format:check` já falha em ~114 arquivos não tocados por esta
  sprint** (achado durante a Fase 1, não investigado a fundo — provável
  drift entre a resolução do Prettier via `pnpm`/`pnpm-lock.yaml` e via
  `npm ci`/`package-lock.json`, que é o que a CI realmente usa). Não é dívida
  desta sprint, mas é um risco real de gate de CI silenciosamente
  desalinhado do ambiente local.
- ☐ **Verificação visual em navegador real pendente** (mobile/tablet/
  desktop, hover, parallax, reveals, lightbox da galeria) — esta sprint foi
  verificada via build + testes + smoke test de servidor local
  (`curl`/HTML), não com um browser aberto.

## Sprint 7 — Identidade Visual da Área do Cliente

Ver `docs/adr/0010-storefront-brand-identity.md` e o Sprint Report em
`docs/superpowers/reports/`. Bloqueios encontrados durante a implementação:

- ☐ **Preço promocional não pode ser exibido na vitrine.** `promo_price_cents`
  já chega ao domínio público (Fase 2) e os helpers existem em
  `features/menu/virtual-sections.ts`, mas a função `create_order`
  (`supabase/migrations/0009_create_order_coupon_code_fix.sql`) calcula
  `unit_price_cents` a partir de `products.price_cents` — o cliente veria o
  desconto e pagaria o preço cheio. **Pré-requisito:** migration que faça a
  RPC usar `coalesce(promo_price_cents, price_cents)`. Só depois disso o
  badge "Promoção", o preço riscado e o carrossel de ofertas fazem sentido.
- ☐ **Combos reais do banco.** `combos`/`combo_slots`/`combo_slot_products`
  têm RLS staff-only (migration 0017) e o checkout não sabe montar combo em
  `order_items`. A seção `#combos` usa sugestões derivadas do cardápio real
  (`features/menu/combo-suggestions.ts`), sem desconto prometido.
  **Pré-requisitos:** policy pública de leitura + suporte a combo no
  carrinho/checkout.
- ☐ **Timer de contagem regressiva nas promoções.** Não existe campo de
  validade em `products` nem uma tabela de campanhas; inventar prazo é
  mentir para o cliente. Depende de modelagem de promoção com início/fim.
- ☐ **Vídeo e fotos reais.** `HERO_VIDEO_URL`/`HERO_POSTER_URL`
  (`features/menu/media.ts`) estão nulos e o Hero cai no placeholder; as
  imagens da seção Sobre também são placeholders declarados. Basta
  preencher as constantes quando o material existir.
- ☐ **Descrição/imagem por categoria vêm do frontend.**
  `features/menu/category-content.ts` é constante; a tabela `categories`
  tem `icon`/`color` mas não descrição nem imagem. Mesma dívida de
  `contact-info.ts`.
- ☐ **TikTok não tem campo nem link.** Foi pedido na navegação, mas não há
  perfil informado pelo lojista nem coluna em `tenants` — omitido em vez de
  apontar para lugar nenhum.
- ☐ **Contatos ainda são constantes de frontend.** `contact-info.ts` e
  `store-info.ts` seguem hardcoded enquanto `findTenantBySlug` selecionar
  só `id, slug, name`.
- ☐ **Sem teste de render na área do cliente.** `vitest` roda em
  `environment: "node"`, sem jsdom nem Testing Library — as fases desta
  sprint testaram só lógica pura (`nav`, `virtual-sections`,
  `category-content`, `combo-suggestions`). Introduzir jsdom + RTL é uma
  decisão de infraestrutura própria.
- ☐ **Conferência visual em navegador pendente.** A verificação do HTML
  servido passou (as nove seções ancoradas, navegação, combos com produtos
  reais, `/checkout` 200, guardas de auth em 307). Falta o que só se vê com
  um navegador aberto: responsivo real em desktop/tablet/mobile, hover e
  micro-interações, `prefers-reduced-motion` e o fluxo carrinho → checkout
  clicado de ponta a ponta.

## Sprint 6 — Redesign da Experiência do Cliente (Fases 1-5: Sidebar, Home/Hero, Sobre/Contato/Footer, Cardápio Premium, Promoções)

Ver `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`
(spec geral) e specs/plans por fase. Achados dos reviews finais (branch
`dev`):

- ☐ **`promoBannerUrl` real (admin) não chega ao banner de Promoções**
  (Fase 5, decisão confirmada com o usuário): `promo_banner_url` existe em
  `tenants` e em `AdminStoreSettings`
  (`services/admin/store-settings.service.ts`), mas o `Tenant` público
  (vitrine) é deliberadamente minimalista e não mapeia esse campo — mesma
  categoria de restrição das Fases 1/4. `StorePromoBanner` usa conteúdo
  estático/rascunho enquanto isso não for liberado.
- ☐ **Tags "Mais Vendido"/"Promoção" nos cards, descrição/imagem por
  categoria, tag "Artesanal"** (Fase 4, decisão confirmada com o usuário):
  `is_bestseller`/`promo_price_cents` existem no banco mas só chegam ao
  tipo `Product` admin — `toProduct()` em `services/menu.service.ts`
  (público) não os mapeia; `MenuCategory` público não tem
  `description`/`imageUrl`; "Artesanal" não tem sinal por produto no
  schema. Pendente de uma fase que autorize tocar `services`/
  `repositories`/schema.
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
