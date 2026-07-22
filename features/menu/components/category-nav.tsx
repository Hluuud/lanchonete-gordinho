"use client";

import { useEffect, useRef } from "react";

import { CategoryIcon } from "@/features/menu/category-icon";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { useScrollSpy } from "@/features/menu/use-scroll-spy";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";
import { cn } from "@/lib/utils";

/**
 * Navegação horizontal de seções (estilo iFood), mobile/tablet: sticky,
 * scroll suave, indicador de seção ativa via `useScrollSpy` (linha de
 * detecção logo abaixo da nav, altura medida em runtime).
 */
export function CategoryNav({ sections }: { sections: StoreSection[] }) {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const activeId = useScrollSpy(
    sections.map((section) => sectionAnchorId(section.slug)),
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
      aria-label="Seções do cardápio"
      className="sticky top-16 z-20 -mx-4 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/65 lg:hidden"
    >
      <ul
        ref={listRef}
        className="flex [scrollbar-width:none] gap-2 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section) => {
          const isActive = section.slug === activeSlug;
          return (
            <li key={section.id}>
              <a
                href={`#${sectionAnchorId(section.slug)}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(sectionAnchorId(section.slug));
                }}
                data-slug={section.slug}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
                )}
              >
                <CategoryIcon slug={section.slug} className="size-4" />
                {section.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
