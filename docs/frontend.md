# Frontend

Visão geral da UI dos três módulos (loja, cozinha, admin) — arquitetura de
componentes, navegação e configuração client. Detalhe de domínio específico
fica em `docs/kitchen-panel.md` e `docs/checkout.md`; decisões de tema em
[ADR 0007](./adr/0007-module-scoped-visual-identities.md).

## Loja: cardápio de autoatendimento (Sprint 4)

Redesenho completo sobre a base da Sprint 1 (que ainda era um layout tipo
e-commerce). Referências de experiência: New Dog, Goomer, Consumer — sem
copiar identidade visual, só a lógica de autoatendimento (totem/tablet/
celular/desktop).

### Shell

`features/menu/components/store-experience.tsx` continua o orquestrador
(Client Component, recebe `Menu` já carregado do servidor — decisão da
Sprint 1 mantida). A partir dele:

- **`StoreSidebar`** (`lg:+`) — fixa, `sticky top-0 h-dvh`: identidade do
  mascote (ver "Identidade do mascote" abaixo), busca, navegação vertical
  de seções com `aria-current` na ativa.
- **`MascotNavBubble`** (`lg:hidden`, Sprint 8.1) — bolha fixa do Gordinho
  no canto superior esquerdo do mobile: identidade da marca + gatilho do
  `StoreMobileNav` (mesmo drawer que a extinta `StoreTopbar` abria). No
  desktop não renderiza — a sidebar fixa já cobre navegação.
- **`CategoryNav`** — nav horizontal sticky, `lg:hidden`: navegação primária
  de rolagem no mobile/tablet (a sidebar assume esse papel em telas
  maiores). `sticky top-0` (Sprint 8.1) — antes tinha `top-16` para abrir
  espaço para a `StoreTopbar`, que não existe mais; o primeiro chip ganha
  `pl-16` para não ficar atrás da `MascotNavBubble`, que é `fixed` por
  cima dela.

