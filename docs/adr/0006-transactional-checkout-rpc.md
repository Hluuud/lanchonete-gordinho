# ADR 0006 — Persistência do checkout: função Postgres única (`create_order`)

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 3 (Checkout)

## Contexto

Criar um pedido envolve várias operações que precisam ser consistentes: gerar
o número atômico (ADR 0005), inserir o pedido, inserir os itens (com preço
lido do banco, nunca do client), e devolver o pedido completo para a UI.
Além disso, quem cria o pedido é um **convidado** (sem sessão/papel de
staff) — as policies de RLS de `orders`/`order_items` (Sprint 2) são
propositalmente staff-only, então um insert direto do client sempre seria
bloqueado.

Opções consideradas:

1. **Uma função Postgres única (`create_order`), `SECURITY DEFINER`**,
   chamada via RPC — valida, gera o número, insere pedido + itens e
   retorna tudo, numa única chamada de rede.
2. **Múltiplas chamadas do client** (insere pedido → insere itens →
   busca de volta) usando o client **admin** (service role) no servidor
   Next.js para contornar RLS.
3. **Policy de RLS de insert liberada para `anon`**, com toda a validação
   (preço, disponibilidade) feita só no Route Handler antes do insert.

## Decisão

Adotar **(1) função Postgres única, `SECURITY DEFINER`**
(`supabase/migrations/0007_checkout_order_creation_schema.sql`), chamada
por `repositories/orders.repository.ts#createOrder` via
`client.rpc("create_order", ...)`.

## Justificativa

- **Atomicidade de verdade.** Uma função Postgres é uma transação implícita:
  se qualquer validação falhar no meio (produto inválido no segundo item,
  por exemplo), nenhuma escrita anterior daquela chamada persiste — nunca há
  um pedido "órfão" sem itens, nem itens de um pedido que falhou a
  validação. (2) exigiria `BEGIN`/`COMMIT` manual coordenado entre chamadas
  de rede separadas — bem mais frágil.
- **Menos round-trips.** A função já retorna o pedido completo (com itens)
  como `jsonb` — a UI não precisa de uma segunda leitura. Isso também
  evita um problema real: como o criador é um convidado sem papel de staff,
  uma leitura separada de `orders` logo em seguida seria **bloqueada pela
  RLS** (staff-only) — o `jsonb` de retorno contorna isso sem precisar
  enfraquecer a policy de leitura.
- **`SECURITY DEFINER` é mais seguro que (3) aqui.** Com (3), a política de
  insert ficaria permissiva para `anon` na tabela inteira — qualquer
  chamada direta à API REST do Supabase (fora do Route Handler) poderia
  inserir uma linha de pedido com dados arbitrários, já que RLS não
  valida regra de negócio, só quem pode escrever. Com (1), a única forma de
  criar um pedido é através da função, que **é** a validação — não existe
  um caminho de insert direto que a contorne.
- **`SECURITY DEFINER` não é um risco novo neste projeto** — já é o padrão
  usado por `current_profile_tenant()`/`current_profile_role()` desde a
  Fase 0 para o mesmo tipo de problema (dar a uma função um privilégio que a
  role chamadora não tem, de forma controlada). `docs/security.md`
  documenta esse trade-off como aceito.
- **client admin (service role) não foi necessário.** Cogitou-se
  originalmente rotear a escrita do checkout pelo client admin
  (`lib/supabase/admin.ts`) a partir do Next.js — mas isso ampliaria o
  escopo documentado desse client ("apenas operações administrativas de
  backend... seed, jobs, webhooks") para incluir tráfego de usuário comum,
  e exigiria confiar inteiramente no código do Route Handler para a
  validação, em vez de ter o banco como último portão. `SECURITY DEFINER`
  mantém a validação onde ela é mais difícil de contornar: dentro da própria
  função.

## Consequências

- Toda regra de "o que torna um pedido válido" mora dentro de
  `create_order` — se essa regra mudar (ex.: exigir CPF, limite de itens),
  muda ali, não espalhada entre Route Handler/serviço/repositório.
- A função tem uma responsabilidade grande (validar + numerar + inserir
  pedido + inserir itens + montar o retorno) — aceitável dado que é
  exatamente o que precisa ser atômico junto; quebrá-la em funções menores
  reintroduziria a necessidade de coordenar transação entre chamadas.
- `repositories/orders.repository.ts#createOrder` mapeia erros do Postgres
  (`error.code`) para `OrderCreationError` — a função usa `errcode`
  customizados (`P0001`/`P0002`/`P0003`) via `raise exception ... using
  errcode`, e `services/checkout.service.ts` traduz cada um para uma
  mensagem de negócio (`lib/checkout/error-messages.ts`).

## Revisão

Reavaliar se o checkout precisar de um passo de pagamento antes da criação
do pedido (ex.: PIX) — nesse caso, `create_order` provavelmente separa em
"reservar" (sem persistir) e "confirmar" (persistir após pagamento
aprovado), mudança arquitetural relevante o suficiente para um novo ADR.
