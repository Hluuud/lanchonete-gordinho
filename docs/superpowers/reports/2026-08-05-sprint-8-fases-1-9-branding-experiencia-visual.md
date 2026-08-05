# Sprint Report — Sprint 8, Fases 1-9: Branding, Experiência Visual e Mídia

- **Data:** 2026-08-05
- **Escopo:** frontend-only, sobre a base das Sprints 6/7 e da Fase 0 desta
  mesma sprint (infraestrutura de assets de marca, já entregue e reportada
  separadamente).
- **Fora de escopo (intocado):** migrations, Supabase, checkout, carrinho,
  realtime, admin, cozinha, impressão. Nenhuma chamada nova ao Supabase.

## Contexto

O pedido era elevar a experiência visual da vitrine — hero cinematográfico,
galeria institucional, destaques da casa, storytelling em Sobre Nós,
depoimentos, contato/redes modernos, SEO técnico e micro-interações — sem
tocar a base funcional já entregue (cardápio, carrinho, checkout, painéis).
Duas restrições vieram já resolvidas na conversa que abriu a sprint:

1. **Evoluir, não recriar.** `StoreValueProps`, `StoreAbout`,
   `StoreContactSection` e `contact-info.ts` já existiam das Sprints 6/7 —
   a sprint deveria estendê-los, não substituí-los, pra não arriscar
   `STORE_NAV_ITEMS`/scroll-spy/testes que já funcionavam.
2. **Nada fake no ar.** Galeria e depoimentos não têm material real hoje;
   a decisão foi estrutura pronta + constante vazia + seção que não
   renderiza, em vez de placeholder de exemplo ou dado fictício — registrado
   como decisão formal em
   [ADR 0012](../../adr/0012-institutional-content-gated-on-real-data.md).

Cada fase seguiu o mesmo ciclo: analisar → implementar → `lint`/`typecheck`/
`test`/`format` → smoke test no servidor local (`curl` no HTML) → commit.

## O que foi feito, por fase

**Fase 1 — Pipeline de marca multi-variante.** `tokens.source` (antes só
`logo`) aceita três fontes opcionais: `logoHorizontal`, `logoMono`,
`watermark`. O gerador (`scripts/generate-brand-assets.mjs`) pula fonte
ausente com aviso — os 18 assets de sempre saem byte-identicos quando
nenhuma variante extra está configurada (confirmado rodando o gerador de
novo e comparando `git status`). `brandAsset()`/`<BrandLogo variant>`
degradam pro selo. Aproveitada a fase pra corrigir a grafia "LANCHONTE" →
"LANCHONETE" na logo (achado registrado desde a Fase 0) e regenerar os 18
assets.

**Fase 2 — Hero cinematográfico.** `HERO_MEDIA` troca dois escalares
(`HERO_VIDEO_URL`/`HERO_POSTER_URL`) por um objeto com `sources[]`
(múltiplas fontes, WebM antes de MP4), `poster`, `posterMobile` e
`overlayOpacity`. `resolveHeroMedia()`/`hasHeroMedia()` são puras e
testadas. `StoreHero` ganha um segundo layout — full-bleed, texto sobreposto
num gradiente escuro — ativado só quando existir mídia real; hoje `HERO_MEDIA`
está vazio, então o comportamento visual é idêntico ao anterior.

**Fase 3 — `Reveal` e Destaques da Casa.** `features/menu/components/
reveal.tsx`: wrapper único de entrada (`whileInView`, `once`,
`prefers-reduced-motion`) que todas as seções novas passaram a reusar.
`StoreValueProps` (3 promessas) evoluiu para `StoreHighlights` (6 destaques:
Hambúrguer Artesanal, Batata Crocante, Bebidas Geladas, Pastéis,
Ingredientes Frescos, Preparo Rápido), com stagger.

**Fase 4 — Galeria institucional (`#galeria`).** `gallery.ts` define
categorias (fachada, ambiente, cozinha, equipe, clientes, hambúrgueres,
batatas, pastéis, bebidas) e nasce vazia. `StoreGallery` agrupa por
categoria com `Skeleton` atrás de cada foto; `GalleryLightbox` usa o
`Dialog` radix já instalado (foco preso e Esc de graça, sem dependência
nova), com setas e contador. `nav.ts` deixou de exportar um array fixo:
`STORE_NAV_ITEMS` agora vem de `buildStoreNavItems({ hasGallery,
hasTestimonials })`.

