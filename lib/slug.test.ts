import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("minusculiza e troca espaços por hífen", () => {
    expect(slugify("Hambúrgueres")).toBe("hamburgueres");
    expect(slugify("Porções Especiais")).toBe("porcoes-especiais");
  });

  it("remove caracteres que não são letras/números", () => {
    expect(slugify("Combo & Extras!")).toBe("combo-extras");
  });

  it("colapsa hífens consecutivos e remove das bordas", () => {
    expect(slugify("  --Molhos---Especiais--  ")).toBe("molhos-especiais");
  });

  it("mantém números", () => {
    expect(slugify("Top 10 Lanches")).toBe("top-10-lanches");
  });
});
