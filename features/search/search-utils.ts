import type { MenuCategory, Product } from "@/types/domain";

export type SearchableProduct = Product & { categoryName: string };

export type BadgeFilter = "all" | "featured" | "new";
export type SortOrder = "relevance" | "price-asc" | "price-desc";

/** Achata as categorias em uma lista de produtos pesquisáveis, com o nome da categoria anexado. */
export function flattenSearchableProducts(
  categories: MenuCategory[],
): SearchableProduct[] {
  return categories.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryName: category.name,
    })),
  );
}

// Marcas de acentuação combinantes (U+0300–U+036F) — remove acentos após NFD.
const DIACRITICS_PATTERN = /[̀-ͯ]/g;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .trim();
}

/** Busca por nome, descrição (ingredientes/detalhes) ou categoria — sem diferenciar acentos. */
export function matchesQuery(
  product: SearchableProduct,
  query: string,
): boolean {
  if (query.trim() === "") return true;

  const needle = normalize(query);
  const haystacks = [
    product.name,
    product.description ?? "",
    product.categoryName,
  ];

  return haystacks.some((text) => normalize(text).includes(needle));
}

export function matchesBadgeFilter(
  product: SearchableProduct,
  filter: BadgeFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "featured") return product.badges.isFeatured;
  return product.badges.isNew;
}

export function sortProducts(
  products: SearchableProduct[],
  order: SortOrder,
): SearchableProduct[] {
  if (order === "relevance") return products;

  const sorted = [...products];
  sorted.sort((a, b) =>
    order === "price-asc"
      ? a.priceCents - b.priceCents
      : b.priceCents - a.priceCents,
  );
  return sorted;
}
