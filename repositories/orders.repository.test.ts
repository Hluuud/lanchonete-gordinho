import { describe, expect, it } from "vitest";

import {
  OrderCreationError,
  createOrder,
} from "@/repositories/orders.repository";

function fakeClientReturning(response: unknown) {
  return {
    rpc: async () => response,
  } as unknown as Parameters<typeof createOrder>[0];
}

const baseInput = {
  tenantId: "11111111-1111-1111-1111-111111111111",
  orderType: "pickup" as const,
  customerName: "Ana",
  customerPhone: null,
  notes: null,
  items: [
    {
      productId: "22222222-2222-2222-2222-222222222222",
      quantity: 1,
      notes: null,
    },
  ],
};

describe("createOrder", () => {
  it("retorna o pedido quando a RPC não tem erro", async () => {
    const order = { id: "order-1", order_number: 1 };
    const client = fakeClientReturning({ data: order, error: null });

    const result = await createOrder(client, baseInput);

    expect(result).toEqual(order);
  });

  it("lança OrderCreationError com a code do errcode do Postgres em pedido vazio", async () => {
    const client = fakeClientReturning({
      data: null,
      error: { message: "Pedido sem itens.", code: "P0001" },
    });

    await expect(
      createOrder(client, { ...baseInput, items: [] }),
    ).rejects.toMatchObject({ code: "P0001" });
  });

  it("lança OrderCreationError para produto inválido/indisponível", async () => {
    const client = fakeClientReturning({
      data: null,
      error: { message: "Produto inválido ou indisponível.", code: "P0002" },
    });

    await expect(createOrder(client, baseInput)).rejects.toBeInstanceOf(
      OrderCreationError,
    );
    await expect(createOrder(client, baseInput)).rejects.toMatchObject({
      code: "P0002",
    });
  });

  it("lança OrderCreationError para quantidade inválida", async () => {
    const client = fakeClientReturning({
      data: null,
      error: { message: "Quantidade inválida.", code: "P0003" },
    });

    await expect(createOrder(client, baseInput)).rejects.toMatchObject({
      code: "P0003",
    });
  });

  it("usa 'unknown' quando o erro do Postgres não tem code", async () => {
    const client = fakeClientReturning({
      data: null,
      error: { message: "Falha inesperada." },
    });

    await expect(createOrder(client, baseInput)).rejects.toMatchObject({
      code: "unknown",
    });
  });
});
