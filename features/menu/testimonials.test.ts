import { describe, expect, it } from "vitest";

import {
  averageRating,
  hasTestimonials,
  isValidRating,
  TESTIMONIALS,
  type Testimonial,
} from "@/features/menu/testimonials";

function testimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    id: "1",
    name: "Cliente",
    rating: 5,
    comment: "Muito bom",
    ...overrides,
  };
}

describe("hasTestimonials", () => {
  it("é false enquanto TESTIMONIALS estiver vazia (estado atual do repo)", () => {
    expect(hasTestimonials(TESTIMONIALS)).toBe(false);
    expect(hasTestimonials()).toBe(false);
  });

  it("é true com pelo menos um depoimento", () => {
    expect(hasTestimonials([testimonial()])).toBe(true);
  });
});

describe("isValidRating", () => {
  it("aceita inteiros de 1 a 5", () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(isValidRating(rating)).toBe(true);
    }
  });

  it("rejeita fora da faixa e não-inteiros", () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(3.5)).toBe(false);
    expect(isValidRating(-1)).toBe(false);
  });
});

describe("averageRating", () => {
  it("volta null sem depoimentos", () => {
    expect(averageRating([])).toBeNull();
  });

  it("calcula a média arredondada a 1 casa decimal", () => {
    const items = [
      testimonial({ rating: 5 }),
      testimonial({ rating: 4 }),
      testimonial({ rating: 5 }),
    ];

    expect(averageRating(items)).toBeCloseTo(4.7, 1);
  });
});