**Fase 5 — Storytelling em Sobre Nós.** `about-content.ts` extrai história,
missão, valores (Carinho/Qualidade/Comunidade — substituindo os 3 cards
antigos de Missão/Qualidade/Especialidade), "por que escolher" e uma linha
do tempo. A linha do tempo nasce vazia — não há marco real registrado, e
inventar ano mentiria pro cliente. As duas fotos placeholder da seção usam
a primeira foto de `fachada`/`ambiente` da galeria quando existir.

**Fase 6 — Depoimentos (`#depoimentos`).** `testimonials.ts` (nome, nota
1-5, comentário, foto/data opcionais) nasce vazio. `StoreTestimonials`:
estrelas com `aria-label` na nota (não só o ícone), avatar por iniciais sem
foto. `nav.ts` ligou `hasTestimonials` (o parâmetro já existia desde a
Fase 4, só não tinha dado real pra passar).

**Fase 7 — Contato e redes.** CTA primário "Chamar no WhatsApp" ao lado de
"Como chegar". `getWeeklyHours()` (puro, testado) mostra a semana inteira
no card de horário a partir de `BUSINESS_HOURS` (dado real já existente) —
`StoreOpenBadge` continua sendo o único lugar que sabe a hora "agora".
`TIKTOK_LINK`/`TikTokIcon` prontos, `null` até o lojista informar o perfil.
`ADDRESS_PARTS` estrutura o endereço, do qual `ADDRESS` (texto livre) passou
a ser derivado.

**Fase 8 — SEO técnico e compartilhamento.** `app/robots.ts` (bloqueia
`/api`, `/admin`, `/cozinha`, `/login`) e `app/sitemap.ts` (só a home — a
vitrine é single-page). `lib/seo/restaurant-json-ld.ts` monta o schema.org
`Restaurant` a partir de fontes que já existem (`lib/brand`,
`contact-info.ts`, `store-info.ts`) e injeta via `<script type="application/
ld+json">` na home. `lib/seo/page-metadata.ts` centraliza `canonical` +
Open Graph + Twitter, aplicado em `/`, `/checkout` e `/pedido/[id]`
(`generateMetadata`, canonical por id). `/pedido/[id]` leva `noindex` por
metadata (não por `robots.txt` — bloquear ali impediria o Google de ver o
`noindex`); `/login`, `/cozinha` e o layout de `/admin` levam `noindex`
simples.

**Fase 9 — UX sensorial.** `Reveal` nas seções existentes: cardápio (só o
cabeçalho — a grade pode ter dezenas de produtos, e `ProductCard` já é
hover/animação só em CSS por performance), promoções, combos (com stagger),
mais vendidos (com stagger), contato. Hover unificado em cards com borda
(`ComboCard`, valores do Sobre, depoimentos): `transition-all duration-200
hover:-translate-y-1 hover:shadow-lg`. `StoreHero` ganha parallax leve
(`useScroll`/`useTransform`, 40px) só no layout cinematográfico, desligado
em `prefers-reduced-motion`.

## Decisões

Registrada em [ADR 0012](../../adr/0012-institutional-content-gated-on-real-data.md):
Galeria, Depoimentos e Linha do Tempo seguem "estrutura pronta, seção oculta
sem dado real" em vez de placeholder textual ou dado de exemplo — mesmo
princípio de honestidade da UI que já regia preço promocional e combos
desde a Sprint 7, agora estendido a conteúdo institucional e à navegação
derivada.

## Achados

**Achado 1 — `pnpm format:check` já falhava no `main`, antes de qualquer
mudança desta sprint.** Ao correr `pnpm format` (Fase 1), 114 arquivos não
relacionados foram reformatados — mesma classe de problema já registrada no
Sprint Report da Fase 0 (drift de config), mas em escala maior. Os arquivos
não tocados pela sprint foram restaurados ao `HEAD` antes de cada commit;
a causa raiz provável (resolução do Prettier via `pnpm`/`pnpm-lock.yaml`
localmente vs. `npm ci`/`package-lock.json` na CI) não foi investigada a
fundo — registrada no `BACKLOG.md` como risco de gate desalinhado.

**Achado 2 — `lib/env.ts` quebra sob Vitest sem placeholder de env.**
`lib/brand/index.ts` importa `lib/env.ts` no escopo do módulo, que valida
(Zod) e lança se `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` estiverem ausentes.
Nenhum dos 18 testes anteriores importava esse caminho; o teste novo de
`lib/brand` (Fase 1) foi o primeiro a tropeçar nisso. Resolvido com
`test.env` em `vitest.config.ts` (mesma lógica de placeholder que a CI já
usa no build) — não uma mudança de comportamento em `lib/env.ts`.

