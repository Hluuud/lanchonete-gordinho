# Redesign da Experiência do Cliente — Fase 2: Home / Hero — Design

- **Data:** 2026-07-24
- **Escopo:** Frontend-only, área do cliente. Continuação da Fase 1 (Sidebar +
  Fundamentos, já implementada e revisada em `dev`) — ver
  `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`
  para o roadmap completo e as decisões de escopo já tomadas (paleta,
  ausência de assets reais, proibição de tocar `services/repositories/schema`
  nesta sprint, navegação incremental sem link morto).
- **Fora de escopo (não alterar):** banco, Supabase, `services/`,
  `repositories/`, checkout, carrinho (lógica), realtime, painel
  administrativo, painel da cozinha, impressão, QR Code.

## Objetivo

Substituir a entrada fria no cardápio (hoje a página abre direto na barra de
busca/filtros) por uma Hero Section de impacto — título forte, CTAs claros,
placeholder de vídeo pronto para receber o asset real — sem quebrar a
experiência de scroll single-page já validada na Fase 1.

## Contexto levantado

- `StoreExperience` (`features/menu/components/store-experience.tsx`) é a
  coluna direita do layout (`lg:grid-cols-[300px_minmax(0,1fr)]` junto da
  `StoreSidebar`): `StoreTopbar` (sticky) seguido do `<div id="cardapio">`
  que hoje começa direto com a busca mobile/filtros/destaques/categorias.
- Nenhum produto tem `imageUrl` real cadastrado ainda (confirmado com o
  usuário) — o placeholder do Hero não pode depender de foto de produto.
- `useCart()` já expõe `setOpen(boolean)` (usado por `StoreTopbar` para abrir
  o carrinho pelo ícone da sacola) — reaproveitável para o botão "Fazer
  Pedido" sem nova lógica de carrinho.
- `scrollToSection(anchorId)` (`features/menu/scroll-to-section.ts`) já
  aceita qualquer id de âncora, não só os prefixados por
  `sectionAnchorId()` — o `#cardapio` da Fase 1 já é um exemplo de âncora
  "crua". O novo `#home` segue o mesmo padrão.
- `useScrollSpy` (`features/menu/use-scroll-spy.ts`) aceita qualquer lista
  de ids de seção — hoje a sidebar/drawer só passam os ids das categorias;
  precisa passar `"home"` também para o item de nav novo poder ficar ativo.
- `lucide-react` (versão instalada) tem o ícone `Home` — confirmado via
  `Object.keys(require('lucide-react'))`.

## Decisões

1. **Copy do Hero (texto final, não placeholder):**
   - Título: "O Hambúrguer que vai conquistar seu dia."
   - Subtítulo: "Feito na hora, com ingredientes de verdade — no capricho
     que só a Lanchonete do Gordinho tem."
   - Ambos são apenas constantes de string no componente — editáveis
     depois sem nenhuma mudança estrutural.
2. **Placeholder do vídeo:** gradiente laranja/preto (tokens `--primary`/
   `--foreground`, sem cor hardcoded) com o ícone de hambúrguer como
   elemento gráfico central, `aria-hidden`. Sem foto de produto (nenhum
   produto tem imagem real hoje) e sem imagem de banco de imagens genérica.
   O componente aceita uma prop opcional `videoUrl?: string`: quando
   definida, renderiza `<video autoPlay muted loop playsInline>` no lugar
   do gradiente — pronto para receber asset local ou CDN sem redesenho,
   sem uso ainda (`videoUrl` não é passada por ninguém nesta fase).
3. **CTAs:**
   - "Ver Cardápio" → `scrollToSection("cardapio")` (mesmo destino do CTA
     "Peça Agora" da sidebar — redundância aceitável: no mobile a sidebar
     está escondida, o Hero é o único CTA visível ali).
   - "Fazer Pedido" → `useCart().setOpen(true)` (abre o carrinho existente
     — atalho para quem já tem item, não inventa fluxo novo).
