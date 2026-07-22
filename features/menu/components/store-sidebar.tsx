"use client";

import { BrandLogo } from "@/components/brand-logo";
import { CategoryIcon } from "@/features/menu/category-icon";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { useScrollSpy } from "@/features/menu/use-scroll-spy";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";
import { SearchBar } from "@/features/search/components/search-bar";
import { cn } from "@/lib/utils";

/**
 * Sidebar fixa do autoatendimento (desktop/totem, `lg:+`): logo, busca e
 * navegação vertical de seções com destaque da seção ativa (ScrollSpy).
 * No mobile a navegação de categorias é a `CategoryNav` horizontal.
 */
export function StoreSidebar({
  tenantName,
  sections,
  query,
  onQueryChange,
}: {
  tenantName: string;
  sections: StoreSection[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const activeId = useScrollSpy(
    sections.map((section) => sectionAnchorId(section.slug)),
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-card lg:flex">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <BrandLogo size="lg" priority />
        <div className="min-w-0">
          <p className="text-base leading-tight font-extrabold">
            {tenantName}
          </p>
          <p className="text-xs text-muted-foreground">Cardápio digital</p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder="Buscar no cardápio"
        />
      </div>

      <nav
        aria-label="Seções do cardápio"
        className="flex-1 overflow-y-auto px-3 pb-6"
      >
        <ul className="flex flex-col gap-1">
          {sections.map((section) => {
            const anchor = sectionAnchorId(section.slug);
            const isActive = anchor === activeId;

            return (
              <li key={section.id}>
                <a
                  href={`#${anchor}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(anchor);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <CategoryIcon slug={section.slug} className="size-5" />
                  <span className="flex-1 truncate">{section.title}</span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isActive
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {section.products.length}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
