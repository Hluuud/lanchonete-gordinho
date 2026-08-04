import { describe, expect, it } from "vitest";

import {
  categoryDescription,
  DESCRIBED_CATEGORY_SLUGS,
} from "@/features/menu/category-content";

describe("categoryDescription", () => {
  it("descreve as seções virtuais, que sempre existem quando há badges", () => {
    expect(categoryDescription("destaques")).toBeTruthy();
    expect(categoryDescription("novidades")).toBeTruthy();
  });

  it("cobre as categorias reais do cardápio da loja", () => {
    for (const slug of ["lanches", "pasteis", "porcoes", "bebidas"]) {
      expect(categoryDescription(slug)).toBeTruthy();
    }
  });

  it("devolve null para categoria desconhecida, em vez de um texto genérico", () => {
    expect(categoryDescription("categoria-que-nao-existe")).toBeNull();
  });

  it("nenhuma descrição é vazia ou só espaço", () => {
    for (const slug of DESCRIBED_CATEGORY_SLUGS) {
      expect(categoryDescription(slug)?.trim()).not.toBe("");
    }
  });
});
