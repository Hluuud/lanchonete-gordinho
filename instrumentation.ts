import * as Sentry from "@sentry/nextjs";

/**
 * Ponto de entrada do Sentry no lado do servidor (Node/Edge) — convenção
 * atual do SDK `@sentry/nextjs` v10+, substitui os antigos
 * `sentry.server.config.ts`/`sentry.edge.config.ts`. `instrumentation-client.ts`
 * é o equivalente para o bundle do browser.
 */
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      // Amostragem baixa por padrão — plano gratuito do Sentry tem cota
      // limitada; ajustar se o volume de tráfego justificar mais tracing.
      tracesSampleRate: 0.1,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