**Achado 3 (reafirma o Achado da Fase 0) — PNGs gerados custam tokens de
visão sem valor de grafo.** No rebuild completo desta fase, o `detect`
achou 18 imagens (ícones, splashes, OG) — 16 são derivados pixel-a-pixel da
mesma logo em tamanhos diferentes. Só `logo.png` e `og-default.png` foram
de fato despachados pra extração semântica; os outros 16 foram
deliberadamente pulados (decisão registrada aqui, não silenciosa) — o
Report da Fase 0 já recomendava exatamente isso.

## Validações

Repetidas a cada fase (9 vezes), sempre com resultado limpo antes do commit:

| Portão | Resultado |
| --- | --- |
| `pnpm lint` | `ESLint: No issues found` em todas as 9 fases |
| `pnpm typecheck` | passou em todas as 9 fases |
| `pnpm test` | 121 → 159 testes (18 novos arquivos de teste), todos passando |
| `pnpm format` (arquivos tocados) | limpo em todas as 9 fases |
| `pnpm build` | `✓ Compiled successfully` em todas as 9 fases |

### Verificação em runtime

Sem acesso a browser automatizado nesta sessão — verificação feita via
`pnpm dev` + `curl` no HTML servido, por fase:

- home e `/checkout` sempre 200;
- `#galeria`/"Nossa Casa" e `#depoimentos`/"Quem já provou, aprova"
  **ausentes** do HTML enquanto `GALLERY_ITEMS`/`TESTIMONIALS` vazios
  (confirma a ADR 0012 na prática, não só na leitura do código);
- "Nossa linha do tempo" ausente do HTML (ADR 0012);
- `/robots.txt` e `/sitemap.xml` respondendo com o conteúdo esperado;
- JSON-LD da home parseado com `JSON.parse` — schema.org `Restaurant`,
  6 dias de `openingHoursSpecification` (segunda ausente, como
  `BUSINESS_HOURS` já define);
- `/login` com `<meta name="robots" content="noindex">` no HTML;
- `pnpm brand:assets` rodado de novo ao final da Fase 1: os 18 arquivos
  saíram idênticos aos já commitados.

**Pendente:** verificação visual real em navegador (responsivo,
hover/parallax/reveals em movimento, lightbox da galeria) — registrada no
`BACKLOG.md`.

## Não entregue (e por quê)

Quase tudo que falta é **material do lojista**, não código — cada item tem
a estrutura pronta esperando o dado real:

- logo horizontal/monocromática/marca d'água (pipeline pronto desde a
  Fase 1);
- vídeo/pôster do Hero (`HERO_MEDIA` vazio);
- fotos da galeria (`GALLERY_ITEMS` vazio);
- depoimentos reais (`TESTIMONIALS` vazio);
- marcos da linha do tempo (`ABOUT_TIMELINE` vazio);
- perfil do TikTok (`TIKTOK_LINK` `null`).

Dependente de código (não desta sprint): Open Graph dinâmico por produto/
promoção (`ImageResponse` + Anton embutida), splash de iOS em paisagem,
service worker/offline, divergência oklch/hex, e o risco de `format:check`
do Achado 1. Todos detalhados em `BACKLOG.md`.

## Definition of Done

| Item | Estado |
| --- | --- |
| Documentação (`docs/frontend.md`) | feito — seção "Sprint 8, Fases 2-9" e atualização de "Navegação da loja" |
| `CHANGELOG.md` | feito |
| `BACKLOG.md` | feito — Sprint 8 reorganizada, itens novos de material e de código |
| Graphify | feito — rebuild completo, 1792 nós / 4570 arestas / 146 comunidades |
| ADR | feito — ADR 0012 |
| Build / Typecheck / Lint / Testes | feito, nas 9 fases |
| Revisão crítica | feita — ver Achados |
| Sprint Report | este documento |
| Commit | feito — 9 commits de código (um por fase) + este de documentação |

### Nota sobre o rebuild do Graphify

Corpus: 391 arquivos, ~224 mil palavras. Cache reaproveitou 267 nós
semânticos de 35 arquivos inalterados; só 7 documentos alterados/novos e
2 imagens (`logo.png`, `og-default.png`) foram despachados pra extração —
as outras 16 imagens geradas (ícones, splashes) foram puladas de propósito
(ver Achado 3). AST: 1531 nós / 4589 arestas em ~298 arquivos de código
(paralelo, 6 workers — sem o problema de zero-nós que a Fase 0 relatou).
Diagnóstico de saúde: 506 arestas com endpoint pendurado (normal em
símbolos externos/imports de biblioteca não extraídos como nó) e ~12-13
arestas colapsadas (paralelas, esperado ao simplificar pra grafo não
dirigido) — sem endpoint faltante, sem self-loop, sem ciclo de import.
