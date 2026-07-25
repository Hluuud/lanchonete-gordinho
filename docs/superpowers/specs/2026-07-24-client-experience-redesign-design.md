# Redesign da Experiência do Cliente — Design

- **Data:** 2026-07-24
- **Escopo:** Frontend-only, área do cliente (`app/(store)/`, `features/menu/`, `features/search/`, `features/cart/` visual).
- **Fora de escopo (não alterar):** banco, Supabase, `services/`, `repositories/`, checkout, carrinho (lógica), realtime, painel administrativo, painel da cozinha, impressão, QR Code.

## Objetivo

Transformar o cardápio digital atual (funcional, mas genérico) numa experiência que
transmita "hamburgueria de respeito": acolhedora, moderna, convidativa — sem
copiar layout de referências (New Dog, Consumer, Goomer, McDonald's
autoatendimento, BK, Outback, Madero), só UX.

## Contexto levantado

- Arquitetura atual é **single-page com scroll**: `app/(store)/page.tsx` →
  `StoreExperience` monta `StoreSidebar` (300px fixa desktop) + `StoreTopbar` +
  seções de produto. Scroll-spy já existe (`useScrollSpy`,
  `scrollToSection`, `sectionAnchorId`) e funciona bem — é reaproveitado, não
  recriado.
- Seções de produto vêm de `buildStoreSections()`
  (`features/menu/virtual-sections.ts`): virtuais (Destaques/Novidades,
  derivadas de badges reais) + categorias reais do banco. Comentário no
  código já é explícito: nunca inventar dado.
- `ProductCard` já é sólido (hover lift, sombra, badges, placeholder
  gradiente quando sem imagem) — fase Cardápio é polimento, não reescrita.
- Mobile já tem `StoreMobileNav` (Drawer/vaul) reaproveitável.
- Logo real (`public/brand/logo.png`) é laranja, sem mascote ilustrado. ADR
  0007 já fixa a paleta da loja como "laranja da logo" via classes de escopo
  de tokens (`:root`) — não será reaberta nesta sprint.
- `types/domain.ts` `Tenant` (público) só tem `id/slug/name`.
  `findTenantBySlug` (repository, usado pelo cardápio público) só faz
  `select("id, slug, name")`. Os campos reais de contato/redes/banners
  (`phone`, `whatsapp`, `instagram`, `facebook`, `address`, `banner_url`,
  `promo_banner_url`, `business_hours`, ...) existem no schema e no
  `TenantSettingsRow` (admin), mas **não** são buscados pelo caminho
  público — buscá-los exigiria alterar `repositories/tenant.repository.ts`
  e `services/menu.service.ts`, vetado nesta sprint ("Services"/
  "Repositories" explicitamente fora de escopo).
- Precedente já existente para esse exato problema: `BUSINESS_HOURS` em
  `features/menu/store-info.ts` é uma constante frontend com o horário real,
  com comentário assumindo que "quando existir tabela, só a fonte muda".
  Mesma solução se aplica aqui.
- Dados reais de contato (fornecidos pelo usuário em 2026-07-24):
  - Endereço: Calçadão Ricardo Gregório, 548, Analândia - SP
  - Telefone/WhatsApp: (19) 99727-3897
  - Horário: terça a domingo, 13:00–00:00 (segunda fechado)
  - E-mail: edvaldolanchonete@hotmail.com
  - CNPJ: 09.068.710/0001-28

## Decisões

1. **Paleta:** mantém `--primary` laranja (logo real + ADR 0007). Vermelho
   entra só como acento pontual (tags/CTAs de urgência), quando a fase
   Cardápio precisar — não redefine os tokens de tema agora (YAGNI).
2. **Assets faltando (vídeo do hero, fotos institucionais, mascote
   ilustrado):** placeholder elegante pronto para receber asset real
   (local ou CDN) — não bloqueia a sprint esperando fotos.
3. **Combos:** fora de escopo — sem schema no banco (Sprint 6 futura).
   Registrado no `BACKLOG.md`, não aparece na navegação.
4. **Mais Vendidos:** dado real existe (`is_bestseller` no banco), mas não
   chega ao tipo `Product` público (`toProduct` em `services/menu.service.ts`
   não mapeia esse campo; `ProductBadges` só tem `isFeatured`/`isNew`).
   Expor exigiria tocar `services/menu.service.ts` e `types/domain.ts` —
   mesma categoria de exceção vetada nesta sprint. Fica **bloqueada** até
   uma fase que reabra essa exceção (mesma decisão da Promoções, item 5);
   registrada no `BACKLOG.md`, não implementada na Fase 5 do roadmap
   abaixo a menos que autorizado explicitamente.
5. **Promoções:** banner-only, pronto para receber imagem — **não** busca
   `promo_banner_url` do banco nesta sprint (exigiria mudança em
   repository/service, vetada). Fica como placeholder configurável até uma
   fase que reabra essa exceção, se o usuário autorizar.
