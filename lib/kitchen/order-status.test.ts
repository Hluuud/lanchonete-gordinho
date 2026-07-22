import { describe, expect, it } from "vitest";

import {
  ALLOWED_TRANSITIONS,
  isValidTransition,
  nextForwardStatus,
} from "@/lib/kitchen/order-status";
import type { OrderStatus } from "@/types/domain";

describe("isValidTransition", () => {
  it("permite o fluxo linear completo", () => {
    expect(isValidTransition("new", "accepted")).toBe(true);
    expect(isValidTransition("accepted", "preparing")).toBe(true);
    expect(isValidTransition("preparing", "ready")).toBe(true);
    expect(isValidTransition("ready", "delivered")).toBe(true);
    expect(isValidTransition("delivered", "completed")).toBe(true);
  });

  it("permite cancelar em qualquer etapa antes de entregue", () => {
    expect(isValidTransition("new", "cancelled")).toBe(true);
    expect(isValidTransition("accepted", "cancelled")).toBe(true);
    expect(isValidTransition("preparing", "cancelled")).toBe(true);
    expect(isValidTransition("ready", "cancelled")).toBe(true);
  });

  it("não permite cancelar um pedido já entregue", () => {
    expect(isValidTransition("delivered", "cancelled")).toBe(false);
  });

  it("não permite pular etapas", () => {
    expect(isValidTransition("new", "preparing")).toBe(false);
    expect(isValidTransition("new", "ready")).toBe(false);
    expect(isValidTransition("accepted", "delivered")).toBe(false);
  });

  it("não permite transições a partir de estados terminais", () => {
    expect(ALLOWED_TRANSITIONS.completed).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS.cancelled).toHaveLength(0);
  });

  it("não permite voltar no fluxo", () => {
    expect(isValidTransition("preparing", "accepted")).toBe(false);
    expect(isValidTransition("ready", "preparing")).toBe(false);
  });
});

describe("nextForwardStatus", () => {
  it("retorna o próximo status do fluxo linear, ignorando cancelamento", () => {
    const expected: Record<OrderStatus, OrderStatus | null> = {
      new: "accepted",
      accepted: "preparing",
      preparing: "ready",
      ready: "delivered",
      delivered: "completed",
      completed: null,
      cancelled: null,
    };

    for (const [status, next] of Object.entries(expected) as [
      OrderStatus,
      OrderStatus | null,
    ][]) {
      expect(nextForwardStatus(status)).toBe(next);
    }
  });
});
