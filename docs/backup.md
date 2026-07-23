# Backup e exportação de dados

> Sprint 5.5, Fase 3. Duas coisas diferentes, frequentemente confundidas:
> **backup do banco** (recuperação de desastre) e **exportação de dados de
> negócio** (uso operacional). Este projeto implementa só a segunda — a
> primeira já é responsabilidade do Supabase.

## Backup do banco — responsabilidade do Supabase

O projeto **não** reimplementa backup/restore de banco dentro da aplicação.
Motivo: o Supabase já oferece isso no nível de infraestrutura, e duplicar
essa capacidade dentro do Next.js seria redundante, arriscado (orquestrar
`pg_dump`/restore a partir de uma função serverless tem limites de tempo de
execução e memória) e pior do que a solução nativa.

**Como verificar/ativar**:

1. No painel do Supabase: `Project Settings` → `Database` → `Backups`.
2. Planos pagos incluem backups diários automáticos; planos com
   Point-in-Time Recovery (PITR) permitem restaurar para qualquer instante
   dentro da janela de retenção contratada.
3. Restauração é feita pelo próprio painel do Supabase (ou suporte, a
   depender do plano) — não há nenhum código deste projeto envolvido nesse
   processo.

Se o plano atual não incluir backups automáticos, isso é uma decisão de
custo/contrato a tomar diretamente com o Supabase, não uma lacuna de
código a fechar aqui.

## Exportação de dados de negócio

O que existe no projeto: um botão em `/admin/configuracoes` ("Exportar
dados") que baixa, em JSON ou CSV:

- **Pedidos** — últimos 30 dias (mesma janela do Dashboard, Sprint 5 Fase
  7), com itens.
- **Produtos** — catálogo completo (publicados ou não).
- **Configuração da loja** — identidade, contato, horário, aparência.
- **Auditoria** — histórico de ações administrativas (Fase 1 desta sprint).

Serve para uso operacional (planilhas, contabilidade, análise externa) —
**não** é um mecanismo de disaster recovery. Se o banco for perdido, a
exportação de um CSV de pedidos não reconstrói o sistema; o backup do
Supabase, sim.

### Como funciona

`services/admin/export.service.ts` reusa as listagens administrativas já
existentes (paginadas, mas chamadas aqui com uma página grande o
suficiente para trazer tudo — `EXPORT_PAGE_SIZE = 10_000`, YAGNI: uma
lanchonete de porte único não vai se aproximar disso). `GET
/api/admin/export?resource=orders|products|settings|audit-logs&format=json|csv`,
guardada por `getAdminApiUser` (só gestão). CSV é gerado por
`lib/export/to-csv.ts` — conversor próprio, sem dependência nova; campos
aninhados (ex. itens de um pedido) viram JSON dentro da célula.

O download em si é um link `<a href=... download>` — o navegador trata o
`Content-Disposition: attachment` da resposta, sem precisar de JavaScript
adicional no client.
