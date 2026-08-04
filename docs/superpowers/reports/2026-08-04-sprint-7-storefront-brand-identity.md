# Sprint Report — Sprint 7: Identidade Visual da Área do Cliente

- **Data:** 2026-08-04
- **Escopo:** exclusivamente frontend da loja (`app/(store)`, `features/menu`,
  `features/search`, design tokens), mais três colunas no `SELECT` público do
  cardápio.
- **Fora de escopo (intocado):** migrations, Supabase Auth, checkout,
  carrinho, realtime, admin, cozinha, impressão, QR Code.

## Contexto

A Sprint 6 entregou a **estrutura** da experiência do cliente: sidebar com
CTA e contatos, drawer mobile, scroll-spy, hero com botões, banner de
promoção, seções de cardápio, Sobre, Contato e rodapé. O que faltava era a
**identidade**: a loja ainda usava o laranja sobre branco herdado da Sprint 4,
tipografia neutra, hero com gradiente no lugar da comida, e três itens de
navegação pedidos pelo lojista (Promoções, Combos, Mais Vendidos) que não
existiam porque os dados não chegavam ao domínio público.

Esta sprint aplicou a identidade dos mockups aprovados
(`referencias/Referencia_1.png`, `Referencia_2.png`) sobre a estrutura pronta.

## Decisões travadas com o usuário antes da implementação

| Tema | Decisão |
|---|---|
| Paleta | Preto/creme dominante, vermelho pontual. Laranja da logo vira acento. |
| Sidebar | Escura (Referencia_1), item ativo em vermelho sólido. |
| Dados | Mapeamento read-only autorizado em repository/service, sem migration. |
| Combos | Vitrine visual, sem tocar carrinho/checkout. |

## O que foi entregue, por fase

**Fase 0 — Fundação visual** (`c60f8a3`). Bloco `:root` repintado;
`--primary` vermelho com texto branco, `--background` creme, `--accent`
laranja da logo, `--destructive` separado da primária por luminosidade e
saturação. Quatro tokens `--surface-dark*` declarados uma vez para os três
escopos. Fonte de display Anton via `next/font/google`. ADR 0010.
`.dark` e `.theme-admin` inalterados — o mecanismo da ADR 0007 continua
válido.

**Fase 1 — Navegação data-driven e sidebar escura** (`35a9c4e`). Os itens de
navegação eram blocos `<li>` escritos à mão na sidebar e repetidos no drawer,
cada um com a mesma string de classes de estado. Agora `STORE_NAV_ITEMS` é a
fonte única e `StoreNavLink` concentra as regras. `SocialLink` eliminou a
`SOCIAL_LINK_CLASS` duplicada; `WhatsAppIcon` substituiu o `MessageCircle`
genérico.

**Fase 2 — Dados que faltavam** (`d44fe91`). `promo_price_cents`,
`is_bestseller` e `tags` entraram no `SELECT` público — mesma query, mesmo
número de round-trips. `selectBestsellers` devolve `isFallback` para a UI
saber quando está mostrando destaques no lugar de campeões de venda.

**Fase 3 — Hero** (`d2b8f12`). `HeroMedia` cobre vídeo em autoplay mudo,
pôster e placeholder, respeitando `prefers-reduced-motion`. As URLs vivem em
`features/menu/media.ts` (hoje nulas): quando o material real existir, muda
uma linha. Faixa de três promessas abaixo do hero.

**Fase 4 — Cardápio** (`fce0e61`). Descrição por categoria, cabeçalho em
fonte de display, card com badge de mais vendido, rótulos do lojista, tempo
de preparo sobre a foto e hover com elevação/anel/zoom. Busca passou a
considerar os rótulos; filtro ganhou o chip "Mais vendidos".

**Fase 5 — Seções novas** (`ea95ebc`). `#promocoes`, `#combos` e
`#mais-vendidos` fecharam os sete itens de navegação, na mesma ordem em que
aparecem na página.

**Fase 6 — Institucional e responsivo** (`2cf46b9`). Sobre e Contato com
régua vermelha e título em display; rodapé sobre o preto da marca com links
vindos de `STORE_NAV_ITEMS`; área segura do iOS movida para o elemento que de
fato encosta na borda; skeleton alinhado ao novo shell.

## Dois achados que mudaram o plano

Ambos foram descobertos lendo o código durante a implementação, não estavam
no plano aprovado, e ambos são a mesma classe de problema: **a UI ia
prometer algo que o backend não cumpre.**

**1. Preço promocional cobraria o valor cheio.** A função `create_order`
(migration 0009) calcula `unit_price_cents` a partir de
`products.price_cents` e ignora `promo_price_cents`. Exibir "de R$25 por
R$19,90" cobraria R$25 no checkout. Corrigir exige migration, que está fora
do escopo. **Decisão:** o mapeamento da Fase 2 permanece (é correto e sem
custo), mas nada de preço promocional chega à tela; há um aviso explícito em
`features/menu/virtual-sections.ts` e a dependência está no BACKLOG. A seção
`#promocoes` convida ao WhatsApp em vez de anunciar desconto.

