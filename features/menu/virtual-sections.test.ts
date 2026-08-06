import { describe, expect, it } from "vitest";

import {
  buildStoreSections,
  effectivePriceCents,
  isOnPromotion,
  savingsCents,
  sectionAnchorId,
  selectBestsellers,
  selectPromotions,
} from "@/features/menu/virtual-sections";
import type { Menu, Product, ProductBadges } from "@/types/domain";

type ProductOverrides = Partial<Omit<Product, "badges">> & {
  /** Parcial: cada teste declara só o badge que lhe interessa. */
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
    badges: {
      isFeatured: false,
      isNew: false,
      isBestseller: false,
      ...badges,
    },
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

describe("buildStoreSections", () => {
  it("retorna apenas categorias reais quando não há badges", () => {
    const menu = makeMenu([
      { id: "c1", name: "Lanches", slug: "lanches", products: [makeProduct()] },
      { id: "c2", name: "Bebidas", slug: "bebidas", products: [] },
    ]);

    const sections = buildStoreSections(menu);

    expect(sections).toHaveLength(2);
    expect(sections.every((s) => s.kind === "category")).toBe(true);
    expect(sections.map((s) => s.slug)).toEqual(["lanches", "bebidas"]);
  });

  it("cria a seção de destaques com produtos isFeatured de todas as categorias", () => {
    const featured1 = makeProduct({
      id: "p1",
      badges: { isFeatured: true, isNew: false },
    });
    const featured2 = makeProduct({
      id: "p2",
      categoryId: "c2",
      badges: { isFeatured: true, isNew: false },
    });
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [featured1, makeProduct({ id: "p3" })],
      },
      { id: "c2", name: "Bebidas", slug: "bebidas", products: [featured2] },
    ]);

    const sections = buildStoreSections(menu);
    const destaques = sections.find((s) => s.slug === "destaques");

    expect(destaques).toBeDefined();
    expect(destaques?.kind).toBe("virtual");
    expect(destaques?.products.map((p) => p.id)).toEqual(["p1", "p2"]);
  });

  it("cria a seção de novidades com produtos isNew", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({ id: "p1", badges: { isFeatured: false, isNew: true } }),
        ],
      },
    ]);

    const sections = buildStoreSections(menu);

    expect(sections.map((s) => s.slug)).toEqual(["novidades", "lanches"]);
  });

  it("posiciona virtuais antes das categorias reais, na ordem destaques → novidades", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({ id: "p1", badges: { isFeatured: true, isNew: true } }),
        ],
      },
    ]);

    const sections = buildStoreSections(menu);

    expect(sections.map((s) => s.slug)).toEqual([
      "destaques",
      "novidades",
      "lanches",
    ]);
  });

  it("cria a seção de promoções (slug promocoes-cardapio) com produtos de preço promocional", () => {
    const onSale = makeProduct({ id: "p1", promoPriceCents: 1990 });
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [onSale, makeProduct({ id: "p2" })],
      },
    ]);

    const sections = buildStoreSections(menu);
    const promocoes = sections.find((s) => s.slug === "promocoes-cardapio");

    expect(promocoes).toBeDefined();
    expect(promocoes?.kind).toBe("virtual");
    expect(promocoes?.title).toBe("Promoções");
    expect(promocoes?.products.map((p) => p.id)).toEqual(["p1"]);
  });

  it("posiciona promoções antes de destaques e novidades quando as três existem", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({
            id: "p1",
            promoPriceCents: 1990,
            badges: { isFeatured: true, isNew: true },
          }),
        ],
      },
    ]);

    const sections = buildStoreSections(menu);

    expect(sections.map((s) => s.slug)).toEqual([
      "promocoes-cardapio",
      "destaques",
      "novidades",
      "lanches",
    ]);
  });

  it("um produto com os dois badges aparece nas duas seções virtuais", () => {
    const both = makeProduct({
      id: "p1",
      badges: { isFeatured: true, isNew: true },
    });
    const menu = makeMenu([
      { id: "c1", name: "Lanches", slug: "lanches", products: [both] },
    ]);

    const sections = buildStoreSections(menu);

    expect(
      sections.find((s) => s.slug === "destaques")?.products,
    ).toContainEqual(both);
    expect(
      sections.find((s) => s.slug === "novidades")?.products,
    ).toContainEqual(both);
  });

  it("ids das seções são únicos mesmo com virtuais presentes", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({ id: "p1", badges: { isFeatured: true, isNew: false } }),
        ],
      },
    ]);

    const ids = buildStoreSections(menu).map((s) => s.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("sectionAnchorId", () => {
  it("mantém o padrão de âncora #categoria-<slug> da Sprint 1", () => {
    expect(sectionAnchorId("lanches")).toBe("categoria-lanches");
    expect(sectionAnchorId("destaques")).toBe("categoria-destaques");
  });
});

describe("preço promocional", () => {
  it("sem promoção, o preço efetivo é o cheio e a economia é zero", () => {
    const product = makeProduct({ priceCents: 2500 });

    expect(isOnPromotion(product)).toBe(false);
    expect(effectivePriceCents(product)).toBe(2500);
    expect(savingsCents(product)).toBe(0);
  });

  it("com promoção, o preço efetivo é o promocional e a economia é a diferença", () => {
    const product = makeProduct({ priceCents: 2500, promoPriceCents: 1990 });

    expect(isOnPromotion(product)).toBe(true);
    expect(effectivePriceCents(product)).toBe(1990);
    expect(savingsCents(product)).toBe(510);
  });
});

describe("selectPromotions", () => {
  it("junta produtos com preço promocional de todas as categorias", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({ id: "p1", promoPriceCents: 1990 }),
          makeProduct({ id: "p2" }),
        ],
      },
      {
        id: "c2",
        name: "Bebidas",
        slug: "bebidas",
        products: [makeProduct({ id: "p3", promoPriceCents: 500 })],
      },
    ]);

    expect(selectPromotions(menu).map((p) => p.id)).toEqual(["p1", "p3"]);
  });

  it("retorna vazio quando nada está em promoção — a seção some em vez de mentir", () => {
    const menu = makeMenu([
      { id: "c1", name: "Lanches", slug: "lanches", products: [makeProduct()] },
    ]);

    expect(selectPromotions(menu)).toEqual([]);
  });
});

describe("selectBestsellers", () => {
  it("usa os campeões de venda marcados pelo lojista", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({ id: "p1", badges: { isBestseller: true } }),
          makeProduct({ id: "p2", badges: { isFeatured: true } }),
        ],
      },
    ]);

    const { products, isFallback } = selectBestsellers(menu);

    expect(products.map((p) => p.id)).toEqual(["p1"]);
    expect(isFallback).toBe(false);
  });

  it("cai nos destaques e sinaliza fallback quando ninguém foi marcado", () => {
    const menu = makeMenu([
      {
        id: "c1",
        name: "Lanches",
        slug: "lanches",
        products: [
          makeProduct({ id: "p1", badges: { isFeatured: true } }),
          makeProduct({ id: "p2" }),
        ],
      },
    ]);

    const { products, isFallback } = selectBestsellers(menu);

    expect(products.map((p) => p.id)).toEqual(["p1"]);
    expect(isFallback).toBe(true);
  });

  it("sem campeões nem destaques, devolve lista vazia", () => {
    const menu = makeMenu([
      { id: "c1", name: "Lanches", slug: "lanches", products: [makeProduct()] },
    ]);

    expect(selectBestsellers(menu).products).toEqual([]);
  });
});
