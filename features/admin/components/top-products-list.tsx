import { Trophy } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import type { AdminTopProduct } from "@/types/domain";

/** Ranking simples dos produtos mais vendidos na janela do dashboard. */
export function TopProductsList({
  products,
  windowDays,
}: {
  products: AdminTopProduct[];
  windowDays: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Produtos mais vendidos</h2>
        <p className="text-xs text-muted-foreground">Últimos {windowDays} dias</p>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Sem vendas no período"
          description="As vendas aparecem aqui assim que houver pedidos."
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {products.map((product, index) => (
            <li
              key={product.productId ?? product.name}
              className="flex items-center gap-3"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{product.name}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {product.quantity}×
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