6. **TikTok:** sem campo no banco — ícone omitido (não mostra link
   quebrado/fake). Vira item de backlog.
7. **Contato real (endereço/telefone/whatsapp/horário):** vira constante
   frontend em `features/menu/contact-info.ts`, mesmo padrão de
   `BUSINESS_HOURS` — sem alterar repository/service.
8. **Navegação incremental, sem link morto:** a Sidebar só recebe um item
   de nível de página quando a seção-alvo já existe no DOM. Fase 1 mantém
   a lista de categorias atual (não é removida) e adiciona só o CTA
   "Peça Agora" (rola para `#cardapio`, âncora já existente). Itens Home /
   Promoções / Mais Vendidos / Sobre Nós / Contato entram cada um na fase
   que constrói sua seção.

## Roadmap (fases, cada uma com commit + build/typecheck/lint/test própria)

1. **Sidebar + Fundamentos** *(esta spec detalha esta fase)*
2. **Home / Hero** — seção topo com hero (vídeo/placeholder), adiciona item
   "Home" à navegação.
3. **Sobre Nós + Contato + Footer** — institucional, mapa, dados reais de
   contato; adiciona itens "Sobre Nós"/"Contato".
4. **Cardápio premium** — polimento dos cards (tags Artesanal/Promoção,
   agrupamento da lista de categorias sob um item "Cardápio" explícito na
   nav).
5. **Promoções (banner)** — placeholder configurável (sem puxar
   `promo_banner_url` real, ver decisão 5). "Mais Vendidos" fica de fora do
   roadmap ativo (decisão 4) até o usuário autorizar tocar
   `services`/`repositories` numa fase dedicada.

Cada fase é seu próprio ciclo brainstorm → plano → implementação
(design incremental — não se escreve o detalhamento de uma fase futura
antes da anterior estar concluída e validada).

## Fase 1 — Sidebar + Fundamentos (detalhe de implementação)

### Arquivos novos

- `features/menu/contact-info.ts`: constantes `ADDRESS`, `PHONE_DISPLAY`,
  `PHONE_TEL_LINK`, `WHATSAPP_LINK` (`wa.me/55...`), `INSTAGRAM_HANDLE`,
  `INSTAGRAM_LINK`, `FACEBOOK_LINK`, `EMAIL`, `CNPJ`, `MAPS_LINK` (Google
  Maps a partir do endereço). Mesmo estilo de comentário de
  `store-info.ts` (dado real mantido no client até existir wiring de
  settings; backlog rastreia a pendência).

### Arquivos alterados

- `features/menu/store-info.ts`: `BUSINESS_HOURS` corrigido para os
  valores reais (terça a domingo 13:00–00:00, segunda `null`).
- `features/menu/components/store-sidebar.tsx`:
  - Cabeçalho: `BrandLogo` maior + nome do tenant + linha de slogan (texto
    editável, ex. "Sabor que aquece, feito com carinho").
  - Botão **Peça Agora** (CTA primário cheio) logo abaixo do cabeçalho —
    `scrollToSection("cardapio")` (id já existe em
    `store-experience.tsx`).
  - Lista de categorias: comportamento e lógica idênticos aos atuais
    (`useScrollSpy`, `CategoryIcon`, contagem) — só ajuste visual de
    espaçamento/tipografia se necessário.
  - Rodapé novo: ícones lucide-react para WhatsApp/Instagram/Facebook
    (links reais de `contact-info.ts`), telefone (`tel:`), endereço com
    link "Como chegar" (`MAPS_LINK`), status de horário
    (`getStoreOpenState` já existe em `store-info.ts`).
- `features/menu/components/store-mobile-nav.tsx`: mesmo bloco de rodapé
  social adicionado ao final do Drawer.

### Não alterado

`services/`, `repositories/`, schema, checkout, carrinho (lógica),
realtime, admin, cozinha, impressão, QR Code, `ProductCard`,
`buildStoreSections`, `useScrollSpy`, `scrollToSection`.

### Testes / validação

Sem lógica nova testável isoladamente (é composição visual + constantes
estáticas) — cobertura existente (`use-scroll-spy`, `virtual-sections`)
continua validando o que já valida. Validação desta fase: `npm run build`,
typecheck, lint, `npm test`, revisão visual manual (dev server).

### Riscos / limitações conhecidas

- Slogan e link do Maps são texto/URL escolhidos por mim nesta fase — fácil
  de editar depois, não é dado de negócio sensível.
- Se o usuário trocar telefone/endereço/redes no futuro, precisa editar
  `contact-info.ts` manualmente (mesma limitação já aceita para
  `BUSINESS_HOURS`) até uma fase que autorize tocar repository/service.
