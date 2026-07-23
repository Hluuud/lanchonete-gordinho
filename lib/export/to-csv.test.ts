import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/export/to-csv";

describe("toCsv", () => {
  it("retorna string vazia para lista vazia", () => {
    expect(toCsv([])).toBe("");
  });

  it("gera cabeçalho e linhas na mesma ordem das chaves encontradas", () => {
    const csv = toCsv([{ name: "X-Gordinho", priceCents: 1990 }]);
    expect(csv).toBe("name,priceCents\nX-Gordinho,1990");
  });

  it("escapa vírgula, aspas e quebra de linha", () => {
    const csv = toCsv([{ note: 'sem cebola, "por favor"\nobrigado' }]);
    expect(csv).toBe('note\n"sem cebola, ""por favor""\nobrigado"');
  });

  it("serializa valores aninhados como JSON dentro da célula", () => {
    const csv = toCsv([{ items: [{ id: 1 }] }]);
    expect(csv).toBe('items\n"[{""id"":1}]"');
  });

  it("trata null/undefined como célula vazia", () => {
    const csv = toCsv([{ a: null, b: undefined, c: 1 }]);
    expect(csv).toBe("a,b,c\n,,1");
  });

  it("une o conjunto de chaves quando as linhas têm formas diferentes", () => {
    const csv = toCsv([{ a: 1 }, { b: 2 }]);
    expect(csv).toBe("a,b\n1,\n,2");
  });
});
