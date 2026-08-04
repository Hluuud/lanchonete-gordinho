import type { Menu, Product } from "@/types/domain";

/**
 * Seções do cardápio na experiência de autoatendimento: as "virtuais"
 * (derivadas dos badges existentes — nunca dados fabricados) seguidas das
 * categorias reais do banco.
 *
 * "Mais Vendidos" e "Promoções" não entram aqui: desde a Sprint 7 eles têm
 * seções próprias na página, fora do bloco do cardápio (ver
 * `selectBestsellers`/`selectPromotions` abaixo). Combos seguem de fora até
 * serem vendáveis — exibir seção vazia ou inventar dados quebraria a
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
    title: "Destaques da Casa",
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

/** Todos os produtos do cardápio, achatados na ordem das categorias. */
function allProductsOf(menu: Menu): Product[] {
  return menu.categories.flatMap((category) => category.products);
}

/** Está em promoção quando o lojista definiu um preço promocional. */
export function isOnPromotion(product: Product): boolean {
  return product.promoPriceCents !== null;
}

/** Preço que o cliente efetivamente paga hoje. */
export function effectivePriceCents(product: Product): number {
  return product.promoPriceCents ?? product.priceCents;
}

/** Quanto o cliente economiza, em centavos. Zero quando não há promoção. */
export function savingsCents(product: Product): number {
  return product.priceCents - effectivePriceCents(product);
}

/** Produtos com preço promocional — alimentam a seção `#promocoes`. */
export function selectPromotions(menu: Menu): Product[] {
  return allProductsOf(menu).filter(isOnPromotion);
}

/**
 * Produtos da seção `#mais-vendidos`. Enquanto o lojista não marcar nenhum
 * campeão de vendas, cai nos destaques — é a melhor aproximação honesta que
 * temos, e a UI rotula a seção de acordo (não afirma "mais vendido" sobre um
 * produto que ninguém contou).
 */
export function selectBestsellers(menu: Menu): {
  products: Product[];
  isFallback: boolean;
} {
  const products = allProductsOf(menu);
  const bestsellers = products.filter((product) => product.badges.isBestseller);

  if (bestsellers.length > 0) {
    return { products: bestsellers, isFallback: false };
  }

  return {
    products: products.filter((product) => product.badges.isFeatured),
    isFallback: true,
  };
}
