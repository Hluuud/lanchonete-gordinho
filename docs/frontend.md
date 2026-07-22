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
