# Sprint Report — Sprint 8, Fase 0: Infraestrutura de Assets de Marca

- **Data:** 2026-08-05
- **Escopo:** identidade "fora da página" — favicon, ícones PWA, manifest,
  splash screens e imagem Open Graph, mais o gerador que os produz.
- **Fora de escopo (intocado):** migrations, Supabase, checkout, carrinho,
  realtime, admin, cozinha, impressão, layout de qualquer página.

## Contexto

A conversa que abriu a sprint listou o que falta para o ganho percebido pelo
cliente: fotos profissionais dos hambúrgueres, vídeos em loop, banner
principal, fotos de fachada e do salão, logo nova, ícones próprios, favicon,
splash de PWA e imagens de Open Graph.

A maior parte dessa lista é **material bruto** — nada que se resolva com
código. Mas quatro itens (favicon, splash, Open Graph, ícones) são
infraestrutura pura, e sem eles o material, quando chegar, não tem onde
aterrissar. Esta fase entrega essa infraestrutura, derivando tudo da logo
provisória atual, de modo que a chegada da logo definitiva seja uma troca de
arquivo em vez de um retrabalho.

Estado encontrado no repositório:

- `public/brand/logo.png` (500×500) e `components/brand-logo.tsx` existiam;
- `HeroMedia` já tratava vídeo em loop, pôster e placeholder, respeitando
  `prefers-reduced-motion`;
- `components/image-upload.tsx` já subia imagem de produto para o bucket
  `store-assets`;
- **não existia** nenhum favicon, ícone, manifest ou tag Open Graph.

## O que foi feito

### Gerador (`scripts/generate-brand-assets.mjs`, `pnpm brand:assets`)

`sharp` produz 18 arquivos a partir da logo mais os tokens de
`lib/brand/tokens.json`:

| Saída | Uso |
| --- | --- |
| `app/icon.png` (512, transparente) | favicon moderno, servido em `/icon.png` |
| `public/favicon.ico` (32) | requisição legada de `/favicon.ico` |
| `app/apple-icon.png` (180, opaco) | home screen do iOS |
| `public/icons/icon-{192,512}.png` | ícones do manifest |
| `public/icons/icon-maskable-512.png` | recorte circular/squircle do Android |
| `public/splash/apple-splash-*.png` (11) | splash do iOS, retrato |
| `public/brand/og-default.png` (1200×630) | compartilhamento em redes sociais |

Dois detalhes custaram iteração:

1. A logo é um selo circular dentro de um **quadrado branco opaco**. A primeira
   geração produziu um favicon que aparece como quadrado branco em aba escura e
   um Open Graph com a logo boiando numa caixa clara. Resolvido com `trim()` da
   moldura mais máscara circular via composite `dest-in`.
2. A primeira versão da imagem Open Graph tinha a logo à esquerda e o texto à
   direita, e o texto **estourava a caixa** — `sharp` não expõe métricas de
   fonte, então não há como medir a linha. Trocado por layout centralizado com
   estimativa de largura por caractere, que perdoa erro de estimativa.

### Fonte da verdade (`lib/brand/`)

`tokens.json` (nome, short name, descrição, tagline, cores hex) e
`splash-targets.json` (11 resoluções de iPhone/iPad) são lidos **tanto** pelo
gerador (via `fs`) **quanto** pelo app (import tipado). Uma cor muda em um
lugar só.

`index.ts` exporta ainda `siteUrl()` — `NEXT_PUBLIC_SITE_URL` → `VERCEL_URL` →
`localhost:3000` — e os helpers de caminho e media query de splash.

### Manifest e metadata

- `app/manifest.ts` serve `/manifest.webmanifest` com `display: standalone`,
  `start_url: "/"` (quem instala é o cliente, não o admin), `background_color`
  no marrom da marca e ícone `maskable`.
- `app/layout.tsx` ganhou `metadataBase`, `openGraph`, `twitter`
  (`summary_large_image`), `icons`, `appleWebApp` e as tags
  `apple-touch-startup-image` por resolução — o Safari só aceita splash por
  `<link>` com media query casando o aparelho exato.

### Ajustes de borda

- `NEXT_PUBLIC_SITE_URL` (opcional) em `lib/env.ts` e `.env.example`, com
  `preprocess` para tratar linha vazia como ausente em vez de falhar a
  validação de URL.
