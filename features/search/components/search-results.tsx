import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/features/menu/components/product-card";
import type { SearchableProduct } from "@/features/search/search-utils";

type SearchResultsProps = {
  results: SearchableProduct[];
  query: string;
  onClear: () => void;
};

export function SearchResults({ results, query, onClear }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={
          query
            ? `Nenhum resultado para "${query}"`
            : "Nenhum produto encontrado"
        }
        description="Tente outro termo ou remova os filtros aplicados."
        action={
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Limpar busca e filtros
          </button>
        }
      />
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {results.length}{" "}
        {results.length === 1
          ? "resultado encontrado"
          : "resultados encontrados"}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
