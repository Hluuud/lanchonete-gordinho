import { describe, expect, it } from "vitest";

import {
  buildPaginated,
  getPageRange,
  parseListParams,
} from "@/features/admin/pagination";

const OPTIONS = {
  allowedSort: ["name", "price_cents"],
  defaultSort: "name",
} as const;

describe("parseListParams", () => {
  it("usa valores padrão quando searchParams está vazio", () => {
    expect(parseListParams({}, OPTIONS)).toEqual({
      page: 1,
      pageSize: 20,
      q: "",
      sort: "name",
      order: "asc",
    });
  });

  it("lê page/pageSize/q/sort/order válidos", () => {
    const result = parseListParams(
      { page: "3", pageSize: "10", q: "  burger  ", sort: "price_cents", order: "desc" },
      OPTIONS,
    );
    expect(result).toEqual({
      page: 3,
      pageSize: 10,
      q: "burger",
      sort: "price_cents",
      order: "desc",
    });
  });

  it("ignora page/pageSize inválidos ou negativos, caindo no padrão", () => {
    expect(parseListParams({ page: "-5", pageSize: "abc" }, OPTIONS)).toMatchObject({
      page: 1,
      pageSize: 20,
    });
    expect(parseListParams({ page: "0" }, OPTIONS)).toMatchObject({ page: 1 });
  });

  it("limita pageSize ao máximo (100)", () => {
    expect(parseListParams({ pageSize: "9999" }, OPTIONS)).toMatchObject({
      pageSize: 100,
    });
  });

  it("rejeita sort fora da allowlist, evitando SQL arbitrário", () => {
    expect(
      parseListParams({ sort: "drop table products;" }, OPTIONS),
    ).toMatchObject({ sort: "name" });
  });

  it("rejeita order fora de asc/desc", () => {
    expect(parseListParams({ order: "sideways" }, OPTIONS)).toMatchObject({
      order: "asc",
    });
  });

  it("usa o primeiro valor quando searchParams traz array (múltiplos query params)", () => {
    expect(parseListParams({ q: ["a", "b"] }, OPTIONS)).toMatchObject({ q: "a" });
  });

  it("respeita defaultOrder e pageSize customizados nas options", () => {
    const result = parseListParams(
      {},
      { ...OPTIONS, defaultOrder: "desc", pageSize: 5 },
    );
    expect(result).toMatchObject({ order: "desc", pageSize: 5 });
  });
});

describe("getPageRange", () => {
  it("calcula o intervalo inclusivo para a página 1", () => {
    expect(getPageRange(1, 20)).toEqual([0, 19]);
  });

  it("calcula o intervalo para páginas subsequentes", () => {
    expect(getPageRange(3, 10)).toEqual([20, 29]);
  });
});

describe("buildPaginated", () => {
  it("calcula totalPages arredondando para cima", () => {
    const result = buildPaginated(["a", "b"], 45, 2, 20);
    expect(result).toEqual({
      items: ["a", "b"],
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it("totalPages nunca é menor que 1, mesmo com total 0", () => {
    expect(buildPaginated([], 0, 1, 20).totalPages).toBe(1);
  });
});
