"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import { FeaturedCarousel } from "@/features/menu/components/featured-carousel";
import { CategoryNav } from "@/features/menu/components/category-nav";
import { MascotNavBubble } from "@/features/menu/components/mascot-nav-bubble";
import { MenuSection } from "@/features/menu/components/menu-section";
import { StoreBestsellers } from "@/features/menu/components/store-bestsellers";
import { StoreCombos } from "@/features/menu/components/store-combos";
import { StoreGallery } from "@/features/menu/components/store-gallery";
import { StoreSidebar } from "@/features/menu/components/store-sidebar";
import { StoreHero } from "@/features/menu/components/store-hero";
import { StorePromoBanner } from "@/features/menu/components/store-promo-banner";
import { StoreHighlights } from "@/features/menu/components/store-highlights";
import { StoreAbout } from "@/features/menu/components/store-about";
import { StoreContactSection } from "@/features/menu/components/store-contact-section";
import { StoreTestimonials } from "@/features/menu/components/store-testimonials";
import { StoreFooter } from "@/features/menu/components/store-footer";
import { getAverageMenuPrepTimeMinutes } from "@/features/menu/store-info";
import { buildStoreSections, selectPromotions } from "@/features/menu/virtual-sections";
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
 * Orquestra a experiência de autoatendimento: sidebar fixa (desktop/totem) +
 * topbar sticky + conteúdo, alternando entre modo "navegar" (banner +
 * seções) e modo "resultados" (busca/filtro), sobre os dados já carregados
 * no servidor (nenhuma chamada extra ao Supabase no client).
 *
 * `rawQuery` é a fonte única de verdade do texto digitado — alimenta tanto a
 * busca da sidebar quanto a do conteúdo mobile; `debouncedQuery` é o que
 * efetivamente filtra.
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

  // Seções virtuais (Destaques/Novidades, derivadas de badges) + categorias
  // reais — mesma fonte para sidebar, CategoryNav mobile e conteúdo.
  const sections = useMemo(() => buildStoreSections(menu), [menu]);

  // Controla o link direto "Promoções" (sidebar/drawer) para a seção real
  // `#promocoes` — só aparece quando existe produto com preço promocional.
  const hasPromotions = useMemo(() => selectPromotions(menu).length > 0, [menu]);

  const avgPrepMinutes = useMemo(
    () => getAverageMenuPrepTimeMinutes(menu),
    [menu],
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
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <MascotNavBubble
        tenantName={menu.tenant.name}
        sections={sections}
        hasPromotions={hasPromotions}
        query={rawQuery}
        onQueryChange={setRawQuery}
      />

      <StoreSidebar
        tenantName={menu.tenant.name}
        sections={sections}
        hasPromotions={hasPromotions}
        query={rawQuery}
        onQueryChange={setRawQuery}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <StoreHero avgPrepMinutes={avgPrepMinutes} />

        <StoreHighlights />

        <div id="cardapio" className="mx-auto w-full max-w-6xl px-4 py-10">
          <div className="lg:hidden">
            <SearchBar value={rawQuery} onChange={setRawQuery} />
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

                <CategoryNav sections={sections} />

                <div className="mt-8 flex flex-col gap-12">
                  {sections.map((section) => (
                    <MenuSection key={section.id} section={section} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <StorePromoBanner />
        <StoreCombos menu={menu} />
        <StoreBestsellers menu={menu} />

        <StoreGallery />

        <StoreAbout />
        <StoreTestimonials />
        <StoreContactSection />
        <StoreFooter />
      </div>
    </div>
  );
}
