# Redesign da Experiência do Cliente — Fase 5: Promoções — Design

- **Data:** 2026-07-25
- **Escopo:** Frontend-only, área do cliente. Última das 5 fases do redesign —
  ver `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`
  para o roadmap completo. Continuação das Fases 1-4 (Sidebar, Home/Hero,
  Sobre Nós/Contato/Footer, Cardápio Premium), já implementadas e revisadas
  em `dev`.
- **Fora de escopo (não alterar):** banco, Supabase, `services/`,
  `repositories/`, checkout, carrinho (lógica), realtime, painel
  administrativo, painel da cozinha, impressão, QR Code.

## Objetivo

Adicionar uma faixa de destaque para promoções entre a Home e o Cardápio,
sem inventar oferta específica e sem tocar a camada de dados.

## Contexto e restrições confirmadas com o usuário

- `promo_banner_url` existe na tabela `tenants` e é mapeado em
  `AdminStoreSettings` (`services/admin/store-settings.service.ts`), mas o
  `Tenant` público (vitrine) é deliberadamente minimalista e não expõe esse
  campo — mesma categoria de restrição já confirmada nas Fases 1 e 4.
  **Decisão confirmada: não liberar essa exceção nesta fase.** Registrado
  no BACKLOG.
- Sem lib de carrossel instalada (`package.json` não tem `embla-carousel`,
  `swiper`, `slick`, `keen-slider` ou similar). **Decisão confirmada:
  banner único estático**, sem slides/autoplay/indicadores — evita
  dependência nova e evita múltiplos placeholders de promoção inventada.
- **Posição no fluxo de scroll:** entre `<StoreHero/>` (`#home`) e o
  `<div id="cardapio">` existente, na coluna direita de
  `store-experience.tsx`.
- **Sem item de navegação próprio**: não entra em `store-sidebar.tsx`/
  `store-mobile-nav.tsx`, nem no array de ids do `useScrollSpy`. Por estar
  logo no topo do scroll (entre Home e Cardápio), o usuário já vê o banner
  ao entrar na página ou ao clicar "Home" — dispensa atalho dedicado e evita
  ambiguidade de "seção ativa" disputando com Home.
- **Conteúdo:** rascunho genérico e claramente editável, sem prometer
  desconto/oferta que não existe — mesmo tratamento já dado ao texto do
  Hero (Fase 2) e Sobre Nós (Fase 3), a trocar pelo texto definitivo quando
  o lojista tiver uma promoção real.
- **Estilo visual:** faixa full-width (não um card contido no container
  `max-w-6xl` das demais seções) — reforça que é um anúncio, visualmente
  distinto das seções institucionais.

## Decisões de design

1. **Novo componente** `features/menu/components/store-promo-banner.tsx`
   (client component — precisa de `onClick` para `scrollToSection`):
   - `<section id="promocoes">` full-width, gradiente laranja/preto
     (mesma paleta do Hero, consistente com ADR 0007 — módulo `:root` =
     store/laranja).
   - Ícone `Sparkles` (`lucide-react`, já confirmado exportado) centralizado.
   - Título: "Fique de olho nas nossas promoções".
   - Subtítulo: "Sempre tem novidade por aqui — dá uma olhada no cardápio
     e aproveite."
   - Botão "Ver Cardápio" → `scrollToSection("cardapio")` (mesmo padrão
     do CTA equivalente no Hero).
   - `id="promocoes"` mantido como âncora semântica (não usado por nenhuma
     nav nem pelo `useScrollSpy` nesta fase — só para eventual link futuro).
2. **`store-experience.tsx`**: importar `StorePromoBanner` e renderizar
   `<StorePromoBanner />` entre `<StoreHero />` e o
   `<div id="cardapio" className="mx-auto w-full max-w-6xl px-4 py-4 pb-24">`
   existente.
3. **Sem alteração em `store-sidebar.tsx`/`store-mobile-nav.tsx`** — única
   fase do roadmap que não retoca esses dois arquivos (decisão explícita:
   sem nav própria).

## Arquivos (detalhe de implementação)

- `features/menu/components/store-promo-banner.tsx` — novo componente.
- `features/menu/components/store-experience.tsx` — 1 import + 1 linha de
  renderização entre `StoreHero` e o `div#cardapio`.

## Testes / validação

Componente novo, mas sem lógica nova (só JSX/CSS + 1 `onClick` que chama
`scrollToSection`, já testado indiretamente por uso equivalente no Hero).
Sem teste unitário novo — mesma convenção das fases anteriores (Vitest só
cobre lógica pura). Validação: build/typecheck/lint/`npm test` (regressão)
+ fetch de HTML real do dev server confirmando a faixa, o texto e o botão
(mesmo padrão de verificação das Fases 1-4 — interação real em navegador
segue indisponível nesta sessão).

## Riscos / limitações conhecidas

- Mesma limitação de verificação visual em navegador já registrada nas
  Fases 1-4.
- Conteúdo de promoção fica registrado no BACKLOG como rascunho a trocar
  pelo texto/oferta real do lojista.
- `promoBannerUrl` real (admin) fica registrado no BACKLOG como pendente
  de uma fase que autorize tocar `services`/`repositories`/schema público.
