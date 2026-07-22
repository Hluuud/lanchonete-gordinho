import { describe, expect, it } from "vitest";

import { checkoutInputSchema } from "@/features/checkout/schema";

const validItem = {
  productId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  quantity: 1,
};

describe("checkoutInputSchema", () => {
  it("aceita um input válido mínimo", () => {
    const result = checkoutInputSchema.safeParse({
      orderType: "pickup",
      items: [validItem],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita pedido sem itens", () => {
    const result = checkoutInputSchema.safeParse({
      orderType: "pickup",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantidade zero ou negativa", () => {
    expect(
      checkoutInputSchema.safeParse({
        orderType: "pickup",
        items: [{ ...validItem, quantity: 0 }],
      }).success,
    ).toBe(false);

    expect(
      checkoutInputSchema.safeParse({
        orderType: "pickup",
        items: [{ ...validItem, quantity: -1 }],
      }).success,
    ).toBe(false);
  });

  it("rejeita quantidade não inteira", () => {
    const result = checkoutInputSchema.safeParse({
      orderType: "pickup",
      items: [{ ...validItem, quantity: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita productId que não é uuid", () => {
    const result = checkoutInputSchema.safeParse({
      orderType: "pickup",
      items: [{ productId: "not-a-uuid", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita orderType desconhecido", () => {
    const result = checkoutInputSchema.safeParse({
      orderType: "invalid",
      items: [validItem],
    });
    expect(result.success).toBe(false);
  });

  it("aceita os três tipos de pedido", () => {
    for (const orderType of ["pickup", "delivery", "dine_in"]) {
      expect(
        checkoutInputSchema.safeParse({ orderType, items: [validItem] })
          .success,
      ).toBe(true);
    }
  });

  it("aceita nome, observação e observação de item opcionais", () => {
    const result = checkoutInputSchema.safeParse({
      orderType: "delivery",
      customerName: "Ana",
      notes: "Sem talheres",
      items: [{ ...validItem, notes: "Sem cebola" }],
    });
    expect(result.success).toBe(true);
  });
});
