# ADR 0001 — Multi-tenancy por schema compartilhado + RLS

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Fase 0 (Fundação)

## Contexto

O produto começa com um restaurante (Lanchonete do Gordinho), mas o objetivo é
uma plataforma SaaS para dezenas/centenas de restaurantes. Precisamos de uma
estratégia de multi-tenancy que sirva a um único cliente hoje e escale sem
migration destrutiva depois.

Opções consideradas:

1. **Schema compartilhado + `tenant_id` + RLS** (uma base, uma tabela por
   entidade, isolamento por linha).
2. **Schema por tenant** (um schema Postgres por restaurante).
3. **Banco por tenant** (uma instância/base por restaurante).

## Decisão

Adotar **(1) schema compartilhado com `tenant_id` em toda tabela de domínio,
isolado por Row Level Security**.

## Justificativa

- **Simplicidade operacional:** uma base, uma pilha de migrations, um deploy.
  (2) e (3) multiplicam custo de manutenção e provisionamento por tenant.
- **Alinhamento com Supabase:** RLS + `auth.uid()` é o caminho idiomático; Auth,
  Realtime e PostgREST respeitam as policies automaticamente.
- **Escala do domínio:** milhares de restaurantes cabem confortavelmente em
  linhas com `tenant_id` indexado; não há isolamento físico exigido por
  regulação neste produto.
- **Evolução barata:** provisionar um novo tenant é um `insert` em `tenants`.

## Consequências

- **RLS é crítica.** Um bug de policy é um vazamento entre tenants. Mitigações:
  policies revisadas, verificação com role `anon`, `get_advisors` no fluxo, FK
  composta `(id, tenant_id)` garantindo consistência de tenant entre tabelas
  relacionadas.
- **`tenant_id` onipresente.** Toda tabela de domínio nova nasce com `tenant_id`
  e policies. Resolução de tenant centralizada em `lib/tenant/get-tenant-context`.
- **Porta de saída:** se um cliente enterprise exigir isolamento físico, dá para
  promover aquele tenant a banco dedicado sem reescrever o modelo (mesmo schema).

## Revisão

Reavaliar se surgir requisito de isolamento físico/regulatório, ou se o volume
de um único tenant exigir particionamento.