- `proxy.ts`: o matcher passa a excluir `.ico`, `.webmanifest`, `.avif`,
  `.mp4` e `.webm` — assets públicos não precisam de revalidação de sessão.

## Decisões

Registradas em `docs/adr/0011-brand-assets-generated-from-single-source.md`.
Em resumo: gerar por script offline e commitar o resultado, em vez de exportar
à mão, gerar no build ou gerar em runtime via `ImageResponse`.

## Achados

**Achado 1 — a logo tem erro de arte.** O texto do selo diz "LANCHONTE", sem o
segundo E. Como toda a cadeia de ícones deriva dela, o erro se propagou para os
18 arquivos gerados. Não foi corrigido nesta fase (corrigir a arte é trabalho
de design, não de código) e está no `BACKLOG.md` junto com a logo definitiva.

**Achado 2 — `pnpm format:check` já estava quebrado no `main`.**
`.prettierrc.json` não define `printWidth`, então vale o default de 80 colunas,
mas o código commitado foi escrito em ~90-100. Rodar `pnpm format` como parte
do Definition of Done reformatou 110 arquivos sem relação com a sprint. Os
arquivos não relacionados foram revertidos e o commit ficou limpo; a
divergência de config permanece e foi decisão explícita do usuário não
resolvê-la agora.

## Validações

| Portão | Resultado |
| --- | --- |
| `pnpm typecheck` | passou |
| `pnpm lint` | `ESLint: No issues found` |
| `pnpm test` | 18 arquivos, 121 testes, todos passando |
| `pnpm build` | `✓ Compiled successfully`; rotas `/icon.png`, `/apple-icon.png`, `/manifest.webmanifest` presentes |

### Verificação em runtime

Servidor local respondendo, `curl` no HTML da raiz confirma no `<head>`:

- 11 tags `apple-touch-startup-image` com as media queries corretas;
- `og:title`, `og:description`, `og:site_name`, `og:locale`, `og:type`,
  `og:image` (URL **absoluta**), `og:image:width/height/alt`;
- `twitter:card=summary_large_image` mais título, descrição e imagem;
- `rel="icon"` (`/icon.png` e `/favicon.ico`), `rel="apple-touch-icon"`,
  `rel="manifest"`, `theme-color`, `application-name`,
  `apple-mobile-web-app-title`.

Todos os arquivos servidos com 200 e content-type correto —
`/manifest.webmanifest` como `application/manifest+json`, `/favicon.ico` como
`image/x-icon`.

A imagem Open Graph e o ícone `maskable` foram inspecionados visualmente
depois de gerados.

## Não entregue (e por quê)

Tudo que depende de material bruto do lojista: fotos de produto, vídeo do
hero, fotos de fachada e do salão, logo definitiva e um set de ícones autoral.
Detalhado em `BACKLOG.md` sob "Sprint 8 — Conteúdo Visual", separando o que
está bloqueado por material do que depende de código (Open Graph por página,
splash em paisagem, service worker).

## Definition of Done

| Item | Estado |
| --- | --- |
| Documentação (`docs/frontend.md`) | feito — seção nova sobre o pipeline |
| `CHANGELOG.md` | feito |
| `BACKLOG.md` | feito — seção "Sprint 8 — Conteúdo Visual" |
| Graphify | feito — rebuild completo, 1718 nós / 4364 arestas / 158 comunidades |
| ADR | feito — ADR 0011 |
| Build / Typecheck / Lint / Testes | feito |
| Revisão crítica | feita — ver Achados |
| Sprint Report | este documento |
| Commit | feito (`feat(brand): infraestrutura de assets`) |

### Nota sobre a atualização do Graphify

A atualização incremental (`--update`) se mostrou **lossy** neste repositório:
o extrator AST só resolve import entre arquivos presentes no mesmo lote, e um
lote parcial de 112 dos 313 arquivos derrubou 261 arestas `imports_from` e 104
`calls` de arquivos que sequer mudaram de conteúdo. O grafo foi refeito com
build completo (custo zero de LLM — os 40 arquivos semânticos estavam em
cache).

Duas observações operacionais para as próximas sprints:

- a extração AST em paralelo (6 workers) **quebra** com os 313 arquivos deste
  repositório — 280 voltam com zero nós. Rodar com `parallel=False`;
- os PNGs gerados (`public/icons`, `public/splash`, `og-default`) precisam ser
  excluídos do corpus, senão vão para extração por visão e custam tokens sem
  gerar conhecimento.
