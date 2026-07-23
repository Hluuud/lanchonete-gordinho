"use client";

import { useEffect } from "react";

import { logger } from "@/lib/observability/logger";

/**
 * Boundary de erro do próprio root layout (`app/layout.tsx`) — só dispara
 * se algo quebrar ali (ex.: falha no carregamento de fonte/Providers), não
 * para erros normais de página (esses caem em `app/error.tsx`). Precisa
 * definir `<html>/<body>` própria porque substitui o layout raiz inteiro —
 * fica deliberadamente sem os design tokens do projeto (o próprio CSS pode
 * ser a causa da falha).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Erro não tratado no layout raiz", { error });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Algo deu errado</h1>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>
          Tente novamente em instantes.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
