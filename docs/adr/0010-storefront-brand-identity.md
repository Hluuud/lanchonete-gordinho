# ADR 0010 — Identidade da loja: preto/creme com vermelho pontual

- **Status:** Aceito
- **Data:** 2026-08-04
- **Contexto da fase:** Sprint 7 (Identidade Visual da Área do Cliente)

## Contexto

A Sprint 6 entregou a estrutura da experiência do cliente (sidebar, hero,
seções, footer) mas manteve a paleta herdada da Sprint 4: laranja da logo
(`#FFA61E`) como `--primary` sobre fundo branco. Na prática o resultado lê
como um cardápio digital genérico — o laranja saturado sobre branco puro dá
um tom de aplicativo de delivery, não de hamburgueria.

Os mockups aprovados pelo lojista (`referencias/Referencia_1.png` e
`Referencia_2.png`) mostram outra coisa: **preto e creme dominando a tela, com
vermelho aparecendo só onde importa** — CTA, item de navegação ativo, tags de
produto. O laranja continua presente (é a logo), mas em papel de apoio.

Opções consideradas:

1. **Manter o laranja como primária** e redesenhar só layout/tipografia.
2. **Trocar `--primary` para vermelho** e rebaixar o laranja a `--accent`,
   mantendo o mecanismo de escopo por classe da ADR 0007.
3. **Criar uma classe `.theme-store`** com a nova paleta, deixando `:root`
   como está.

## Decisão

Adotar **(2)**: redefinir os valores do bloco `:root` em
`styles/globals.css`. `--primary` passa a ser vermelho
(`oklch(0.53 0.205 27)`, texto branco por cima), `--accent` recebe o laranja
da logo, `--background` vira creme quente em vez de branco.

Os blocos `.dark` (cozinha) e `.theme-admin` **não mudam** — o mecanismo da
ADR 0007 permanece exatamente como está, só os valores da loja foram
repintados.

Além disso, quatro tokens novos descrevem a superfície escura da marca
(sidebar, hero, footer):

```
--surface-dark            --surface-dark-muted
--surface-dark-foreground --surface-dark-border
```

Eles são declarados num seletor `:root, .dark, .theme-admin` compartilhado,
não repetidos dentro de cada bloco.

Por fim, a tipografia ganha uma fonte de display condensada e pesada (Anton,
via `next/font/google`, exposta como `--font-display` → utilitário
`font-display`). A Geist continua sendo o corpo de texto.

## Justificativa

- **`:root` já é a loja.** A ADR 0007 estabeleceu que `:root` *é* o tema do
  autoatendimento; os outros módulos é que se escopam. Criar uma
  `.theme-store` (3) inverteria essa convenção para nada — teríamos um
  `:root` sem dono e mais um lugar para esquecer de atualizar.
- **Nenhum componente muda.** `Button`, `Badge`, `Card` e todo o design
  system leem cor só dos tokens semânticos; trocar o valor de `--primary` os
  repinta sem uma linha de JSX alterada — a mesma propriedade que fez a
  ADR 0007 valer a pena.
- **(1) não resolve o problema relatado.** O pedido do lojista é sobre
  identidade, não sobre layout: o mockup aprovado é vermelho/preto/creme.
- **Os tokens de superfície escura são constantes por natureza.** O preto da
  sidebar é o mesmo preto em qualquer módulo — ele descreve a marca, não o
  papel semântico da cor. Declará-los uma vez para os três escopos evita
  três cópias que precisariam ser mantidas em sincronia.

## Consequências

- **Portais herdam a nova paleta.** Consequência já registrada na ADR 0007:
  `Toaster` (sonner) e overlays Radix montam fora do escopo de tema e leem
  `:root`. Toasts na cozinha e no admin, que antes eram laranja, agora são
  vermelhos. Continua sendo um detalhe estético, mas agora com uma cor a
  mais no inventário.
- **`--destructive` e `--primary` são ambos vermelhos.** Foram separados por
  luminosidade e saturação (`0.63/0.235` contra `0.53/0.205`), mas convivem
  na mesma tela no carrinho (botão "remover" ao lado do CTA). Se virar
  confusão de fato, o caminho é mover `--destructive` para um tom mais
  magenta — não desfazer esta decisão.
- **Uma requisição de fonte a mais.** A Anton entra via `next/font/google`,
  com self-host e `display: swap` automáticos: sem FOIT e sem chamada a um
  domínio de terceiros em runtime. Peso único (400).
- **`themeColor` mudou** de `#ffa61e` para o preto da marca — a barra do
  navegador em mobile acompanha o hero.

## Revisão

Reavaliar se o lojista fechar uma identidade visual formal com agência (aí a
paleta vem de fora), ou se a coexistência `primary`/`destructive` gerar erro
real de clique no carrinho.
