import { describe, expect, it } from "vitest";

import { alphaFromDistance, distanceToWhite } from "./chroma-key.mjs";

describe("chroma-key", () => {
  it("distância zero para branco puro", () => {
    expect(distanceToWhite(255, 255, 255)).toBe(0);
  });

  it("distância máxima para preto puro", () => {
    expect(distanceToWhite(0, 0, 0)).toBeCloseTo(441.67, 1);
  });

  it("alfa zero dentro do limiar interno (fundo)", () => {
    expect(alphaFromDistance(5)).toBe(0);
    expect(alphaFromDistance(12)).toBe(0);
  });

  it("alfa máximo fora do limiar externo (conteúdo opaco)", () => {
    expect(alphaFromDistance(60)).toBe(255);
    expect(alphaFromDistance(200)).toBe(255);
  });

  it("interpola linearmente na faixa de pena (feather)", () => {
    expect(alphaFromDistance(36, 12, 60)).toBe(128);
  });
});
