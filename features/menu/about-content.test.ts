import { describe, expect, it } from "vitest";

import {
  ABOUT_TIMELINE,
  hasTimeline,
  sortAboutTimeline,
  type AboutTimelineEntry,
} from "@/features/menu/about-content";

function entry(
  overrides: Partial<AboutTimelineEntry> = {},
): AboutTimelineEntry {
  return {
    year: "2020",
    title: "Marco",
    description: "Descrição",
    ...overrides,
  };
}

describe("hasTimeline", () => {
  it("é false enquanto ABOUT_TIMELINE estiver vazia (estado atual do repo)", () => {
    expect(hasTimeline(ABOUT_TIMELINE)).toBe(false);
    expect(hasTimeline()).toBe(false);
  });

  it("é true com pelo menos uma entrada", () => {
    expect(hasTimeline([entry()])).toBe(true);
  });
});

describe("sortAboutTimeline", () => {
  it("ordena por ano ascendente, independente da ordem de entrada", () => {
    const sorted = sortAboutTimeline([
      entry({ year: "2022", title: "C" }),
      entry({ year: "2018", title: "A" }),
      entry({ year: "2020", title: "B" }),
    ]);

    expect(sorted.map((item) => item.title)).toEqual(["A", "B", "C"]);
  });

  it("não muta o array original", () => {
    const original = [entry({ year: "2022" }), entry({ year: "2018" })];
    const originalCopy = [...original];

    sortAboutTimeline(original);

    expect(original).toEqual(originalCopy);
  });

  it("volta lista vazia sem entradas", () => {
    expect(sortAboutTimeline([])).toEqual([]);
  });
});
