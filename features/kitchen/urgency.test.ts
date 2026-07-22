import { describe, expect, it } from "vitest";

import { getUrgencyFromMinutes } from "@/features/kitchen/urgency";

describe("getUrgencyFromMinutes", () => {
  it("normal abaixo do limiar de aviso", () => {
    expect(getUrgencyFromMinutes(0)).toBe("normal");
    expect(getUrgencyFromMinutes(9)).toBe("normal");
  });

  it("warning a partir do limiar de aviso", () => {
    expect(getUrgencyFromMinutes(10)).toBe("warning");
    expect(getUrgencyFromMinutes(19)).toBe("warning");
  });

  it("critical a partir do limiar crítico", () => {
    expect(getUrgencyFromMinutes(20)).toBe("critical");
    expect(getUrgencyFromMinutes(120)).toBe("critical");
  });
});
