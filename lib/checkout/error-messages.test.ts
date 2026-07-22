import { describe, expect, it } from "vitest";

import { mapOrderCreationErrorMessage } from "@/lib/checkout/error-messages";

describe("mapOrderCreationErrorMessage", () => {
  it("mapeia P0001 (pedido vazio)", () => {
    expect(mapOrderCreationErrorMessage("P0001")).toBe(
      "O pedido precisa ter pelo menos um item.",
    );
  });

  it("mapeia P0002 (produto inválido/indisponível)", () => {
    expect(mapOrderCreationErrorMessage("P0002")).toBe(
      "Um dos produtos do pedido não está mais disponível.",
    );
  });

  it("mapeia P0003 (quantidade inválida)", () => {
    expect(mapOrderCreationErrorMessage("P0003")).toBe(
      "Quantidade inválida para um dos itens.",
    );
  });

  it("usa mensagem genérica para códigos desconhecidos", () => {
    expect(mapOrderCreationErrorMessage("unknown")).toBe(
      "Não foi possível criar o pedido. Tente novamente.",
    );
  });
});
