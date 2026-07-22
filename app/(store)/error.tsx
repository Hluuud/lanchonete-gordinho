"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Boundary de erro da loja (convenção do App Router). Captura falhas de
 * renderização/fetch dos Server Components desta rota (ex.: indisponibilidade
 * do Supabase) sem derrubar o app inteiro.
 */
export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={TriangleAlert}
        title="Não conseguimos carregar o cardápio"
        description="Algo deu errado do nosso lado. Tente novamente em instantes."
        action={
          <Button onClick={reset} variant="primary">
            Tentar novamente
          </Button>
        }
      />
    </main>
  );
}
