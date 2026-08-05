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

- **`StoreSidebar`** (`lg:+`) — fixa, `sticky top-0 h-dvh`: logo, busca,
  navegação vertical de seções com `aria-current` na ativa.
- **`StoreTopbar`** — sticky, sempre visível: nome da loja, badge
  Aberto/Fechado, tempo médio de preparo, breadcrumb discreto da seção
  ativa, botão de carrinho com contador. No mobile, também abre o
  `StoreMobileNav` (drawer com a mesma lista de seções da sidebar).
- **`CategoryNav`** — nav horizontal sticky, `lg:hidden`: navegação primária
  de rolagem no mobile/tablet (a sidebar assume esse papel em telas
  maiores).

### Seções (`features/menu/virtual-sections.ts`)

`buildStoreSections(menu)` monta a lista única consumida por sidebar,
`CategoryNav` e conteúdo: seções **virtuais** (derivadas de badges reais —
`isFeatured` → "Promoções & Destaques", `isNew` → "Novidades", ocultas
quando vazias) seguidas das categorias reais do banco. "Combos" e "Mais
Vendidos" ficam de fora até existir schema — nunca dado fabricado (ver
`BACKLOG.md`). `MenuSection` é o componente único que renderiza qualquer
seção (virtual ou real) com o mesmo grid de cards.

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
os valores de `:root` são a identidade da loja: preto e creme dominantes,
`--primary` vermelho e o laranja da logo em `--accent`. `.dark` e
`.theme-admin` seguem inalterados.

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
