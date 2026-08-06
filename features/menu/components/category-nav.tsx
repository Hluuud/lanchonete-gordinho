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
    // `bottom` da nav sticky (sem topbar acima dela) = só a altura desta
    // própria nav (~64px); usa a medida em runtime, com 64 como piso/
    // fallback para o primeiro render (antes do ref existir).
    {
      topOffsetPx: () =>
        Math.max(navRef.current?.getBoundingClientRect().bottom ?? 64, 64),
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
      className="sticky top-0 z-20 -mx-4 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/65 lg:hidden"
    >
      <ul
        ref={listRef}
        // pl-16 soma aos 16px de `px-4` da nav (~80px do canto da tela) para o
        // primeiro chip nunca ficar atrás da bolha do mascote (fixed, 56px de
        // largura a partir de 16px da borda — só existe abaixo de `lg`).
        className="flex [scrollbar-width:none] gap-2 overflow-x-auto py-3 pl-16 [&::-webkit-scrollbar]:hidden"
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
                    : "border-input text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary-text",
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
