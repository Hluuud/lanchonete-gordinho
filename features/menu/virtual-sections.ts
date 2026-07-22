import type { Menu, Product } from "@/types/domain";

/**
 * Seções do cardápio na experiência de autoatendimento: as "virtuais"
 * (derivadas dos badges existentes — nunca dados fabricados) seguidas das
 * categorias reais do banco.
 *
 * "Combos" e "Mais Vendidos" ficam deliberadamente de fora até existirem no
 * schema (ver BACKLOG.md) — exibir seção vazia ou inventar dados quebraria a
 * confiança do cliente.
 */
export type StoreSection = {
  /** Chave única para React e âncoras. */
  id: string;
  slug: string;
  title: string;
  kind: "virtual" | "category";
  products: Product[];
};

const SECTION_ANCHOR_PREFIX = "categoria-";

/** Âncora DOM da seção — mesmo padrão `#categoria-<slug>` desde a Sprint 1. */
export function sectionAnchorId(slug: string): string {
  return `${SECTION_ANCHOR_PREFIX}${slug}`;
}

const VIRTUAL_SECTION_DEFS: {
  slug: string;
  title: string;
  matches: (product: Product) => boolean;
}[] = [
  {
    slug: "destaques",
    title: "Promoções & Destaques",
    matches: (product) => product.badges.isFeatured,
  },
  {
    slug: "novidades",
    title: "Novidades",
    matches: (product) => product.badges.isNew,
  },
];

/**
 * Monta as seções exibidas na loja: virtuais não-vazias primeiro, depois as
 * categorias reais na ordem do banco. Slugs virtuais assumem que nenhuma
 * categoria real usa "destaques"/"novidades" (colisão geraria âncora dupla).
 */
export function buildStoreSections(menu: Menu): StoreSection[] {
  const allProducts = menu.categories.flatMap((category) => category.products);

  const virtualSections = VIRTUAL_SECTION_DEFS.map((def) => ({
    id: `virtual-${def.slug}`,
    slug: def.slug,
    title: def.title,
    kind: "virtual" as const,
    products: allProducts.filter(def.matches),
  })).filter((section) => section.products.length > 0);

  const categorySections = menu.categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: category.name,
    kind: "category" as const,
    products: category.products,
  }));

  return [...virtualSections, ...categorySections];
}