4. **Posição no layout:** `<StoreHero />` renderiza dentro da coluna direita
   de `StoreExperience`, **entre** `<StoreTopbar />` e o `<div id="cardapio">`
   existente — o topbar permanece sticky e visível acima do Hero durante o
   scroll, igual às referências do usuário (barra de status no topo, hero
   grande logo abaixo).
5. **Navegação incremental:** "Home" vira o **primeiro item** da lista de
   navegação em `StoreSidebar` e `StoreMobileNav` — estático (não vem de
   `sections`), aponta para `#home`. `useScrollSpy` passa a observar
   `["home", ...sections.map(sectionAnchorId)]` nos dois componentes, para
   o item "Home" poder ficar destacado como os demais.
6. **Sem novo `NAV_SECTIONS` compartilhado:** por ora, "Home" é tratado como
   um item estático extra em cada um dos dois arquivos (sidebar/drawer),
   igual ao padrão já usado para os itens dinâmicos — evita introduzir uma
   abstração nova (config compartilhada de nav) para dois itens estáticos
   (só "Home" nesta fase); reavaliar se as próximas fases (Sobre Nós,
   Contato, Promoções, Mais Vendidos) tornarem a lista de itens estáticos
   grande o suficiente para justificar extrair um array comum.

## Arquivos (detalhe de implementação)

### Novo: `features/menu/components/store-hero.tsx`

Client component. Sem props obrigatórias; `videoUrl?: string` opcional
(não usada nesta fase). Estrutura: `<section id="home">` com grid de duas
colunas em `lg:` (empilha no mobile) — esquerda: `h1` (título), `p`
(subtítulo), dois botões (`Button` de `components/ui/button`, variantes
`primary`/`outline`); direita: placeholder gradiente com o ícone `Sandwich`
(lucide-react — o mesmo já usado por `CategoryIcon` para a categoria
"lanches", consistência visual com o resto do app) centralizado em grande
escala, `aria-hidden`, ou `<video>` quando `videoUrl` for passada. O ícone
`Home` (item de navegação, decisão 5) é usado só na sidebar/drawer, não no
placeholder do Hero.

### Alterado: `features/menu/components/store-experience.tsx`

Import de `StoreHero`; renderizar `<StoreHero />` logo após `<StoreTopbar
.../>` e antes do `<div id="cardapio" ...>` existente. Nenhuma outra
mudança — `StoreTopbar`/`SearchBar`/`FilterBar`/seções permanecem
idênticos.

### Alterado: `features/menu/components/store-sidebar.tsx`

- Import de `Home` (lucide-react).
- `useScrollSpy` passa a receber `["home", ...sections.map(...)]`.
- Novo `<li>` estático antes do `sections.map(...)`, mesmo estilo visual
  dos itens dinâmicos (`aria-current`, classes ativa/inativa), sem o badge
  de contagem (não é uma categoria de produto).

### Alterado: `features/menu/components/store-mobile-nav.tsx`

- Import de `Home`.
- Novo botão estático "Home" antes do `sections.map(...)`, com um handler
  próprio (`goToHome`) que fecha o Drawer e rola para `"home"` (mesmo
  padrão de `goTo`, mas sem passar pelo prefixo `sectionAnchorId`).

## Testes / validação

Sem lógica pura nova testável isoladamente (é composição visual +
constantes de string, mesma categoria da Fase 1). Validação: `npm run
build`, typecheck, lint, `npm test` (regressão em `use-scroll-spy` —
adicionar `"home"` à lista de ids observados não deve quebrar os testes
existentes, que testam a função em isolamento, não o array específico
passado pelos componentes), revisão visual manual quando disponível.

## Riscos / limitações conhecidas

- Mesma limitação já registrada no BACKLOG após a Fase 1: verificação
  visual em navegador real pode não estar disponível nesta sessão
  (`claude-in-chrome` ausente) — validação por build/typecheck/lint/testes
  + revisão de código, com recomendação de conferência manual antes do
  merge para `main`.
- Copy do Hero (título/subtítulo) é texto fixo aprovado nesta sessão — troca
  futura é só editar a constante, sem impacto estrutural.
