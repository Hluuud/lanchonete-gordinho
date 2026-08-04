import type { Menu, Product } from "@/types/domain";

/**
 * "Combos" da loja, montados a partir do cardápio real.
 *
 * A tabela `combos` existe, mas sua RLS é staff-only (migration 0017) e o
 * checkout não sabe vender combo — ler os combos cadastrados exigiria uma
 * policy pública e uma migration, fora do escopo desta sprint. Em vez de
 * inventar nomes e preços de combos que ninguém cadastrou, montamos
 * sugestões com produtos que existem de verdade e somamos os preços reais:
 * nenhum desconto é prometido, e o cliente pode adicionar tudo ao carrinho
 * de uma vez usando o carrinho que já existe.
 *
 * Quando os combos reais forem vendáveis, esta camada some e a seção passa a
 * ler do banco (registrado no BACKLOG).
 */

export type ComboSuggestion = {
  id: string;
  name: string;
  tagline: string;
  products: Product[];
  /** Soma dos preços dos itens — sem desconto, é o que o carrinho vai cobrar. */
  totalCents: number;
};

/** Slugs candidatos por papel no combo, em ordem de preferência. */
const ROLE_SLUGS = {
  main: ["lanches", "hamburgueres", "hot-dogs", "hotdogs", "pasteis"],
  side: ["porcoes", "pasteis"],
  drink: ["bebidas"],
  dessert: ["sobremesas"],
} as const;

type Role = keyof typeof ROLE_SLUGS;

function productsOfRole(menu: Menu, role: Role): Product[] {
  const slugs: readonly string[] = ROLE_SLUGS[role];

  return menu.categories
    .filter((category) => slugs.includes(category.slug))
    .flatMap((category) => category.products)
    .filter((product) => product.isAvailable);
}

/** Melhor representante do papel: prioriza campeão de venda, depois destaque. */
function pick(menu: Menu, role: Role, taken: Set<string>): Product | null {
  const candidates = productsOfRole(menu, role).filter(
    (product) => !taken.has(product.id),
  );
  if (candidates.length === 0) return null;

  const byPriority =
    candidates.find((product) => product.badges.isBestseller) ??
    candidates.find((product) => product.badges.isFeatured) ??
    candidates[0];

  taken.add(byPriority.id);
  return byPriority;
}

const RECIPES: { id: string; name: string; tagline: string; roles: Role[] }[] = [
  {
    id: "combo-gordinho",
    name: "Combo do Gordinho",
    tagline: "O clássico completo: lanche, acompanhamento e bebida.",
    roles: ["main", "side", "drink"],
  },
  {
    id: "combo-casal",
    name: "Combo Casal",
    tagline: "Dois lanches e uma porção para dividir (ou não).",
    roles: ["main", "main", "side"],
  },
  {
    id: "combo-doce",
    name: "Combo Fim Feliz",
    tagline: "Lanche, bebida e aquela sobremesa para fechar.",
    roles: ["main", "drink", "dessert"],
  },
];

/**
 * Monta as sugestões possíveis com o cardápio de hoje. Uma sugestão só entra
 * se todos os seus papéis foram preenchidos — combo incompleto não aparece.
 */
export function buildComboSuggestions(menu: Menu): ComboSuggestion[] {
  return RECIPES.flatMap((recipe) => {
    const taken = new Set<string>();
    const products: Product[] = [];

    for (const role of recipe.roles) {
      const product = pick(menu, role, taken);
      if (!product) return [];
      products.push(product);
    }

    return [
      {
        id: recipe.id,
        name: recipe.name,
        tagline: recipe.tagline,
        products,
        totalCents: products.reduce(
          (sum, product) => sum + product.priceCents,
          0,
        ),
      },
    ];
  });
}
