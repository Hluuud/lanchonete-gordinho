"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { BrandLogo } from "@/components/brand-logo";
import { CategoryIcon } from "@/features/menu/category-icon";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { sectionAnchorId, type StoreSection } from "@/features/menu/virtual-sections";
import { SearchBar } from "@/features/search/components/search-bar";

/**
 * Menu de navegação do celular (Drawer inferior): mesma lista de seções da
 * sidebar desktop, para pedir com uma mão sem depender só do scroll
 * horizontal da `CategoryNav`.
 */
export function StoreMobileNav({
  open,
  onOpenChange,
  tenantName,
  sections,
  query,
  onQueryChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  sections: StoreSection[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  function goTo(slug: string) {
    onOpenChange(false);
    // Aguarda o Drawer fechar para não competir com sua própria animação de scroll.
    window.setTimeout(() => scrollToSection(sectionAnchorId(slug)), 200);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        title="Navegar pelo cardápio"
        description="Buscar produtos ou pular para uma seção"
        className="max-h-[85dvh]"
      >
        <div className="flex items-center gap-3 px-4 pb-4">
          <BrandLogo size="sm" />
          <p className="text-base font-bold">{tenantName}</p>
        </div>

        <div className="px-4 pb-4">
          <SearchBar value={query} onChange={onQueryChange} />
        </div>

        <nav
          aria-label="Seções do cardápio"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <ul className="flex flex-col gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => goTo(section.slug)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary active:bg-primary/15"
                >
                  <CategoryIcon slug={section.slug} className="size-5" />
                  <span className="flex-1 truncate">{section.title}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {section.products.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
