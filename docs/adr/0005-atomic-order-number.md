# ADR 0005 — Número do pedido: contador atômico, não `MAX()+1`

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 3 (Checkout)

## Contexto

A Sprint 2 introduziu a "senha" do pedido (`order_number`) via trigger
`assign_order_number`, calculada como
`select coalesce(max(order_number), 0) + 1 ... where tenant_id = ... and created_at::date = ...`.
Isso foi registrado explicitamente como dívida técnica no `BACKLOG.md`: sob
concorrência real (dois caixas/clientes inserindo pedidos ao mesmo tempo), há
uma janela de corrida entre o `select` e o `insert` — dois pedidos podem
computar o mesmo `MAX()+1` antes que qualquer um dos dois exista, gerando
números duplicados. O prompt desta sprint pede explicitamente para eliminar
essa dívida por completo, nunca usar `MAX()+1`, nunca gerar no frontend.

Opções consideradas:

1. **Tabela de contador dedicada (`order_counters`) + `insert ... on
   conflict do update ... increment`** — atômico por natureza (o
   `ON CONFLICT DO UPDATE` do Postgres serializa via lock de linha).
2. **`sequence` do Postgres nativa** (`create sequence`) — atômica, mas uma
   sequence é global por natureza; simular "por tenant, reiniciando por
   dia" exigiria uma sequence por tenant/dia (criada dinamicamente) ou o
   mesmo padrão de tabela de contador por baixo dos panos de qualquer forma.
3. **Lock explícito (`select ... for update`) na última linha do tenant/dia**
   — funciona, mas é mais verboso que um upsert e ainda exige uma tabela
   para ancorar o lock.

## Decisão

Adotar **(1) tabela `order_counters` (`tenant_id`, `counter_date`,
`last_number`) com upsert atômico**, dentro da própria função
`create_order` (ver ADR 0006):

```sql
insert into public.order_counters (tenant_id, counter_date, last_number)
values (p_tenant_id, current_date, 1)
on conflict (tenant_id, counter_date)
do update set last_number = public.order_counters.last_number + 1
returning last_number into v_order_number;
```

## Justificativa

- **Atomicidade real, não apenas "raramente falha".** O `ON CONFLICT DO
  UPDATE` do Postgres readquire um lock de linha antes de aplicar o
  incremento — duas transações concorrentes serializam nessa linha, uma
  espera a outra. Não há janela entre "ler o máximo" e "escrever o próximo"
  porque não existe uma leitura separada: o incremento é a própria operação
  atômica.
- **Simplicidade sobre (2)/(3).** Uma sequence nativa por tenant/dia exigiria
  criá-la e destruí-la dinamicamente (DDL em runtime, indesejável) ou manter
  uma tabela de mapeamento de qualquer forma — no fim, (1) já é o desenho
  mais simples que atende ao requisito "por tenant, reinicia por dia".
- **Nunca no frontend, nunca `MAX()+1`:** o número só existe depois que
  `create_order` roda no banco — não há como o client sequer tentar
  calculá-lo ou enviá-lo.

## Consequências

- `order_number` na tabela `orders` passa a ser `not null` sem trigger
  associada — é responsabilidade de quem insere (hoje, só `create_order`)
  fornecê-lo. Nenhum outro caminho de escrita em `orders` deveria inserir
  sem passar por essa função.
- **Seed precisa fornecer `order_number` explicitamente** (não há mais
  trigger para isso) e sincronizar `order_counters` com o maior número
  usado, para que o próximo `create_order` real continue a sequência sem
  colidir — ver `supabase/seed.sql`. Isso foi um retrabalho direto desta
  sprint: o seed da Sprint 2 quebrou com a remoção da trigger e precisou ser
  atualizado.
- `order_counters` não tem nenhuma policy de RLS (só a função
  `SECURITY DEFINER` a toca) — não é uma tabela consultável pela aplicação
  em nenhum outro lugar.

## Revisão

Reavaliar se o volume de pedidos por tenant/dia crescer a ponto de a
contenção na linha do contador virar gargalo perceptível (não é esperado
para o volume de uma lanchonete/SaaS nesta fase).
