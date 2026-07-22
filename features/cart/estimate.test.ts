import { describe, expect, it } from "vitest";

import { estimateCartPrepMinutes } from "@/features/cart/estimate";
import type { CartItem } from "@/features/cart/types";
import type { Product } from "@/types/domain";

function makeItem(prepTimeMinutes: number, quantity = 1): CartItem {
  const product: Product = {
    id: `p-${prepTimeMinutes}`,
    categoryId: "c1",
    name: "X-Burger",
    description: null,
    priceCents: 2500,
    imageUrl: null,
    prepTimeMinutes,
    isAvailable: true,
    badges: { isFeatured: false, isNew: false },
    rating: null,
  };
  return { product, quantity, note: "" };
}

describe("estimateCartPrepMinutes", () => {
  it("usa o maior tempo entre os itens (preparo em paralelo)", () => {
    expect(estimateCartPrepMinutes([makeItem(10), makeItem(25)])).toBe(25);
  });

  it("quantidade não altera a estimativa", () => {
    expect(estimateCartPrepMinutes([makeItem(15, 5)])).toBe(15);
  });

  it("ignora itens sem tempo de preparo", () => {
    expect(estimateCartPrepMinutes([makeItem(0), makeItem(12)])).toBe(12);
  });

  it("retorna null para carrinho vazio ou sem tempos válidos", () => {
    expect(estimateCartPrepMinutes([])).toBeNull();
    expect(estimateCartPrepMinutes([makeItem(0)])).toBeNull();
  });
});