**2. Combos não podem ser lidos do banco.** A RLS de `combos` é staff-only
(migration 0017) e o checkout não monta combo em `order_items`. Inventar
nomes e preços de combos seria a mesma mentira do item anterior.
**Decisão:** a seção monta sugestões com produtos que existem de verdade no
cardápio (`combo-suggestions.ts`), soma o preço real dos itens, não promete
desconto nenhum, e o botão adiciona tudo ao carrinho já existente.

## Novos módulos e componentes

| Arquivo | Papel |
|---|---|
| `features/menu/nav.ts` | Fonte única da navegação da loja |
| `features/menu/media.ts` | URLs do vídeo/pôster do hero |
| `features/menu/category-content.ts` | Descrição por categoria |
| `features/menu/combo-suggestions.ts` | Combos derivados do cardápio real |
| `features/menu/components/store-nav-link.tsx` | Item de navegação (dark/light) |
| `features/menu/components/social-link.tsx` | Botão de rede social |
| `features/menu/components/hero-media.tsx` | Vídeo/pôster/placeholder do hero |
| `features/menu/components/store-value-props.tsx` | Faixa de promessas |
| `features/menu/components/store-combos.tsx` | Seção `#combos` |
| `features/menu/components/store-bestsellers.tsx` | Seção `#mais-vendidos` |
| `docs/adr/0010-storefront-brand-identity.md` | Decisão de paleta/tipografia |

## Impacto em performance

- **Zero dependências novas.** Carrossel, animação e drawer continuam usando
  o que já estava instalado.
- **Zero chamadas novas ao Supabase.** As três colunas entraram na query que
  já existia. Combos e mais vendidos derivam do `Menu` já carregado, em
  `useMemo`.
- **Uma requisição de fonte a mais** (Anton, peso único, self-hosted pelo
  `next/font` com `display: swap`).
- Imagens dos cards explicitamente `loading="lazy"`; o vídeo do hero usa
  `preload="metadata"` e cai no pôster com `prefers-reduced-motion`.
- Skeleton atualizado para o shell novo, para não reintroduzir layout shift.

## Testes

121 testes em 18 arquivos, todos passando. Novos: `nav.test.ts`,
`category-content.test.ts`, `combo-suggestions.test.ts`, mais a extensão de
`virtual-sections.test.ts` (promoções, campeões de venda e fallback).

Continuam sendo testes de lógica pura: o projeto não tem jsdom nem Testing
Library, e introduzi-los é uma decisão de infraestrutura própria, registrada
no BACKLOG.

## Definition of Done

| Item | Estado |
|---|---|
| Documentação (`docs/frontend.md`) | ✅ |
| CHANGELOG | ✅ |
| BACKLOG | ✅ |
| Graphify | ✅ |
| ADR (0010) | ✅ |
| Build | ✅ `next build` |
| Typecheck | ✅ `tsc --noEmit` |
| Lint | ✅ `eslint` |
| Testes | ✅ 121/121 |
| Revisão crítica | ✅ (os dois achados acima) |
| Sprint Report | ✅ este documento |
| Commits Conventional Commits | ✅ oito commits, um por fase |
| Verificação em runtime (HTML servido) | ✅ |
| **Conferência visual em navegador** | ⚠️ **parcial** |

### Sobre a verificação em runtime

Durante a maior parte da sprint o projeto Supabase esteve fora do ar
(`ENOTFOUND`, depois 521 do Cloudflare), o que derrubava o Server Component
do cardápio e deixava a loja no skeleton. Com o projeto de volta, a
verificação do HTML servido passou:

- `/` 200 com as nove seções ancoradas (`destaques`, `novidades`, `lanches`,
  `porcoes`, `bebidas`, `sobremesas`, `promocoes`, `combos`,
  `mais-vendidos`).
- Os sete rótulos de navegação aparecem na sidebar e no rodapé, vindos da
  mesma fonte.
- Os combos renderizam com produtos reais do cardápio, o que só acontece se
  a consulta ao banco funcionou.
- `#mais-vendidos` está no rótulo de fallback ("Os queridinhos da casa"),
  confirmando que nenhum produto tem `is_bestseller` marcado ainda.
- `/checkout` 200, `/api/menu` 200, `/cozinha` e `/admin` 307 (guarda de
  autenticação intacta).

O que **não** dá para verificar por HTTP e continua pendente: comportamento
responsivo real (desktop/tablet/mobile), hover e micro-interações,
`prefers-reduced-motion`, e o fluxo de carrinho → checkout clicado de ponta
a ponta. Registrado no BACKLOG.

## Próximos passos sugeridos

1. Conferir a loja em navegador assim que o Supabase estiver acessível.
2. Migration para `create_order` honrar `promo_price_cents` — destrava
   promoções de verdade na vitrine.
3. Preencher `HERO_VIDEO_URL`/`HERO_POSTER_URL` e as fotos da seção Sobre.
4. Policy pública de leitura de combos + suporte a combo no checkout.
