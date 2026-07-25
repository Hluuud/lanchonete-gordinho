# Redesign da Experiência do Cliente — Fase 4: Cardápio Premium — Design

- **Data:** 2026-07-25
- **Escopo:** Frontend-only, área do cliente. Continuação das Fases 1-3
  (Sidebar, Home/Hero, Sobre Nós/Contato/Footer), já implementadas e
  revisadas em `dev` — ver
  `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`
  para o roadmap completo.
- **Fora de escopo (não alterar):** banco, Supabase, `services/`,
  `repositories/`, checkout, carrinho (lógica), realtime, painel
  administrativo, painel da cozinha, impressão, QR Code.

## Objetivo

Dar ao cardápio uma sensação mais premium/catálogo, e adicionar um
cabeçalho "Cardápio" na navegação acima da lista de categorias — sem
inventar dado que o schema público não tem.

## Contexto e restrições confirmadas com o usuário

O pedido original da sprint pedia tags "Mais Vendido"/"Promoção" nos
cards, descrição+imagem por categoria, e uma tag "Artesanal". Nenhum
desses é viável sem tocar `services`/`repositories`/schema:

- `is_bestseller` e `promo_price_cents` existem no banco, mas só chegam
  ao tipo `Product` **admin** (`AdminProduct`, não usado pelo storefront
  público) — `toProduct()` em `services/menu.service.ts` (público) não os
  mapeia. Expor exigiria tocar esse service + `types/domain.ts`.
  **Decisão confirmada: não liberar essa exceção nesta fase** — mesma
  categoria de restrição já aplicada na Fase 1. Registrado no BACKLOG.
- `MenuCategory` (tipo público) só tem `id/name/slug/products` — sem
  `description`/`imageUrl`. **Decisão confirmada: manter cabeçalho de
  categoria só com ícone+título+contagem** (como já é), sem inventar
  texto/imagem por categoria.
- "Artesanal" não tem sinal por produto no schema (diferente de
  `isFeatured`/`isNew`, que são flags reais). **Decisão confirmada:
  remover dos cards** — não vira badge repetido em todo produto.

Com essas restrições, o escopo real da fase é: polimento visual do
`ProductCard`/`MenuSection` existentes + um cabeçalho "Cardápio" na nav.

## Decisões de design

1. **`ProductCard`** (`features/menu/components/product-card.tsx`):
   - Imagem: `aspect-5/4` → `aspect-4/3` (mais alta, sensação de catálogo).
   - Hover: adiciona `hover:scale-[1.01]` ao `-translate-y-1`/`shadow-xl`
     já existentes — leve "levantada" 3D em vez de só sombra/translação.
   - Badges (Destaque/Novidade) continuam exatamente como estão — já são
     dado real, não fazem parte desta mudança.
2. **`MenuSection`** (`features/menu/components/menu-section.tsx`):
   - Ícone da categoria: `size-10`/`rounded-xl` → `size-12`/`rounded-2xl`,
     ícone interno `size-5` → `size-6`.
   - Título: `text-xl font-bold` → `text-2xl font-black` (`sm:text-2xl` →
     `sm:text-3xl`).
   - Adiciona `border-b pb-4` ao cabeçalho (separador visual sutil entre
     categorias), `mb-5` → `mb-6`.
3. **Nav "Cardápio"**: novo item de nav estático — ícone `UtensilsCrossed`
   + rótulo "Cardápio" — inserido entre "Contato" e a lista dinâmica de
   categorias, em `StoreSidebar` e `StoreMobileNav`. Visualmente menor/
   mais discreto que os outros itens (texto pequeno, uppercase,
   `text-muted-foreground`) — sinaliza que é um cabeçalho de grupo, não
   mais um item de mesmo peso que Home/Sobre Nós/Contato. Clique rola até
   `#cardapio` (mesmo destino do CTA "Peça Agora"). Sem lógica de
   destaque/`aria-current` própria — as categorias abaixo dele já mostram
   seu próprio estado ativo, evitando complexidade desnecessária (YAGNI).

## Arquivos (detalhe de implementação)

- `features/menu/components/product-card.tsx` — 2 alterações de classe
  (aspect ratio + hover scale).
- `features/menu/components/menu-section.tsx` — alterações de classe no
  cabeçalho da seção.
- `features/menu/components/store-sidebar.tsx` — novo `<li>` "Cardápio"
  entre "Contato" e `sections.map(...)`, import de `UtensilsCrossed`.
- `features/menu/components/store-mobile-nav.tsx` — novo `<li>`/`<button>`
  "Cardápio" com handler próprio (`goToCardapio`, chama
  `scrollToSection("cardapio")` direto — sem prefixo `sectionAnchorId`,
  igual ao padrão já usado por `goToHome`/`goToSobre`/`goToContato`),
  import de `UtensilsCrossed`.

## Testes / validação

Puramente CSS/JSX — sem lógica nova. Validação: build/typecheck/lint/
`npm test` (regressão, nenhum teste toca esses arquivos) + fetch de HTML
real do dev server confirmando as classes/textos mudados (mesmo padrão
das fases anteriores — verificação de interação real em navegador segue
indisponível nesta sessão).

## Riscos / limitações conhecidas

- Mesma limitação de verificação visual em navegador já registrada nas
  Fases 1-3.
- Mais Vendido/Promoção/descrição de categoria/Artesanal ficam
  registrados no BACKLOG como pendentes de uma fase que autorize tocar
  `services`/`repositories`/schema.
