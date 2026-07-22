import { describe, expect, it } from "vitest";

import {
  formatCentsToBRL,
  formatElapsedTime,
  formatMinutes,
} from "@/utils/format";

describe("formatCentsToBRL", () => {
  // Intl.NumberFormat("pt-BR") separa o símbolo do valor com NBSP (U+00A0).
  it("formata centavos em Real", () => {
    expect(formatCentsToBRL(1990)).toBe("R$ 19,90");
    expect(formatCentsToBRL(0)).toBe("R$ 0,00");
  });
});

describe("formatMinutes", () => {
  it("formata minutos em rótulo curto", () => {
    expect(formatMinutes(20)).toBe("20 min");
  });
});

describe("formatElapsedTime", () => {
  const now = new Date("2026-07-22T12:30:00.000Z");

  it("retorna 'agora' para menos de 1 minuto", () => {
    const since = new Date("2026-07-22T12:29:30.000Z");
    expect(formatElapsedTime(since, now)).toBe("agora");
  });

  it("formata minutos abaixo de 1 hora", () => {
    const since = new Date("2026-07-22T12:22:00.000Z");
    expect(formatElapsedTime(since, now)).toBe("8 min");
  });

  it("formata horas cheias sem minutos", () => {
    const since = new Date("2026-07-22T10:30:00.000Z");
    expect(formatElapsedTime(since, now)).toBe("2h");
  });

  it("formata horas e minutos", () => {
    const since = new Date("2026-07-22T11:18:00.000Z");
    expect(formatElapsedTime(since, now)).toBe("1h 12min");
  });

  it("aceita string ISO diretamente", () => {
    expect(formatElapsedTime("2026-07-22T12:22:00.000Z", now)).toBe("8 min");
  });

  it("nunca retorna tempo negativo (relógios levemente dessincronizados)", () => {
    const future = new Date("2026-07-22T12:31:00.000Z");
    expect(formatElapsedTime(future, now)).toBe("agora");
  });
});
