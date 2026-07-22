# ADR 0003 — Estado do Painel da Cozinha: Realtime + reducer híbrido

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 2 (Painel da Cozinha)

## Contexto

O board precisa refletir pedidos de múltiplas origens (mudança de status
feita no próprio painel, e futuramente novos pedidos vindos do checkout) em
tempo real, sem polling nem WebSocket próprio (`CLAUDE.md` exige Supabase
Realtime). Opções consideradas:

1. **Realtime puro:** toda mudança de estado vem só do canal `postgres_changes`;
   ações do próprio painel apenas disparam o `PATCH` e esperam o eco do canal.
2. **Reducer local + Realtime híbrido:** ações do painel aplicam patch
   otimista local; o canal Realtime cobre origens externas e confirma/reverte
   o que o próprio painel iniciou.
3. **TanStack Query com `invalidateQueries` a cada evento Realtime:** refetch
   completo da lista a cada mudança.

## Decisão

Adotar **(2) reducer local + Realtime híbrido**
(`features/kitchen/kitchen-orders-context.tsx` + `use-kitchen-realtime.ts`).

## Justificativa

- **Latência percebida:** (1) faz o usuário esperar o round-trip completo
  (PATCH → Postgres → Realtime → client) para ver o card mover — perceptível
  em uma tela de cozinha sob pressão. O otimismo de (2) move o card
  instantaneamente, revertendo com toast só no caso (raro) de falha.
- **(3) é caro demais para o padrão de mudança aqui:** um board com dezenas
  de pedidos não precisa re-buscar a lista inteira a cada status trocado;
  patch pontual (campo a campo) é suficiente e mais barato.
- **Canal assina só `orders`, não `order_items`:** itens são imutáveis após a
  criação nesta fase (sem edição de pedido) — não há necessidade de
  reconciliar itens via Realtime. Um pedido **desconhecido** localmente (não
  veio do carregamento inicial do servidor) aciona um `GET` pontual do
  detalhe completo (com itens) em vez de assinar uma segunda tabela — mais
  simples que fazer join client-side de eventos de duas tabelas.

## Consequências

- **Duas fontes de verdade para o mesmo estado** (otimista local vs.
  confirmado pelo servidor) exigem disciplina: toda mutação otimista
  (`changeStatus`, `setPriority`) precisa de reversão explícita em caso de
  falha — implementado guardando o snapshot anterior antes do patch.
- **Não usa `useSyncExternalStore`** como as demais assinaturas de API de
  browser do projeto (`use-media-query.ts`, `offline-banner.tsx`): aquele
  hook existe para *sincronizar um valor lido*, não para despachar efeitos
  colaterais assíncronos (fetch, toast, som) a cada evento — o contrato de
  "getSnapshot" precisa ser puro e sem side-effects. `useKitchenRealtime` é
  um `useEffect` de assinatura tradicional por ser um caso genuinamente
  diferente, não uma inconsistência com a convenção.
- **Porta de saída:** se o volume crescer a ponto de exigir reconciliação
  mais sofisticada (ex.: múltiplos operadores editando o mesmo pedido), o
  reducer pode evoluir para incorporar versionamento (`updated_at` como
  vetor de conflito) sem mudar a UI.

## Revisão

Reavaliar se o checkout real (Fase 1/Checkout) introduzir edição de itens
pós-criação — nesse caso, `order_items` também precisará de um canal
Realtime próprio.
