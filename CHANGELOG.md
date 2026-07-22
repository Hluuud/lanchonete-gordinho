# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

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
