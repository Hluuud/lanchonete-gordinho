import { describe, expect, it } from "vitest";

import {
  buildStoreSections,
  sectionAnchorId,
} from "@/features/menu/virtual-sections";
import type { Menu, Product } from "@/types/domain";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    categoryId: "c1",
    name: "X-Burger",
    description: null,
    priceCents: 2500,
    imageUrl: null,
    prepTimeMinutes: 15,
    isAvailable: true,
    badges: { isFeatured: false, isNew: false },
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
