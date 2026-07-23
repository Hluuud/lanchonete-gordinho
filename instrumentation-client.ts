import * as Sentry from "@sentry/nextjs";

/**
 * Ponto de entrada do Sentry no bundle do browser — nome de arquivo
 * reconhecido automaticamente pelo Next.js (>=15.3), sem precisar de flag
 * experimental. Ver `instrumentation.ts` para o lado do servidor.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
