import { describe, expect, it } from "vitest";

import {
  getAverageMenuPrepTimeMinutes,
  getStoreOpenState,
  type DayHours,
} from "@/features/menu/store-info";
import type { Menu, Product } from "@/types/domain";

/** Terça = dia 2; 2026-07-21 foi uma terça. */
function tuesdayAt(hhmm: string): Date {
  return new Date(`2026-07-21T${hhmm}:00`);
}

const HOURS: Record<number, DayHours> = {
  0: null,
  1: null,
  2: { open: "18:00", close: "23:00" },
  3: { open: "18:00", close: "02:00" }, // quarta cruza a meia-noite
  4: null,
  5: null,
  6: null,
};

describe("getStoreOpenState", () => {
  it("aberto dentro da janela do dia", () => {
    const state = getStoreOpenState(tuesdayAt("19:30"), HOURS);
    expect(state.isOpen).toBe(true);
    expect(state.label).toBe("Aberto até 23:00");
  });

  it("fechado antes de abrir, informando o horário de abertura", () => {
    const state = getStoreOpenState(tuesdayAt("10:00"), HOURS);
    expect(state.isOpen).toBe(false);
    expect(state.label).toBe("Abre às 18:00");
  });

  it("fechado após o fechamento", () => {
    const state = getStoreOpenState(tuesdayAt("23:30"), HOURS);
    expect(state.isOpen).toBe(false);
  });

  it("fechado o dia todo quando o dia é null", () => {
    const monday = new Date("2026-07-20T19:00:00");
    const state = getStoreOpenState(monday, HOURS);
    expect(state.isOpen).toBe(false);
    expect(state.label).toBe("Fechado hoje");
  });

  it("janela que cruza a meia-noite permanece aberta na madrugada seguinte", () => {
    // Quarta abre 18:00 e fecha 02:00 de quinta.
    const wednesdayNight = new Date("2026-07-22T23:00:00");
    expect(getStoreOpenState(wednesdayNight, HOURS).isOpen).toBe(true);

    const thursdayEarly = new Date("2026-07-23T01:30:00");
    const state = getStoreOpenState(thursdayEarly, HOURS);
    expect(state.isOpen).toBe(true);
    expect(state.label).toBe("Aberto até 02:00");

    const thursdayAfterClose = new Date("2026-07-23T02:30:00");
    expect(getStoreOpenState(thursdayAfterClose, HOURS).isOpen).toBe(false);
  });
});

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    categoryId: "c1",
    name: "X-Burger",
    description: null,
    priceCents: 2500,
    imageUrl: null,
    prepTimeMinutes: 15,
    isAvailable: true,
    badges: { isFeatured: false, isNew: false },
    rating: null,
    ...overrides,
  };
}

function makeMenu(products: Product[]): Menu {
  return {
    tenant: { id: "t1", slug: "gordinho", name: "Lanchonete do Gordinho" },
    categories: [{ id: "c1", name: "Lanches", slug: "lanches", products }],
  };
}

describe("getAverageMenuPrepTimeMinutes", () => {
  it("média arredondada ao múltiplo de 5 mais próximo", () => {
    const menu = makeMenu([
      makeProduct({ id: "p1", prepTimeMinutes: 10 }),
      makeProduct({ id: "p2", prepTimeMinutes: 25 }),
    ]);
    // média 17.5 → 20 (Math.round(3.5) = 4)
    expect(getAverageMenuPrepTimeMinutes(menu)).toBe(20);
  });

  it("ignora produtos indisponíveis e sem tempo de preparo", () => {
    const menu = makeMenu([
      makeProduct({ id: "p1", prepTimeMinutes: 30, isAvailable: false }),
      makeProduct({ id: "p2", prepTimeMinutes: 0 }),
      makeProduct({ id: "p3", prepTimeMinutes: 10 }),
    ]);
    expect(getAverageMenuPrepTimeMinutes(menu)).toBe(10);
  });

  it("nunca retorna menos de 5 minutos", () => {
    const menu = makeMenu([makeProduct({ id: "p1", prepTimeMinutes: 2 })]);
    expect(getAverageMenuPrepTimeMinutes(menu)).toBe(5);
  });

  it("retorna null sem produtos elegíveis", () => {
    expect(getAverageMenuPrepTimeMinutes(makeMenu([]))).toBeNull();
  });
});