A `StoreTopbar` (nome da loja, badge Aberto/Fechado, breadcrumb e botão de
carrinho sticky) existiu da Sprint 4 até a Sprint 8.1, quando foi removida
por completo: identidade migrou para o mascote (sidebar/bolha), e o
carrinho ganhou seu próprio botão flutuante (`CartButton`, ver "Ações
flutuantes" abaixo). Nenhum substituto único assumiu o papel da topbar —
cada responsabilidade dela foi redistribuída para um componente dedicado.

### Identidade do mascote (Sprint 8.1)

A identidade textual (logo + nome + slogan) na sidebar foi substituída
pelo mascote "Gordinho": `<BrandLogo variant="mascote" size="xl" />`
(`components/brand-logo.tsx`) renderiza `public/brand/mascote-avatar.png`
dentro de um botão que rola até `#home` — mesmo destino que o clique na
logo sempre teve. `variant="seal"` (o selo laranja) continua sendo o
default do componente e segue em uso fora da sidebar (footer, `/pedido`).

`mascote-avatar.png`, `mascote-full.png` e as 4 poses (ver
`MASCOT_POSES` abaixo) são gerados por `scripts/cutout-mascot.mjs`
(chroma-key determinístico via `sharp`, mesma filosofia de
`generate-brand-assets.mjs` — sem IA, sem serviço externo) a partir das
artes brutas `public/brand/Boneco.png` e `Versoes_boneco.png`, ambas
comitadas junto dos PNGs gerados (o build da Vercel não roda o script).
`scripts/lib/chroma-key.mjs` isola a função pura de distância-até-branco
+ feather, testada isoladamente.

**`MascotMoment`** (`features/menu/components/mascot-moment.tsx`) é o
componente reusável de "pose + mensagem curta", registrado por
`MASCOT_POSES` (`features/menu/mascot-poses.ts`, um `Record<MascotPoseName,
{ src, alt }>`). Usado em 4 pontos, todos fora do fluxo de checkout
(que o lojista pediu para não tocar):

| Pose | Onde | Componente |
| --- | --- | --- |
| `holding-burger` | Carrinho vazio | `CartPanelContent` |
| `pointing-up` | Banner de promoções (`#promocoes`) | `StorePromoBanner` |
| `resting` | Loja fechada, no Hero | `StoreHero` |
| `welcoming` | Sobre Nós (`#sobre`) | `StoreAbout` |

`MascotMoment` aceita `tone: "light" | "dark"` — `"light"` (padrão) usa
`text-muted-foreground` sobre o creme; `"dark"` usa
`text-surface-dark-muted`, para o único uso sobre o preto do Hero (loja
fechada). Um `tone` fixo em `"light"` para todos os usos deixava a
mensagem quase ilegível sobre `bg-surface-dark` (~2.8:1, abaixo de AA) —
achado da revisão final da Sprint 8.1.

"Pedido enviado" e "erro de conexão" (pedidos originais do lojista para o
mascote) ficam fora de escopo: pertencem ao fluxo de checkout.

O estado aberto/fechado que decide se `StoreHero` mostra `resting` vem de
`useStoreOpenState()` (`features/menu/use-store-open-state.ts`, Sprint
8.1) — hook compartilhado extraído de dentro de `StoreOpenBadge`
(`useSyncExternalStore` com snapshot por minuto, mesmo padrão de sempre).
`StoreOpenBadge` foi migrado para consumi-lo em vez de duplicar a
assinatura; `null` no snapshot de servidor/primeira renderização assume
`isOpen = true` no Hero (mesma segurança-por-omissão que o badge já
aplicava com seu placeholder neutro).

### Ações flutuantes (Sprint 8.1)

Duas pílulas fixas no canto inferior direito, montadas em
`app/(store)/layout.tsx` (fora de `StoreExperience`, dentro do
`CartProvider`) — ambas ocultas em `/checkout` (`usePathname().startsWith("/checkout")`):

- **`CartButton`** (`features/cart/components/cart-button.tsx`) — já
  existia desde a Sprint 1 como o carrinho flutuante mobile, mas com
  `lg:hidden`: no desktop, quem abria o carrinho era o ícone da
  `StoreTopbar`. A remoção da topbar (Sprint 8.1, Fase B) deixou o
  desktop sem forma de abrir o carrinho até essa classe ser removida
  (Fase C) — hoje visível em todos os breakpoints. O badge de quantidade
  é um `motion.span` remontado por `key={totalQuantity}` a cada mudança,
  disparando um pulso de escala (respeita `prefers-reduced-motion`).
- **`WhatsappFab`** (`features/menu/components/whatsapp-fab.tsx`) —
  empilhado acima do `CartButton` (`bottom-20`/`sm:bottom-24` vs.
  `bottom-4`/`sm:bottom-6`), abre `WHATSAPP_LINK` em nova aba, sem pulso
  (nunca deve competir visualmente com o carrinho, a ação primária).

### Seções (`features/menu/virtual-sections.ts`)

`buildStoreSections(menu)` monta a lista única consumida por sidebar,
`CategoryNav` e conteúdo: seções **virtuais** (derivadas de badges reais —
`isFeatured` → "Destaques da Casa", `isNew` → "Novidades", ocultas quando
vazias) seguidas das categorias reais do banco. Promoções **não** é mais
uma seção virtual (Sprint 8.1) — o link de navegação aponta direto para a
seção real `#promocoes` (`StorePromoBanner`), via `selectPromotions(menu)`.
"Combos" e "Mais Vendidos" continuam de fora até existir schema — nunca
dado fabricado (ver `BACKLOG.md`). `MenuSection` é o componente único que
renderiza qualquer seção (virtual ou real) com o mesmo grid de cards.

### Navegação e scroll (`features/menu/use-scroll-spy.ts`, `scroll-to-section.ts`)

`useScrollSpy` é o hook compartilhado (extraído da `CategoryNav` original da
Sprint 1) — cada consumidor passa seu próprio `topOffsetPx` (a "linha de
detecção" varia com a altura da topbar/nav sticky de cada contexto).

`scrollToSection` substitui a navegação nativa por hash: **em Next.js App
Router, um clique num `<a href="#id">` com a página no topo da rolagem é
interceptado pelo router e cancela o `scroll-behavior: smooth` nativo do
navegador** (reproduzido em teste manual nesta sprint). A função chama
`element.scrollIntoView({ behavior: "smooth" })` diretamente e sincroniza a
URL via `history.replaceState` (mantém deep-link sem empilhar histórico a
cada clique).

### Carrinho (`features/cart/`)

Mecânica da Sprint 1 mantida (Context + `useReducer`, Sheet/Drawer
adaptativo — ver [ADR 0002](./adr/0002-client-side-cart-state.md)); esta
sprint só redesenhou a UI e adicionou:

- `config.ts` — `ADD_TO_CART_FEEDBACK` ("toast" hoje; "open-panel"
  disponível). Constante client, candidata a config por tenant.
- `estimate.ts` — `estimateCartPrepMinutes`: maior `prepTimeMinutes` entre
  os itens do carrinho (a cozinha prepara em paralelo, somar
  superestimaria). Exibido como aproximação ("~X min"), nunca como a
  promessa oficial do backend (`estimatedReadyAt`).

### Horário e status operacional (`features/menu/store-info.ts`)

`BUSINESS_HOURS` é uma constante client (não há tabela de horários por
tenant no banco ainda — ver `BACKLOG.md`). `getStoreOpenState(now)` é pura e
testada, incluindo o caso de janela que cruza a meia-noite.
`StoreOpenBadge` a consome via `useSyncExternalStore` com snapshot por
minuto (mesmo padrão de `useElapsedTime`/`use-media-query.ts` — evita
hydration mismatch de relógio).

## Sistema de temas por módulo

Ver [ADR 0007](./adr/0007-module-scoped-visual-identities.md) para a
decisão completa. Resumo: os mesmos tokens CSS semânticos (`--primary`,
`--background`...) são redefinidos por classe de escopo, sem duplicar
nenhum componente:

| Módulo | Classe | `layout.tsx` |
|---|---|---|
| Loja | `:root` (padrão) | `app/(store)/layout.tsx` (sem classe extra) |
| Cozinha | `.dark` | `app/(kitchen)/layout.tsx` |
| Admin | `.theme-admin` | `app/(admin)/admin/layout.tsx` |

Desde a **Sprint 7** ([ADR 0010](./adr/0010-storefront-brand-identity.md)),
os valores de `:root` são a identidade da loja: preto e creme dominantes.
Desde a **Sprint 8.1** ([ADR 0013](./adr/0013-paleta-laranja-do-mascote.md)),
`--primary`/`--accent` são os dois tons de laranja do selo do mascote
(`#F28C28`/`#FFB84D`, antes vermelho/laranja da ADR 0010) e
`--primary-foreground` passou a ser escuro (não branco — os dois laranjas
não atingem 4.5:1 contra branco). `.dark` e `.theme-admin` seguem
inalterados em ambas as ADRs.

`--primary-text` (Sprint 8.1) é um token à parte, **exclusivo para texto/
ícone sobre fundo claro** (nunca para preencher `bg-primary`, que já usa
`--primary-foreground`): texto na cor `--primary` direta só atinge ~2.2:1
contra o creme do `background`, abaixo de AA. `--primary-text` é o tom
mais escuro do selo (`#D96318`), que atinge 4.5:1 — usado em hovers de
link/tagline/badge que precisam "ler" como laranja da marca sem falhar
contraste (`store-nav-link.tsx`, `store-about.tsx`, `category-nav.tsx`,
`social-link.tsx`, `store-contact-section.tsx`). **Achado da revisão
final não corrigido nesta sprint:** o heading "Cardápio" do drawer mobile
(`TONE_HEADING.light` em `store-nav-link.tsx`) ainda usa
`hover:text-primary` puro, não `--primary-text` — mesma classe de
problema, fora do escopo enumerado pela revisão (ver `BACKLOG.md`).

`--ring` (cor do anel de foco) não foi atualizado pela ADR 0013 — segue o
vermelho da ADR 0010, hoje destoando da paleta laranja (ainda WCAG AA
compliant; registrado no `BACKLOG.md` como polimento de baixa prioridade).

Quatro tokens descrevem a superfície escura da marca (sidebar, hero,
promoções, rodapé) e são declarados **uma vez para os três escopos**, porque
não mudam de valor por módulo:

```
--surface-dark            --surface-dark-muted
--surface-dark-foreground --surface-dark-border
```

Tipografia: `--font-sans` (Geist) para texto corrido e `--font-display`
(Anton, utilitário `font-display`) para títulos curtos em caixa alta.

## Navegação da loja

`features/menu/nav.ts` (`STORE_NAV_ITEMS`) é a fonte única das seções da
loja — sidebar desktop, drawer mobile, `useScrollSpy` e links do rodapé leem
dela. Mesmo contrato do `ADMIN_NAV_ITEMS`: **um item só entra na lista
quando a âncora existe de fato no DOM**, para o menu nunca prometer um
destino que não leva a lugar nenhum.

A ordem do array é a ordem das seções na página; o ScrollSpy depende dessa
correspondência. `StoreNavLink` concentra estado ativo, alvo de toque e tom
da superfície (`dark` na sidebar, `light` no drawer).

Na Sprint 8 (Fase 4), `STORE_NAV_ITEMS` deixou de ser um array estático —
passou a ser `buildStoreNavItems({ hasGallery, hasTestimonials })`, com
"Galeria" e "Depoimentos" condicionados a conteúdo real.

**Na Sprint 8.1**, a navegação foi simplificada de volta para **4 itens de
topo, fixos**: `Home`, `Cardápio` (`isHeading: true`), `Sobre Nós`,
`Contato` — `buildStoreNavItems()` não recebe mais parâmetros. "Mais
Vendidos", "Novidades", "Galeria" e "Depoimentos" saíram da navegação
(as seções continuam existindo na página, só não estão mais linkadas no
menu — decisão deliberada de simplificação, não perda de conteúdo).
Destaques da Casa, Novidades e as categorias reais do cardápio aparecem
indentadas sob "Cardápio" via `sections` (`buildStoreSections`); o link
para "Promoções" também aparece indentado ali, mas é montado à parte pela
Sidebar/Drawer (não vem de `sections`) e só renderiza quando
`selectPromotions(menu).length > 0` — apontando para a seção real
`#promocoes`, não para uma seção virtual (ver "Seções" acima).

**Combos não tem entrada na navegação** — não existe hoje nenhum campo de
produto que marque "é combo" (`StoreCombos` monta sugestões a partir de
produtos reais, não de um badge filtrável); criar uma seção de navegação
para isso inventaria um filtro que não existe. Registrado no
`BACKLOG.md`, mesma regra de honestidade da navegação aplicada às demais
seções condicionais.

## Painel Administrativo (shell, Sprint 4)

Ver detalhe de domínio nas próprias páginas (`app/(admin)/admin/`). Shell:

- `app/(admin)/admin/layout.tsx` — guarda de acesso único (`requireRole`,
  movido do `page.tsx` para cobrir todas as subpáginas), tema
  `.theme-admin`, sidebar (`md+`) / pills horizontais (mobile).
- `features/admin/nav.ts` — `ADMIN_NAV_ITEMS` com flag `ready`: só marcar
  `true` quando a página tiver conteúdo real, nunca antes (o menu nunca
  promete o que ainda não existe).
- Páginas com dado real (Dashboard, Pedidos, Produtos) chamam os **mesmos
  services** da loja/cozinha (`getMenuByTenantSlug`,
  `getActiveKitchenOrders`) diretamente do Server Component — sem hop HTTP,
  mesmo padrão já usado por `app/(kitchen)/cozinha/page.tsx`.

## Painel da Cozinha (redesenho industrial, Sprint 4)

Ver `docs/kitchen-panel.md` (atualizado nesta sprint) para o detalhe
completo do board de 4 colunas visuais, `resolveDropPath` e auto-hide.

## Padrões de CRUD administrativo (Sprint 5)

Fixados na Fase 0 e replicados por todo módulo de gestão (Categorias,
Produtos, Adicionais, Combos, Configuração, Usuários, Impressoras) — ver
[ADR 0008](./adr/0008-supabase-storage-for-media.md) para a decisão de
Storage.

- **Formulário**: `useForm<T>({ resolver: zodResolver(schema) })` com
  `register` — mesmo idioma "cru" do checkout
  (`features/checkout/components/checkout-page.tsx`), não o wrapper `Form`
  do shadcn (não instalado, de propósito, para não ter dois idiomas de
  formulário convivendo). Um único `Dialog` alterna entre criar/editar via
  `mode: "create" | "edit"`.
- **Mutação**: `useMutation` do TanStack Query fazendo `fetch` para a rota
  de API (mesmo padrão de `features/checkout/use-checkout.ts`) — **sem** o
  reducer otimista da cozinha, que existe para UI em tempo real, não para
  telas de gestão. Em `onSuccess`, `router.refresh()` (Next App Router) em
  vez de invalidar cache do TanStack Query: as listas continuam sendo
  Server Components (SSR), `router.refresh()` só re-executa a busca no
  servidor.
- **Paginação/busca/ordenação**: sempre server-side via `searchParams` da
  própria página, nunca client-side. `features/admin/pagination.ts`
  (`parseListParams`, puro e testado) é o único parser de
  `page`/`pageSize`/`q`/`sort`/`order` do admin inteiro — `sort` só aceita
  valores de uma allowlist por chamada, nunca vira SQL arbitrário.
- **Exclusão**: `components/confirm-dialog.tsx` (wrapper de `AlertDialog`)
  é o único componente de confirmação do admin.
- **Autorização em rota de API**: `getAdminApiUser()`
  (`lib/admin/roles.ts`), espelhando `getKitchenApiUser()` — retorna `null`
  para o handler decidir 401/403 (rotas não redirecionam, diferente de
  `requireRole` nas páginas).
- **Upload de imagem**: `components/image-upload.tsx` — upload direto do
  browser para o bucket `store-assets` (Supabase Storage), preview,
  validação de tipo/tamanho no client. Convenção de path documentada em
  `docs/database.md`.
- **Camadas**: `services/admin/<módulo>.service.ts` (namespace separado dos
  services públicos da loja, que têm regra de apresentação — filtrar
  publicado/disponível — que não se aplica a uma tela de gestão) →
  funções novas em `repositories/menu.repository.ts`/`orders.repository.ts`
  (categorias/produtos estendem os repositories existentes; módulos com
  tabelas totalmente novas, como Adicionais/Combos, ganham arquivo de
  repository próprio).

---

## Assets de marca: favicon, PWA e Open Graph (Sprint 8)

Toda a identidade "fora da página" — o ícone da aba, o ícone na home screen,
a splash screen do app instalado e o card de compartilhamento no WhatsApp —
é derivada por script de **uma única imagem-fonte**, `public/brand/logo.png`.

### Fonte da verdade

| Arquivo | Papel |
| --- | --- |
| `lib/brand/tokens.json` | Nome, short name, descrição, tagline, cores hex da marca |
| `lib/brand/splash-targets.json` | Resoluções de iPhone/iPad que ganham splash |
| `lib/brand/index.ts` | Exporta os JSONs tipados + `siteUrl()` e helpers de splash |
| `scripts/generate-brand-assets.mjs` | Lê os JSONs e a logo, escreve todos os assets |

As cores hex em `tokens.json` são a conversão para sRGB dos tokens `oklch`
de `styles/globals.css` (`--primary`, `--accent`, `--surface-dark`,
`--background`). CSS continua em `oklch`; o gerador precisa de hex porque
`sharp`/SVG não interpolam `oklch`. **Se a paleta mudar em `globals.css`,
atualizar `tokens.json` junto.**

### Regenerar

```bash
pnpm brand:assets
```

Roda offline, em ~2 s, e sobrescreve:

- `app/icon.png` (favicon 512, transparente) e `public/favicon.ico` (32);
- `app/apple-icon.png` (180, fundo opaco — o iOS não respeita alpha);
- `public/icons/icon-{192,512}.png` e `icon-maskable-512.png`;
- `public/splash/apple-splash-*.png` (11 resoluções, retrato);
- `public/brand/og-default.png` (1200×630).

Os arquivos gerados **são commitados**: o build da Vercel não roda o script
(e não teria as fontes do sistema para o texto do Open Graph).

### Variantes de marca (Sprint 8, Fase 1)

Além do selo, `tokens.source` aceita três fontes opcionais —
`logoHorizontal`, `logoMono`, `watermark` — cada uma apontando para um PNG
em `public/brand/`. Quando configurada e o arquivo existe no disco, o
gerador escreve a variante correspondente (`logo-horizontal.png`, `logo-mono.png`,
`watermark.png`); ausente ou apontando para um arquivo inexistente, é pulada
com um aviso no console — o script nunca falha por falta de material, e
rodá-lo hoje (sem nenhuma fonte extra configurada) continua produzindo
exatamente os mesmos 18 arquivos de antes.

Essas variantes **não passam pela máscara circular** do selo: um lockup
horizontal recortado em círculo perderia o texto lateral. `resize({fit:
"contain"})` preserva a proporção original da arte dentro do canvas de
saída, com respiro transparente.

No app, `brandAsset(variant)` (`lib/brand/index.ts`) devolve o caminho
público de uma variante ou `null` se a fonte nunca foi configurada;
`<BrandLogo variant="horizontal" | "mono">` (`components/brand-logo.tsx`)
já degrada para o selo quando `brandAsset()` volta `null` — nenhum
consumidor precisa checar isso na mão.

Dois detalhes do gerador que não são óbvios:

- a logo original é um selo circular dentro de um **quadrado branco opaco**;
  o script faz `trim()` da moldura e aplica máscara circular, senão o ícone
  aparece como um quadrado branco na aba escura e sobre o fundo da splash;
- o ícone `maskable` usa só 60% do lado porque o Android recorta as bordas
  em círculo/squircle — os outros usam ~86%.

### Onde isso é declarado

- `app/manifest.ts` → `/manifest.webmanifest` (Android monta a splash sozinho
  a partir de `name` + `background_color` + ícone 512);
- `app/layout.tsx` → `metadata.icons`, `openGraph`, `twitter`, `appleWebApp`
  e as tags `<link rel="apple-touch-startup-image">` (o Safari só aceita
  splash por `<link>` com media query casando o aparelho exato).

`metadataBase` vem de `siteUrl()`: `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` →
`localhost:3000`. Sem ele o Next emite `og:image` relativo e nenhuma rede
social consegue buscar o preview.

Página que merecer preview próprio (um produto, uma promoção) sobrescreve
`openGraph.images` no seu próprio `metadata` — o default do layout continua
valendo para todo o resto.

## Sprint 8, Fases 2-9: Hero cinematográfico, seções institucionais e SEO

Continuação da Sprint 8 (Fase 1 = variantes de marca, acima). Todas as
fases seguintes são frontend-only: nenhum schema, service ou repository
mudou; nenhuma chamada nova ao Supabase.

### Hero cinematográfico (`features/menu/media.ts`, `hero-media.tsx`, `store-hero.tsx`)

`HERO_MEDIA` (antes dois escalares, `HERO_VIDEO_URL`/`HERO_POSTER_URL`)
agora é um objeto: `sources[]` (múltiplas `<source>`, WebM antes de MP4),
`poster`, `posterMobile` opcional e `overlayOpacity`. `resolveHeroMedia()` e
`hasHeroMedia()` são puras — decidem "vídeo, pôster ou placeholder" e "tem
mídia real?" sem depender de DOM, por isso são testáveis sem
Testing Library.

`StoreHero` escolhe entre dois layouts a partir de `hasHeroMedia()`:

- **sem mídia**: o split de sempre, texto à esquerda e o placeholder
  gráfico à direita;
- **com mídia** (estado atual, desde a Sprint 8.1): full-bleed
  cinematográfico, texto sobreposto na base sobre um gradiente escuro, e
  um parallax leve (`useScroll`/`useTransform`, 40px, desligado em
  `prefers-reduced-motion`) na camada de mídia.

`HERO_MEDIA.sources` aponta para `public/brand/video_teste.mp4`
(`overlayOpacity: 0.45`, subiu de `0.35` para compensar o contraste de
texto sobre vídeo em movimento). Sem `poster` configurado — usuários com
`prefers-reduced-motion` caem no placeholder gráfico genérico em vez de um
still real do vídeo (registrado no `BACKLOG.md`, junto do nome de arquivo
"de teste" — ambos pendentes do vídeo institucional definitivo).

### Primitiva de entrada (`features/menu/components/reveal.tsx`)

`Reveal` é o wrapper compartilhado de "fade + leve subida ao entrar na
viewport" (`whileInView`, `once: true`, respeita `prefers-reduced-motion`).
Toda seção nova da Fase 3 em diante usa `Reveal` em vez de reimplementar a
mesma configuração de `framer-motion`. Aceita `role`, porque `Reveal` já é
o `<div>` do item — uma lista usa `role="list"`/`role="listitem"` no
container e em cada `Reveal`, nunca `<ul>`/`<li>` (aninhar `<li>` dentro do
`<div>` do `Reveal` seria HTML invalido).

**Onde não usar por performance:** a grade de produtos do cardápio
(`menu-section.tsx`) só envolve o **cabeçalho** da seção em `Reveal` — a
grade em si pode ter dezenas de produtos somados entre todas as categorias,
e cada `Reveal` monta um `IntersectionObserver`. `ProductCard` continua
hover/animação só em CSS, decisão que já valia antes desta sprint.

### Seções institucionais condicionadas a dado real

Três seções novas seguem a mesma regra: **estrutura pronta, constante
vazia, seção que não renderiza sem conteúdo real** (nenhum placeholder
fictício vai ao ar — ver [ADR 0012](./adr/0012-institutional-content-gated-on-real-data.md)).

| Seção | Arquivo de conteúdo | Guarda |
|---|---|---|
| Galeria (`#galeria`) | `features/menu/gallery.ts` | `hasGallery()` |
| Depoimentos (`#depoimentos`) | `features/menu/testimonials.ts` | `hasTestimonials()` |
| Linha do tempo (dentro de `#sobre`) | `features/menu/about-content.ts` | `hasTimeline()` |

A galeria tem lightbox (`gallery-lightbox.tsx`) sobre o `Dialog` radix já
instalado — foco preso e Esc de graça, sem dependência nova; setas
←/→ e contador "n de N" por cima disso. Fotos de `fachada`/`ambiente`,
quando existirem, também alimentam os dois placeholders de imagem do
`StoreAbout`.

`nav.ts` deriva `STORE_NAV_ITEMS` a partir de `hasGallery`/
`hasTestimonials` — ver "Navegação da loja" acima.

### Destaques e Sobre Nós expandidos

`StoreValueProps` (3 promessas) evoluiu para `StoreHighlights`
(`features/menu/highlights.ts`, 6 destaques, entrada em stagger).
`StoreAbout` ganhou missão, valores e "por que escolher"
(`features/menu/about-content.ts`), além da história que já existia.

### Contato (`store-contact-section.tsx`, `contact-info.ts`, `store-info.ts`)

- CTA primário "Chamar no WhatsApp" ao lado de "Como chegar" (antes o
  WhatsApp só era um ícone redondo);
- `getWeeklyHours()` (puro, testado) mostra a semana inteira no card de
  horário, a partir de `BUSINESS_HOURS` — `StoreOpenBadge` continua sendo o
  único lugar que sabe a hora "agora" (hydration-safe);
- `ADDRESS_PARTS` é a fonte estruturada da qual `ADDRESS` (texto livre) é
  derivado — usada pelo `PostalAddress` do JSON-LD;
- `TIKTOK_LINK` (`null` hoje) e `TikTokIcon` existem prontos; renderizam
  condicionalmente na seção de contato e no rodapé quando o lojista informar
  o perfil.

### SEO técnico (`app/robots.ts`, `app/sitemap.ts`, `lib/seo/`)

- `lib/seo/page-metadata.ts` → `buildPageMetadata()`: centraliza
  `alternates.canonical`, Open Graph e Twitter sobre `/brand/og-default.png`
  (Fase 0), com `index` opcional. Aplicado em `/`, `/checkout` e
  `/pedido/[id]` (este via `generateMetadata`, canonical por id).
- `lib/seo/restaurant-json-ld.ts` → `buildRestaurantJsonLd()`: monta o
  schema.org `Restaurant` a partir das mesmas fontes que já alimentam a
  página (`lib/brand`, `contact-info.ts`, `store-info.ts`) — nenhum dado
  novo. Injetado via `<script type="application/ld+json">` na home.
- `/pedido/[id]` leva `noindex` por `metadata`, não por `robots.txt`:
  bloquear no `robots.txt` impediria o Google de sequer ver o `noindex`,
  arriscando indexar a URL nua se alguém compartilhar o link. `/login`,
  `/cozinha` e o layout de `/admin` (cobre as 14 subrotas de uma vez) levam
  `noindex` simples.
- OG dinâmico por produto/promoção segue no BACKLOG — precisa de
  `ImageResponse` com a Anton embutida como arquivo (ver ADR 0011).
