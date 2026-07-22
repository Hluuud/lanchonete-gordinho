"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import { CategorySection } from "@/features/menu/components/category-section";
import { FeaturedCarousel } from "@/features/menu/components/featured-carousel";
import { Hero } from "@/features/menu/components/hero";
import { CategoryNav } from "@/features/menu/components/category-nav";
import { NewArrivalsRow } from "@/features/menu/components/new-arrivals-row";
import { FilterBar } from "@/features/search/components/filter-bar";
import { SearchBar } from "@/features/search/components/search-bar";
import { SearchResults } from "@/features/search/components/search-results";
import {
  flattenSearchableProducts,
  matchesBadgeFilter,
  matchesQuery,
  sortProducts,
  type BadgeFilter,
  type SortOrder,
} from "@/features/search/search-utils";
import type { Menu } from "@/types/domain";

const SEARCH_DEBOUNCE_MS = 250;

/**
 * Orquestra a experiência da loja: modo "navegar" (Hero + destaques +
 * categorias) e modo "resultados" (busca/filtro), sobre os dados já
 * carregados no servidor (nenhuma chamada extra ao Supabase no client).
 *
 * `rawQuery` é a fonte única de verdade do texto digitado (controla o input);
 * `debouncedQuery` é o que efetivamente filtra, evitando recomputar a cada tecla.
 */
export function StoreExperience({ menu }: { menu: Menu }) {
  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery] = useDebounce(rawQuery, SEARCH_DEBOUNCE_MS);
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("relevance");

  const allProducts = useMemo(
    () => flattenSearchableProducts(menu.categories),
    [menu.categories],
  );

  const featuredProducts = useMemo(
    () => allProducts.filter((product) => product.badges.isFeatured),
    [allProducts],
  );

  const newProducts = useMemo(
    () => allProducts.filter((product) => product.badges.isNew),
    [allProducts],
  );

  const isFiltering = debouncedQuery.trim() !== "" || badgeFilter !== "all";

  const results = useMemo(() => {
    if (!isFiltering) return [];
    const filtered = allProducts
      .filter((product) => matchesQuery(product, debouncedQuery))
      .filter((product) => matchesBadgeFilter(product, badgeFilter));
    return sortProducts(filtered, sortOrder);
  }, [allProducts, debouncedQuery, badgeFilter, sortOrder, isFiltering]);

  function clearFilters() {
    setRawQuery("");
    setBadgeFilter("all");
    setSortOrder("relevance");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Hero tenantName={menu.tenant.name} />

      <div id="cardapio" className="mx-auto w-full max-w-6xl px-4 py-6 pb-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={rawQuery} onChange={setRawQuery} />
          </div>
        </div>

        <div className="mt-4">
          <FilterBar
            badgeFilter={badgeFilter}
            onBadgeFilterChange={setBadgeFilter}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        </div>

        <div className="mt-6">
          {isFiltering ? (
            <SearchResults
              results={results}
              query={debouncedQuery}
              onClear={clearFilters}
            />
          ) : (
            <>
              {featuredProducts.length > 0 && (
                <div className="mb-8">
                  <FeaturedCarousel products={featuredProducts} />
                </div>
              )}

              <CategoryNav categories={menu.categories} />

              <div className="mt-8 flex flex-col gap-12">
                <NewArrivalsRow products={newProducts} />
                {menu.categories.map((category) => (
                  <CategorySection key={category.id} category={category} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
