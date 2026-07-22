"use client";

import { useEffect, useRef } from "react";

import { CategoryIcon } from "@/features/menu/category-icon";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { useScrollSpy } from "@/features/menu/use-scroll-spy";
import { sectionAnchorId } from "@/features/menu/virtual-sections";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/types/domain";

/**
 * Navegação horizontal de categorias (estilo iFood): sticky, scroll suave,
 * indicador de categoria ativa via `useScrollSpy` (linha de detecção logo
 * abaixo da nav, altura medida em runtime).
 */
export function CategoryNav({ categories }: { categories: MenuCategory[] }) {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const activeId = useScrollSpy(
    categories.map((category) => sectionAnchorId(category.slug)),
    // `bottom` da nav sticky = topbar + altura da própria nav; nunca abaixo
    // de 130px para cobrir o `scroll-mt-32` (128px) das seções no mobile.
    {
      topOffsetPx: () =>
        Math.max(navRef.current?.getBoundingClientRect().bottom ?? 128, 130),
    },
  );
  const activeSlug = activeId?.replace("categoria-", "");

  useEffect(() => {
    const activeLink = listRef.current?.querySelector<HTMLAnchorElement>(
      `[data-slug="${activeSlug}"]`,
    );
    activeLink?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeSlug]);

  return (
    <nav
      ref={navRef}
      aria-label="Categorias do cardápio"
      className="sticky top-16 z-20 -mx-4 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/65 lg:hidden"
    >
      <ul
        ref={listRef}
        className="flex [scrollbar-width:none] gap-2 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <li key={category.id}>
              <a
                href={`#categoria-${category.slug}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(sectionAnchorId(category.slug));
                }}
                data-slug={category.slug}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
                )}
              >
                <CategoryIcon slug={category.slug} className="size-4" />
                {category.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
