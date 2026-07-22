import { UtensilsCrossed } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatCentsToBRL, formatMinutes } from "@/utils/format";
import type { MenuCategory } from "@/types/domain";

/** Listagem somente leitura do cardápio, agrupada por categoria (mesma fonte da loja — `getMenuByTenantSlug`). */
export function ProductsTable({ categories }: { categories: MenuCategory[] }) {
  const totalProducts = categories.reduce(
    (sum, category) => sum + category.products.length,
    0,
  );

  if (totalProducts === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="Nenhum produto publicado"
        description="Produtos publicados no cardápio aparecem aqui."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map(
        (category) =>
          category.products.length > 0 && (
            <div
              key={category.id}
              className="overflow-x-auto rounded-xl border bg-card"
            >
              <div className="border-b bg-secondary/60 px-4 py-3">
                <h2 className="text-sm font-bold">
                  {category.name}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({category.products.length})
                  </span>
                </h2>
              </div>
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase">
                    <th className="px-4 py-2.5">Produto</th>
                    <th className="px-4 py-2.5">Preparo</th>
                    <th className="px-4 py-2.5">Situação</th>
                    <th className="px-4 py-2.5 text-right">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {category.products.map((product) => (
                    <tr key={product.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium">{product.name}</span>
                          {product.badges.isFeatured && (
                            <Badge variant="accent">Destaque</Badge>
                          )}
                          {product.badges.isNew && (
                            <Badge variant="secondary">Novo</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatMinutes(product.prepTimeMinutes)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={product.isAvailable ? "success" : "outline"}>
                          {product.isAvailable ? "Disponível" : "Indisponível"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatCentsToBRL(product.priceCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
      )}
    </div>
  );
}
