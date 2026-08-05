# ADR 0011 — Assets de marca gerados por script a partir de uma imagem-fonte

- **Status:** Aceito
- **Data:** 2026-08-05
- **Contexto da fase:** Sprint 8, Fase 0 (Conteúdo Visual — infraestrutura)

## Contexto

Depois da Sprint 7 o sistema tem identidade visual **dentro** da página
(paleta, tipografia, seções), mas nada **fora** dela: sem favicon, sem ícone na
home screen, sem manifest, sem splash de PWA e sem imagem de compartilhamento.
Um link da loja colado no WhatsApp aparecia como texto puro, e a aba do
navegador mostrava o ícone genérico do Next.

Ao mesmo tempo, a logo atual (`public/brand/logo.png`, um selo circular feito
no Canva) é **provisória** — o lojista já sinalizou que ela vai evoluir. Ela
também tem um erro de arte: o texto do selo diz "LANCHONTE", sem o segundo E.

O conjunto completo de assets é grande: favicon `.ico` e `.png`, ícone Apple,
ícones PWA 192/512, ícone `maskable`, 11 splash screens de iOS e a imagem Open
Graph. Produzir isso à mão uma vez já é tedioso; produzir de novo a cada
iteração da logo é garantia de conjunto desatualizado e inconsistente.

Opções consideradas:

1. **Exportar tudo à mão** (Canva/Figma) e commitar os arquivos.
2. **Gerar em build time**, dentro do pipeline do Next.
3. **Gerar por script offline**, commitando o resultado.
4. **Gerar em runtime** via `ImageResponse` (`app/icon.tsx`,
   `app/opengraph-image.tsx`).

## Decisão

Adotar **(3)**: um script Node (`scripts/generate-brand-assets.mjs`, exposto
como `pnpm brand:assets`) usa `sharp` para derivar **todos** os assets de
`public/brand/logo.png` mais os tokens de `lib/brand/tokens.json`. A saída é
commitada no repositório.

A troca da logo definitiva passa a ser: substituir um arquivo, rodar um
comando, commitar.

Consequências de cada alternativa recusada:

- **(1)** não sobrevive à primeira troca de logo — 18 arquivos exportados à mão
  divergem em poucas iterações.
- **(2)** acopla o build a `sharp` e a fontes do sistema. O texto da imagem
  Open Graph é renderizado via SVG com `Arial Black`; num runner Linux da
  Vercel essa fonte não existe e o texto sairia diferente — ou sumiria.
- **(4)** é a alternativa legítima e fica **parcialmente no backlog**: preview
  por produto ou promoção realmente precisa de `ImageResponse`. Para a imagem
  única do site inteiro ela só troca um PNG estático por trabalho a cada
  request, e exigiria embutir a Anton como arquivo de fonte, já que
  `next/font` não funciona dentro do `ImageResponse`.

## Detalhes que a decisão carrega

**Fonte da verdade dupla, deliberada.** `lib/brand/tokens.json` guarda as cores
em **hex**, enquanto `styles/globals.css` guarda as mesmas cores em `oklch`. O
CSS continua em `oklch` (é onde a paleta da ADR 0010 vive); o gerador precisa
de hex porque nem `sharp` nem SVG interpolam `oklch`. A conversão foi feita uma
vez, à mão. **Isso é dívida conhecida:** mudar a paleta exige mudar os dois
arquivos, e nenhum teste detecta a divergência (registrado no `BACKLOG.md`).

**Recorte da logo.** A imagem-fonte é um selo circular dentro de um quadrado
branco opaco. O gerador faz `trim()` da moldura e aplica máscara circular —
sem isso o favicon vira um quadrado branco numa aba escura, e o ícone flutua
num quadrado claro sobre o fundo marrom da splash.

**Respiro por finalidade.** Ícone `maskable` usa 60% do lado porque o Android
recorta as bordas em círculo ou squircle; os demais usam ~86%. O ícone Apple é
opaco porque o iOS não respeita canal alpha na home screen.

**Splash só em retrato.** O manifest declara `orientation: portrait`, então as
11 imagens cobrem só retrato. Em paisagem o Safari cai no branco — aceito e
registrado no backlog.

## Consequências

- Trocar a logo passa a ser uma operação de um comando, não um projeto.
- O repositório carrega ~2 MB de PNG gerado. É o preço de não depender de
  `sharp` nem de fontes do sistema no build de produção.
- Os assets gerados **não devem ser editados à mão** — a próxima execução do
  script sobrescreve.
- `app/manifest.ts` e o `metadata` de `app/layout.tsx` leem `lib/brand`, então
  nome, descrição e cores do PWA nunca divergem dos assets.
- Preview de compartilhamento por página (produto, promoção) fica em aberto e
  vai exigir `ImageResponse` — a decisão aqui não fecha essa porta.
