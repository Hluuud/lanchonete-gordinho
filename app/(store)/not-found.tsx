import Link from "next/link";
import { Store } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function StoreNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={Store}
        title="Restaurante não encontrado"
        description="Verifique o endereço ou volte para a página inicial."
        action={
          <Button asChild variant="primary">
            <Link href="/">Voltar ao início</Link>
          </Button>
        }
      />
    </main>
  );
}
