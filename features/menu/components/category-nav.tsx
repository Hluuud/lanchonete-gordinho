"use client";

import { useEffect, useRef, useState } from "react";

import { CategoryIcon } from "@/features/menu/category-icon";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/types/domain";

/**
 * Navegação horizontal de categorias (estilo iFood): sticky, scroll suave,
 * indicador de categoria ativa via `IntersectionObserver`.
 *
 * A ativação usa uma "linha de detecção" de 1px logo abaixo da nav (altura
 * medida em runtime), em vez de uma margem percentual fixa — assim seções
 * curtas (poucos produtos) também disparam corretamente o estado ativo.
 */
export function CategoryNav({ categories }: { categories: MenuCategory[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(`categoria-${category.slug}`))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const lineOffset = (navRef.current?.offsetHeight ?? 64) + 1;
    const bottomMargin = Math.max(window.innerHeight - lineOffset - 1, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];

        if (active) {
          setActiveSlug(active.target.id.replace("categoria-", ""));
        }
      },
      {
        rootMargin: `-${lineOffset}px 0px -${bottomMargin}px 0px`,
        threshold: 0,
      },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [categories]);

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
      className="sticky top-0 z-20 -mx-4 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/65"
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
