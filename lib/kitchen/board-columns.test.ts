import { describe, expect, it } from "vitest";

import {
  KITCHEN_VISUAL_COLUMNS,
  columnOfStatus,
  resolveDropPath,
} from "@/lib/kitchen/board-columns";
import type { OrderStatus } from "@/types/domain";

describe("columnOfStatus", () => {
  it("agrupa new e accepted na coluna Novo", () => {
    expect(columnOfStatus("new")).toBe("incoming");
    expect(columnOfStatus("accepted")).toBe("incoming");
  });

  it("mapeia preparing, ready e delivered 1:1", () => {
    expect(columnOfStatus("preparing")).toBe("preparing");
    expect(columnOfStatus("ready")).toBe("ready");
    expect(columnOfStatus("delivered")).toBe("done");
  });

  it("completed e cancelled ficam fora do board", () => {
    expect(columnOfStatus("completed")).toBeNull();
    expect(columnOfStatus("cancelled")).toBeNull();
  });
});

describe("resolveDropPath", () => {
  it("new -> Em preparo é um caminho de 2 passos (accepted, preparing)", () => {
    expect(resolveDropPath("new", "preparing")).toEqual([
      "accepted",
      "preparing",
    ]);
  });

  it("accepted -> Em preparo é um único passo", () => {
    expect(resolveDropPath("accepted", "preparing")).toEqual(["preparing"]);
  });

  it("preparing -> Pronto é um único passo", () => {
    expect(resolveDropPath("preparing", "ready")).toEqual(["ready"]);
  });

  it("ready -> Finalizado é um único passo (delivered)", () => {
    expect(resolveDropPath("ready", "done")).toEqual(["delivered"]);
  });

  it("rejeita pular uma coluna visual (new -> Pronto)", () => {
    expect(resolveDropPath("new", "ready")).toBeNull();
  });

  it("rejeita pular duas colunas visuais (new -> Finalizado)", () => {
    expect(resolveDropPath("new", "done")).toBeNull();
  });

  it("rejeita pular uma coluna visual (preparing -> Finalizado)", () => {
    expect(resolveDropPath("preparing", "done")).toBeNull();
  });

  it("rejeita retroceder", () => {
    expect(resolveDropPath("ready", "preparing")).toBeNull();
    expect(resolveDropPath("delivered", "incoming")).toBeNull();
    expect(resolveDropPath("preparing", "incoming")).toBeNull();
  });

  it("retorna null ao soltar na própria coluna (no-op)", () => {
    expect(resolveDropPath("new", "incoming")).toBeNull();
    expect(resolveDropPath("accepted", "incoming")).toBeNull();
    expect(resolveDropPath("preparing", "preparing")).toBeNull();
  });

  it("delivered não tem próxima coluna visual (Finalizar é ação separada, não drag)", () => {
    for (const column of KITCHEN_VISUAL_COLUMNS) {
      expect(resolveDropPath("delivered", column.id)).toBeNull();
    }
  });

  it("completed e cancelled nunca produzem um caminho (fora do board)", () => {
    const terminal: OrderStatus[] = ["completed", "cancelled"];
    for (const status of terminal) {
      for (const column of KITCHEN_VISUAL_COLUMNS) {
        expect(resolveDropPath(status, column.id)).toBeNull();
      }
    }
  });

  it("cobre todas as combinações de status ativo x coluna alvo sem lançar", () => {
    const activeStatuses: OrderStatus[] = [
      "new",
      "accepted",
      "preparing",
      "ready",
      "delivered",
    ];
    for (const status of activeStatuses) {
      for (const column of KITCHEN_VISUAL_COLUMNS) {
        expect(() => resolveDropPath(status, column.id)).not.toThrow();
      }
    }
  });
});
