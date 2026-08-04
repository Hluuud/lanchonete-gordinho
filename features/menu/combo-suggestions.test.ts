import { describe, expect, it } from "vitest";

import { buildComboSuggestions } from "@/features/menu/combo-suggestions";
import type { Menu, Product, ProductBadges } from "@/types/domain";

type ProductOverrides = Partial<Omit<Product, "badges">> & {
  badges?: Partial<ProductBadges>;
};

function makeProduct({ badges, ...overrides }: ProductOverrides = {}): Product {
  return {
    id: "p1",
    categoryId: "c1",
    name: "X-Burger",
    description: null,
    priceCents: 2500,
    promoPriceCents: null,
    imageUrl: null,
    prepTimeMinutes: 15,
    isAvailable: true,
    badges: { isFeatured: false, isNew: false, isBestseller: false, ...badges },
    tags: [],
    rating: null,
    ...overrides,
  };
}

function makeMenu(categories: Menu["categories"]): Menu {
  return {
    tenant: { id: "t1", slug: "gordinho", name: "Lanchonete do Gordinho" },
    categories,
  };
}

const fullMenu = makeMenu([
  {
    id: "c1",
    name: "Lanches",
    slug: "lanches",
    products: [
      makeProduct({ id: "burger-1", name: "X-Burger", priceCents: 2290 }),
      makeProduct({ id: "burger-2", name: "X-Bacon", priceCents: 2690 }),
    ],
  },
  {
    id: "c2",
    name: "Porções",
    slug: "porcoes",
    products: [makeProduct({ id: "fritas", name: "Batata", priceCents: 1290 })],
  },
  {
    id: "c3",
    name: "Bebidas",
    slug: "bebidas",
    products: [makeProduct({ id: "refri", name: "Refri", priceCents: 700 })],
  },
]);

describe("buildComboSuggestions", () => {
  it("soma exatamente os preços dos itens — sem desconto inventado", () => {
    const combo = buildComboSuggestions(fullMenu).find(
      (item) => item.id === "combo-gordinho",
    );

    expect(combo).toBeDefined();
    expect(combo?.products).toHaveLength(3);
    expect(combo?.totalCents).toBe(
      combo?.products.reduce((sum, product) => sum + product.priceCents, 0),
    );
  });

  it("não repete o mesmo produto dentro de um combo de dois lanches", () => {
    const casal = buildComboSuggestions(fullMenu).find(
      (item) => item.id === "combo-casal",
    );

    const ids = casal?.products.map((product) => product.id) ?? [];

    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
  });

  it("omite o combo quando falta um dos papéis (sem sobremesa, sem Fim Feliz)", () => {
    const ids = buildComboSuggestions(fullMenu).map((combo) => combo.id);

    expect(ids).not.toContain("combo-doce");
  });

  it("prefere o campeão de vendas como item principal", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({ id: "comum", priceCents: 2000 }),
          makeProduct({ id: "campeao", badges: { isBestseller: true } }),
        ],
      },
      {
        id: "c2",
        name: "Porções",
        slug: "porcoes",
        products: [makeProduct({ id: "fritas" })],
      },
      {
        id: "c3",
        name: "Bebidas",
        slug: "bebidas",
        products: [makeProduct({ id: "refri" })],
      },
    ]);

    const combo = buildComboSuggestions(menu).find(
      (item) => item.id === "combo-gordinho",
    );

    expect(combo?.products[0].id).toBe("campeao");
  });

  it("ignora produtos indisponíveis", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [makeProduct({ id: "esgotado", isAvailable: false })],
      },
      {
        id: "c2",
        name: "Porções",
        slug: "porcoes",
        products: [makeProduct({ id: "fritas" })],
      },
      {
        id: "c3",
        name: "Bebidas",
        slug: "bebidas",
        products: [makeProduct({ id: "refri" })],
      },
    ]);

    expect(buildComboSuggestions(menu)).toEqual([]);
  });

  it("cardápio vazio não gera combo nenhum", () => {
    expect(buildComboSuggestions(makeMenu([]))).toEqual([]);
  });
});
