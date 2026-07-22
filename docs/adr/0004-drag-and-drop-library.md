# ADR 0004 — Drag-and-drop do Kanban: `@dnd-kit`

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 2 (Painel da Cozinha)

## Contexto

O Kanban da cozinha precisa de drag-and-drop entre colunas (mudança de
status). Nenhuma lib do tipo existia no projeto. Opções consideradas:

1. **`@dnd-kit/core` + `@dnd-kit/sortable`** (só pelo `coordinateGetter` de
   teclado multi-container).
2. **`react-beautiful-dnd`** (Atlassian) — descontinuada, sem suporte a
   React 18/19 em modo estrito.
3. **`@atlaskit/pragmatic-drag-and-drop`** — mais nova, agnóstica de
   framework, mas API de mais baixo nível (mais código próprio para o mesmo
   resultado).
4. **Drag nativo do HTML5** (`draggable` + eventos `dragstart`/`dragover`) —
   zero dependência, mas sem suporte de teclado/acessibilidade de fábrica.

## Decisão

Adotar **(1) `@dnd-kit`**.

## Justificativa

- **Compatível com React 19** (o projeto já está na versão mais recente,
  `CLAUDE.md` proíbe travar em versões antigas) — (2) não é.
- **Acessibilidade de fábrica:** `KeyboardSensor` com
  `sortableKeyboardCoordinates` permite mover um pedido entre colunas via
  teclado, requisito explícito do `CLAUDE.md` (regra #9) — (4) exigiria
  reimplementar isso do zero.
- **Nível de abstração certo para o escopo:** o board só precisa saber "em
  qual coluna o card foi solto" (um `useDraggable`/`useDroppable` por
  card/coluna) — não precisamos de reordenação fina dentro da coluna
  (`ordenar automaticamente` do prompt é por prioridade + horário, não drag
  manual). (3) exigiria mais código para o mesmo resultado.
- Mantida como dependência mesmo sem usar reordenação `sortable` completa: o
  pacote `@dnd-kit/sortable` é usado exclusivamente pelo
  `sortableKeyboardCoordinates`, necessário para navegação por teclado entre
  múltiplos containers (é o padrão recomendado pela própria documentação do
  dnd-kit para esse cenário).

## Consequências

- **Toda transição de status também tem um botão de ação equivalente no
  card** (ver `docs/kitchen-panel.md`) — o drag nunca é a única forma de
  mudar status. Isso não é uma limitação do dnd-kit, é uma decisão de design
  independente (tablets com touch impreciso, TV da cozinha sem input).
- **`PointerSensor` com `activationConstraint: { distance: 8 }`** evita que
  cliques nos botões internos do card (Aceitar, Cancelar, Prioridade) sejam
  capturados como início de drag.
- Nenhuma dependência nova de animação: o dnd-kit não inclui transições de
  entrada/saída de card — isso continua vindo do Framer Motion já usado no
  projeto (`AnimatePresence` em `kitchen-column.tsx`).

## Revisão

Reavaliar se um requisito futuro pedir reordenação manual fina dentro de
uma mesma coluna (ex.: priorizar visualmente um pedido específico além do
`is_priority`) — nesse caso, adotar de fato o `SortableContext` completo do
`@dnd-kit/sortable`, já presente como dependência.
