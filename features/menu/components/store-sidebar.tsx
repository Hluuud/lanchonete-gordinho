"use client";

import { ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/features/menu/category-icon";
import { StoreContactFooter } from "@/features/menu/components/store-contact-footer";
import { StoreNavLink } from "@/features/menu/components/store-nav-link";
import { SLOGAN } from "@/features/menu/contact-info";
import { STORE_NAV_ANCHORS, STORE_NAV_ITEMS } from "@/features/menu/nav";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { useScrollSpy } from "@/features/menu/use-scroll-spy";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";
import { SearchBar } from "@/features/search/components/search-bar";

/**
 * Sidebar fixa do autoatendimento (desktop/totem, `lg:+`): identidade da
 * marca sobre o preto da fachada, CTA de pedido, busca e navegação vertical
 * com destaque da seção ativa (ScrollSpy). As categorias reais do cardápio
 * aparecem indentadas sob o item "Cardápio". No mobile a navegação
 * equivalente é a `StoreMobileNav` (Drawer).
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
    [
      ...STORE_NAV_ANCHORS,
      ...sections.map((section) => sectionAnchorId(section.slug)),
    ],
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-surface-dark-border bg-surface-dark text-surface-dark-foreground lg:flex">
      <div className="flex flex-col gap-4 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="lg" priority />
          <div className="min-w-0">
            <p className="font-display text-xl leading-tight tracking-wide uppercase">
              {tenantName}
            </p>
            <p className="truncate text-xs text-surface-dark-muted">{SLOGAN}</p>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full rounded-full font-semibold"
          onClick={() => scrollToSection("cardapio")}
        >
          Peça Agora
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="px-5 pb-4">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder="Buscar no cardápio"
        />
      </div>

      <nav
        aria-label="Seções da loja"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <ul className="flex flex-col gap-1">
          {STORE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.anchor} className={item.isHeading ? "pt-2" : undefined}>
                <StoreNavLink
                  anchor={item.anchor}
                  label={item.label}
                  icon={
                    <Icon
                      className={item.isHeading ? "size-4" : "size-5"}
                      aria-hidden
                    />
                  }
                  isActive={!item.isHeading && activeId === item.anchor}
                  isHeading={item.isHeading}
                  tone="dark"
                  onNavigate={scrollToSection}
                />

                {item.isHeading && (
                  <ul className="mt-1 flex flex-col gap-1">
                    {sections.map((section) => {
                      const anchor = sectionAnchorId(section.slug);

                      return (
                        <li key={section.id}>
                          <StoreNavLink
                            anchor={anchor}
                            label={section.title}
                            icon={
                              <CategoryIcon
                                slug={section.slug}
                                className="size-5"
                              />
                            }
                            count={section.products.length}
                            isActive={activeId === anchor}
                            isIndented
                            tone="dark"
                            onNavigate={scrollToSection}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <StoreContactFooter tone="dark" />
    </aside>
  );
}
