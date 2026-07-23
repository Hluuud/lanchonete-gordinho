"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/observability/logger";

/**
 * Boundary de erro raiz (convenção do App Router) — cobre qualquer rota sem
 * um `error.tsx` próprio (`(admin)`, `(kitchen)`, `/login`; a loja `(store)`
 * mantém o boundary temático já existente). Genérico de propósito: não sabe
 * em qual tema/rota o erro aconteceu.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Erro não tratado numa rota", { error });
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <EmptyState
        icon={TriangleAlert}
        title="Algo deu errado"
        description="Tente novamente em instantes. Se o problema continuar, entre em contato com o suporte."
        action={
          <Button onClick={reset} variant="primary">
            Tentar novamente
          </Button>
        }
      />
    </main>
  );
}
