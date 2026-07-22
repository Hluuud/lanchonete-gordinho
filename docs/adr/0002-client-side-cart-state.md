# ADR 0002 — Carrinho como estado client-side (sem persistência)

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 1 (Experiência da Loja)

## Contexto

A Sprint 1 pede um carrinho completo (bottom sheet/drawer, quantidade,
observação, preço em tempo real) como parte da experiência de UX da loja —
mas é explicitamente uma sprint **sem alteração de regra de negócio**, e o
checkout/submissão de pedido é Fase 1 do roadmap (ainda não desenhado: não há
tabela `orders`, não há fluxo de pagamento, não há impressão).

Opções consideradas:

1. **Estado client-side em memória** (React Context + `useReducer`), sem
   persistência.
2. **Persistir em `localStorage`**, sobrevivendo a reloads.
3. **Persistir no Supabase** (tabela `cart_items` por sessão/usuário).

## Decisão

Adotar **(1) estado client-side em memória**, escopado ao layout `(store)`.

## Justificativa

- **Não antecipar o modelo de dados do checkout.** Uma tabela `cart_items`
  desenhada agora, sem o desenho completo de `orders`/pagamento/impressão da
  Fase 1, tende a ficar errada e gerar migration destrutiva depois — o que o
  `CLAUDE.md` proíbe explicitamente.
- **Escopo da sprint é UX, não persistência.** `localStorage` resolveria
  "sobreviver a um reload", mas ainda não é o modelo real de carrinho
  (carrinho por sessão do cliente, possivelmente sincronizado entre
  dispositivos) — decisão que pertence à Fase 1 junto do checkout.
- **YAGNI:** persistir agora é trabalho descartável assim que o checkout
  definir o modelo real.

## Consequências

- **O carrinho zera ao recarregar a página.** Aceitável para esta sprint
  (comunicado via UI: botão "Finalizar pedido" fica desabilitado com a legenda
  "Checkout chega na Fase 1 do roadmap").
- **"Adicionais"/modificadores de produto não existem.** O item do carrinho
  tem apenas quantidade e uma observação em texto livre
  (`features/cart/types.ts`). Modelagem de adicionais é Fase 1/6
  (upsell/combos), quando o schema de `products` ganhar modificadores.
- **Porta de saída clara:** quando a Fase 1 desenhar `orders`/checkout, o
  `CartProvider` (`features/cart/cart-context.tsx`) é o único lugar a trocar —
  a UI (drawer, stepper, cards) não muda.

## Revisão

Reavaliar nesta ordem: (a) ao iniciar o desenho do checkout (Fase 1) — decidir
se o carrinho migra para `localStorage` ou direto para persistência no
Supabase; (b) se o produto exigir "retomar pedido depois" entre dispositivos.
