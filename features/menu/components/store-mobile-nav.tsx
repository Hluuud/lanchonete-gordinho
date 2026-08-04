"use client";

import { BrandLogo } from "@/components/brand-logo";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { CategoryIcon } from "@/features/menu/category-icon";
import { StoreContactFooter } from "@/features/menu/components/store-contact-footer";
import { StoreNavLink } from "@/features/menu/components/store-nav-link";
import { STORE_NAV_ITEMS } from "@/features/menu/nav";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";
import { SearchBar } from "@/features/search/components/search-bar";

/** Tempo da animação de fechamento do Drawer (vaul), para não competir com o scroll. */
const DRAWER_CLOSE_MS = 200;

/**
 * Menu de navegação do celular (Drawer inferior): mesma lista da sidebar
 * desktop — ambos leem `STORE_NAV_ITEMS` —, para pedir com uma mão sem
 * depender só do scroll horizontal da `CategoryNav`.
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
  function goTo(anchor: string) {
    onOpenChange(false);
    // Aguarda o Drawer fechar para não competir com sua própria animação de scroll.
    window.setTimeout(() => scrollToSection(anchor), DRAWER_CLOSE_MS);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        title="Navegar pela loja"
        description="Buscar produtos ou pular para uma seção"
        className="max-h-[85dvh]"
      >
        <div className="flex items-center gap-3 px-4 pb-4">
          <BrandLogo size="sm" />
          <p className="font-display text-lg tracking-wide uppercase">
            {tenantName}
          </p>
        </div>

        <div className="px-4 pb-4">
          <SearchBar value={query} onChange={onQueryChange} />
        </div>

        <nav
          aria-label="Seções da loja"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <ul className="flex flex-col gap-1">
            {STORE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.anchor}
                  className={item.isHeading ? "pt-2" : undefined}
                >
                  <StoreNavLink
                    anchor={item.anchor}
                    label={item.label}
                    icon={
                      <Icon
                        className={item.isHeading ? "size-4" : "size-5"}
                        aria-hidden
                      />
                    }
                    isHeading={item.isHeading}
                    tone="light"
                    onNavigate={goTo}
                  />

                  {item.isHeading && (
                    <ul className="mt-1 flex flex-col gap-1">
                      {sections.map((section) => (
                        <li key={section.id}>
                          <StoreNavLink
                            anchor={sectionAnchorId(section.slug)}
                            label={section.title}
                            icon={
                              <CategoryIcon
                                slug={section.slug}
                                className="size-5"
                              />
                            }
                            count={section.products.length}
                            isIndented
                            tone="light"
                            onNavigate={goTo}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <StoreContactFooter tone="light" className="shrink-0" />
      </DrawerContent>
    </Drawer>
  );
}
