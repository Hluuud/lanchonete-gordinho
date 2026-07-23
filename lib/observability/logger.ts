import * as Sentry from "@sentry/nextjs";

/**
 * Logger estruturado — substitui `console.*` avulso em todo o projeto.
 * Sem `"server-only"` de propósito: usado tanto por route handlers/services
 * (servidor) quanto por Error Boundaries de Client Component (`app/error.tsx`).
 * No servidor, imprime uma linha JSON por log (formato que a Vercel já
 * indexa nativamente); no browser, imprime de forma legível no DevTools.
 * `logger.error` sempre encaminha para o Sentry.
 */

export type LogLevel = "info" | "warn" | "error";
export type LogContext = Record<string, unknown> & { error?: unknown; requestId?: string | null };

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return error;
}

function write(level: LogLevel, message: string, context?: LogContext) {
  const consoleFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  if (typeof window !== "undefined") {
    consoleFn(`[${level}] ${message}`, context ?? "");
    return;
  }

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
    error: context?.error !== undefined ? serializeError(context.error) : undefined,
  };
  consoleFn(JSON.stringify(entry));
}

export const logger = {
  info(message: string, context?: LogContext) {
    write("info", message, context);
  },
  warn(message: string, context?: LogContext) {
    write("warn", message, context);
  },
  error(message: string, context?: LogContext) {
    write("error", message, context);

    if (context?.error instanceof Error) {
      Sentry.captureException(context.error, { extra: context });
    } else {
      Sentry.captureMessage(message, { level: "error", extra: context });
    }
  },
};
