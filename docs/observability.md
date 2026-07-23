# Observabilidade

> Sprint 5.5, Fase 0. Complementa `docs/security.md` (autenticação/RLS) —
> aqui é sobre **diagnosticar** o sistema em produção, não autorizar acesso.

## Logs estruturados

`lib/observability/logger.ts` substitui `console.*` avulso em todo o
projeto. No servidor, cada chamada imprime **uma linha JSON**:

```json
{"level":"error","message":"Erro não tratado em rota de API","timestamp":"...","error":{"name":"...","message":"...","stack":"..."},"requestId":"..."}
```

A Vercel indexa `stdout`/`stderr` como logs estruturados automaticamente
quando a linha é JSON válido — não precisa de nenhum agente/coletor
adicional. No browser (`typeof window !== "undefined"`), o mesmo `logger`
imprime de forma legível no DevTools em vez de uma linha JSON crua.

Convenção de uso:

- `logger.info`/`logger.warn`: eventos normais que valem registro (não
  usado extensivamente ainda — introduzir conforme a necessidade real
  aparecer, não preventivamente).
- `logger.error`: **sempre** para algo que não deveria ter acontecido —
  automaticamente encaminha para o Sentry (`Sentry.captureException` se
  `context.error` for um `Error`, `Sentry.captureMessage` caso contrário).

Nas rotas de API (`app/api/**/route.ts`), o padrão established é: erros de
domínio reconhecidos (`instanceof AlgumErroCustomizado`) viram uma resposta
HTTP específica e **não** são logados (são esperados, não incidentes — um
"email duplicado" não é uma falha do sistema). Só o `throw error;` final
(erro não reconhecido, o que vira um 500) passa por `logger.error` antes de
subir.

## Request ID

`proxy.ts` gera um `crypto.randomUUID()` por requisição (ou respeita um
`x-request-id` já vindo de upstream) e o propaga em dois lugares:

- No request que chega aos Server Components/Route Handlers — lido via
  `lib/observability/request-id.ts#getRequestId()` (`server-only`).
- No header de resposta `x-request-id` — visível na aba Network do
  navegador, útil para o usuário reportar "aconteceu isso, o id da
  requisição foi X" sem precisar descrever o que fez.

**"Correlation ID" e "Request ID" foram tratados como o mesmo conceito**
nesta sprint — numa aplicação sem filas/múltiplos hops, um id por
requisição já correlaciona log + Sentry + (quando aplicável) linha de
`audit_logs` daquela requisição. Introduzir os dois como sistemas
separados seria complexidade sem uso real neste projeto.

Para investigar um incidente: pegue o `requestId` (da resposta HTTP, do
Sentry, ou do log estruturado), busque esse valor nos logs da Vercel — ele
aparece em toda linha de log da mesma requisição.

## Sentry

`instrumentation.ts` (servidor) e `instrumentation-client.ts` (browser) —
convenção do `@sentry/nextjs` v10+, substitui os antigos
`sentry.server.config.ts`/`sentry.client.config.ts`/`sentry.edge.config.ts`.
DSN em `NEXT_PUBLIC_SENTRY_DSN` (`.env.local`) — se ausente, o SDK não
inicializa (no-op), então rodar sem Sentry configurado (ex. CI, ambientes
efêmeros) não quebra nada.

`tracesSampleRate: 0.1` — amostragem baixa de propósito (plano gratuito do
Sentry tem cota limitada). Ajustar se o volume de tráfego justificar.

**Sem upload de source maps nesta fase** (exigiria `org`/`project`/
`authToken` novos no `withSentryConfig`) — os eventos chegam normalmente,
só sem stack trace desminificado. Avaliar se vira necessário conforme o
volume de erros reais em produção justificar o esforço de configurar.

## Error Boundaries

- `app/error.tsx` (novo, raiz): cobre qualquer rota sem boundary próprio —
  `(admin)`, `(kitchen)`, `/login`. Antes desta fase, um erro nessas áreas
  caía no boundary padrão (genérico) do Next.js, sem logging nenhum.
- `app/global-error.tsx` (novo): só dispara se o próprio `app/layout.tsx`
  falhar (ex. erro no carregamento de fonte/`Providers`) — precisa definir
  `<html>/<body>` própria (convenção do Next), deliberadamente sem os
  design tokens do projeto.
- `app/(store)/error.tsx` (já existia): mantido como está, mais específico
  para a experiência da loja (mensagem/ícone temáticos).

Todos os três chamam `logger.error` (que já encaminha ao Sentry).

## O que ainda não existe (ver `BACKLOG.md`)

- `logger.info`/`logger.warn` não são usados em nenhum ponto do código
  ainda — só `logger.error` foi conectado nesta fase, no ponto onde já
  existia uma lacuna clara (rotas de API). Instrumentar pontos de sucesso
  relevantes é uma decisão a tomar quando surgir necessidade real de
  observar, não preventivamente.
- Sem upload de source maps ao Sentry (ver acima).
- Sem dashboard de "taxa de erro" — o próprio Sentry já oferece isso
  nativamente; não faz sentido reconstruir dentro do painel administrativo
  (ver Fase 5 desta sprint, "Painel de Status", que é sobre conectividade,
  não sobre taxa de erro).
