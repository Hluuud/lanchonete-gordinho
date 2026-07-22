# ADR 0007 — Identidades visuais por módulo via classes de escopo de tokens

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 4 (Redesign UX/UI — Cardápio de Autoatendimento)

## Contexto

A sprint pede três identidades visuais distintas e coerentes com o papel de
cada módulo: a loja (autoatendimento, laranja/preto/branco da marca), a
cozinha (painel industrial de alto contraste) e o admin (ERP neutro). As
três compartilham exatamente os mesmos componentes shadcn/ui
(`Button`, `Badge`, `Card`...), que já leem cor exclusivamente dos tokens
CSS semânticos definidos em `styles/globals.css` (`--primary`,
`--background` etc.) — nenhum componente tem cor hardcoded.

Opções consideradas:

1. **Temas via classe de escopo de tokens**: cada módulo aplica uma classe
   num elemento ancestral (`.dark`, `.theme-admin`) que redefine as mesmas
   variáveis CSS; os componentes não mudam nada.
2. **Componentes duplicados por módulo** (`AdminButton`, `KitchenButton`...):
   variantes visuais próprias por módulo.
3. **Prop de tema explícita** passada por todo componente (`<Button theme="admin">`).

## Decisão

Adotar **(1) classes de escopo de tokens**: `:root` (loja, paleta laranja da
logo), `.dark` (cozinha, alto contraste — já preparado desde a Fase 0) e
`.theme-admin` (novo, admin, slate/azul neutro). Cada `layout.tsx` de grupo
de rota aplica a classe correspondente uma única vez:

- `app/(store)/layout.tsx` — nenhuma classe extra (`:root` já é a loja).
- `app/(kitchen)/layout.tsx` — `className="dark"`.
- `app/(admin)/admin/layout.tsx` — `className="theme-admin"`.

## Justificativa

- **Zero duplicação de componentes.** `Button`, `Badge`, `Card` e todo o
  resto do design system funcionam sem alteração nos três módulos — eles já
  seguiam a convenção de nunca hardcodar cor (`bg-primary`, não
  `bg-orange-500`), então bastou dar um novo valor a `--primary` por escopo.
  (2) violaria DRY do `CLAUDE.md` para um problema que já tem solução no
  próprio sistema de tokens.
- **Consistente com uma decisão já existente.** `.dark` já existia desde a
  Fase 0 exatamente para este propósito (ver comentário original em
  `styles/globals.css`); esta ADR apenas formaliza o padrão e estende com
  `.theme-admin`, em vez de inventar um mecanismo novo.
- **(3) espalharia a decisão de tema pela árvore de componentes** — cada uso
  de `Button` precisaria saber em qual módulo está, um acoplamento
  desnecessário. Com (1), a decisão fica em um único lugar por módulo (o
  `layout.tsx`).

## Consequências

- **Portais montam fora do escopo.** `Toaster` (sonner) e overlays Radix
  (`Sheet`, `Dialog`) renderizam num portal anexado ao `<body>`, fora da
  subárvore onde a classe de tema foi aplicada — toasts e diálogos abertos
  dentro da cozinha ou do admin usam os tokens de `:root` (loja), não os do
  módulo. Registrado no `BACKLOG.md`; resolver exigiria portais
  configuráveis por módulo ou mover o `Toaster` para dentro de cada layout
  (com múltiplas instâncias) — fora do escopo desta sprint puramente visual.
- **Um único arquivo (`globals.css`) concentra as três paletas.** Facilita
  auditoria de contraste (todas as combinações visíveis lado a lado), mas
  exige atenção ao editar: mudar um token em `:root` sem querer não afeta
  `.dark`/`.theme-admin` (são blocos independentes), mas uma variável nova
  precisa ser adicionada aos três blocos para não quebrar um módulo.
- **Novo módulo futuro (app do garçom, do entregador) só precisa de uma
  classe nova** com os mesmos ~20 tokens redefinidos — o padrão já está
  provado em três instâncias.

## Revisão

Reavaliar se toasts/overlays module-aware vierem a ser pedidos
explicitamente (hoje é só um detalhe estético secundário, não um bloqueador
funcional).
