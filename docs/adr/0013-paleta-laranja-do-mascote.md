# ADR 0013 — Paleta laranja do mascote

- **Status:** Aceito
- **Data:** 2026-08-06
- **Contexto da fase:** Sprint 8.1 (Refinamento da Experiência do Cliente)

## Contexto

A ADR 0010 definiu preto/creme com vermelho pontual (`--primary` vermelho,
`--accent` laranja da logo). O lojista pediu, na Sprint 8.1, que a cor
principal do sistema seja exatamente o laranja da identidade visual do
mascote "Gordinho" — o selo `public/brand/logo.png`, não o boneco em si
(que não tem laranja nenhum).

Amostragem de cor do selo (30k pixels aleatórios) encontrou três tons de
laranja: `#F28C28` (círculo interno, dominante), `#FFB84D` (anel externo,
mais claro), `#D96318` (faixa "GORDINHO", mais escuro).

Testado o contraste WCAG dos dois primeiros contra texto branco e contra o
texto escuro que já existia como `--accent-foreground` (`oklch(0.24 0.03
65)`, ~`#291c10`):

| Fundo     | vs. branco | vs. `#291c10` |
|-----------|-----------:|--------------:|
| `#F28C28` |  2.45:1 ❌ |    6.75:1 ✅   |
| `#FFB84D` |  1.72:1 ❌ |    9.63:1 ✅   |

Texto branco sobre qualquer um dos dois tons falha WCAG AA (mínimo 4.5:1
para texto normal, 3:1 para texto grande) — os dois laranjas do selo são
claros o bastante para exigir texto escuro por cima, não branco.

## Decisão

`--primary` (bloco `:root`) passa de `oklch(0.53 0.205 27)` (vermelho) para
`oklch(0.73 0.161 59)` (`#F28C28`). `--primary-foreground` passa de
`oklch(0.99 0.004 90)` (branco) para `oklch(0.24 0.03 65)` (o mesmo tom
escuro que já era `--accent-foreground`).

`--accent` passa de `oklch(0.79 0.165 68)` para `oklch(0.83 0.145 74)`
(`#FFB84D`). `--accent-foreground` **não muda** — já era escuro o
suficiente para o novo tom (contraste 9.63:1).

`--destructive` **não muda** — continua vermelho (`oklch(0.63 0.235 25)`).
Os tokens de superfície escura (`--surface-dark*`) e `themeColor`
(`lib/brand/tokens.json`) também não mudam: a marca continua preto/creme
com o laranja em papel de destaque (CTA, ativo, badge), não substituindo o
preto do hero/sidebar.

`lib/brand/tokens.json` (`colors.primary`, `colors.accent`) é atualizado em
paralelo, mantendo as duas fontes de verdade em sincronia manual (dívida já
registrada na ADR 0011).

## Justificativa

- **Mesmo mecanismo da ADR 0010.** `:root` já é o tema da loja — só o valor
  muda, nenhum componente é tocado (`Button`, `Badge` etc. leem os tokens
  semânticos).
- **Contraste medido, não assumido.** Testar os dois tons de laranja contra
  branco e contra o escuro existente evitou publicar um CTA com texto
  ilegível — um erro fácil de cometer trocando "vermelho com texto branco"
  por "laranja com texto branco" sem medir.
- **Resolve de brinde a pendência da ADR 0010.** Aquela ADR registrava
  `--destructive` e `--primary` quase colidindo (ambos vermelhos). Com
  `--primary` agora laranja, os dois ficam claramente distintos sem
  precisar tocar em `--destructive`.

## Consequências

- Portais que leem `:root` fora do escopo de tema (Toaster, overlays Radix)
  herdam o laranja — mesma consequência já registrada na ADR 0010, agora
  com uma cor diferente.
- Textos que assumiam `--primary-foreground` branco (se algum componente
  hard-coded texto branco sobre um elemento com `bg-primary` em vez de usar
  o token) precisam ser auditados na Fase F desta sprint.

## Revisão

Reavaliar caso o lojista formalize identidade visual com agência.
