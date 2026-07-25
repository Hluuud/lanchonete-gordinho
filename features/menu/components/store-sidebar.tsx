"use client";

import { ArrowRight, Home, Info, Phone } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/features/menu/category-icon";
import { StoreContactFooter } from "@/features/menu/components/store-contact-footer";
import { SLOGAN } from "@/features/menu/contact-info";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { useScrollSpy } from "@/features/menu/use-scroll-spy";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";
import { SearchBar } from "@/features/search/components/search-bar";
import { cn } from "@/lib/utils";

/**
 * Sidebar fixa do autoatendimento (desktop/totem, `lg:+`): identidade da
 * marca, CTA de pedido, busca e navegação vertical de categorias com
 * destaque da seção ativa (ScrollSpy). No mobile a navegação equivalente é
 * a `StoreMobileNav` (Drawer).
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
      "home",
      "sobre",
      "contato",
      ...sections.map((section) => sectionAnchorId(section.slug)),
    ],
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-card lg:flex">
      <div className="flex flex-col gap-4 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="lg" priority />
          <div className="min-w-0">
            <p className="text-lg leading-tight font-extrabold">
              {tenantName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {SLOGAN}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full rounded-full"
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
        aria-label="Seções do cardápio"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <ul className="flex flex-col gap-1">
          <li>
            <a
              href="#home"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("home");
              }}
              aria-current={activeId === "home" ? "true" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeId === "home"
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Home className="size-5" aria-hidden />
              <span className="flex-1 truncate">Home</span>
            </a>
          </li>

          <li>
            <a
              href="#sobre"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("sobre");
              }}
              aria-current={activeId === "sobre" ? "true" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeId === "sobre"
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Info className="size-5" aria-hidden />
              <span className="flex-1 truncate">Sobre Nós</span>
            </a>
          </li>

          <li>
            <a
              href="#contato"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("contato");
              }}
              aria-current={activeId === "contato" ? "true" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeId === "contato"
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Phone className="size-5" aria-hidden />
              <span className="flex-1 truncate">Contato</span>
            </a>
          </li>

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

      <StoreContactFooter />
    </aside>
  );
}
