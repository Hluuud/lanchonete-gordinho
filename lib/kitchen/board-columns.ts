import { nextForwardStatus } from "@/lib/kitchen/order-status";
import type { OrderStatus } from "@/types/domain";

export type KitchenVisualColumnId = "incoming" | "preparing" | "ready" | "done";

/**
 * As 4 colunas visuais do painel industrial da cozinha, agrupando os 7
 * status reais da máquina de estados (`lib/kitchen/order-status.ts`, que
 * permanece intocada). "Novo" funde `new`+`accepted` — para o cozinheiro,
 * ambos significam "ainda não começou a fritar". `completed` e `cancelled`
 * ficam fora do board (ver `docs/kitchen-panel.md`): finalizado sai por
 * auto-hide, cancelado só aparece no filtro dedicado.
 */
export const KITCHEN_VISUAL_COLUMNS: {
  id: KitchenVisualColumnId;
  title: string;
  statuses: OrderStatus[];
}[] = [
  { id: "incoming", title: "Novo", statuses: ["new", "accepted"] },
  { id: "preparing", title: "Em preparo", statuses: ["preparing"] },
  { id: "ready", title: "Pronto", statuses: ["ready"] },
  { id: "done", title: "Finalizado", statuses: ["delivered"] },
];

/** Coluna visual que contém o status, ou `null` (completed/cancelled — fora do board). */
export function columnOfStatus(status: OrderStatus): KitchenVisualColumnId | null {
  return (
    KITCHEN_VISUAL_COLUMNS.find((column) => column.statuses.includes(status))
      ?.id ?? null
  );
}

/**
 * Caminho de status reais (na ordem em que os PATCHes devem ser aplicados)
 * para levar um pedido em `from` até a coluna visual `targetColumnId`,
 * arrastado no board.
 *
 * Só aceita mover exatamente UMA coluna visual para frente — soltar em
 * "Pronto" vindo de "Novo" pula "Em preparo" e é rejeitado, mesmo que a
 * cadeia de transições reais fosse tecnicamente válida passo a passo, porque
 * a operação enganaria o cozinheiro sobre o que está acontecendo. Retrocessos
 * e drops na própria coluna também retornam `null` — a UI trata como drop
 * inválido (toast) ou no-op.
 */
export function resolveDropPath(
  from: OrderStatus,
  targetColumnId: KitchenVisualColumnId,
): OrderStatus[] | null {
  const fromColumnIndex = KITCHEN_VISUAL_COLUMNS.findIndex((column) =>
    column.statuses.includes(from),
  );
  if (fromColumnIndex === -1) return null;

  const targetColumnIndex = KITCHEN_VISUAL_COLUMNS.findIndex(
    (column) => column.id === targetColumnId,
  );
  if (targetColumnIndex !== fromColumnIndex + 1) return null;

  const targetStatuses = KITCHEN_VISUAL_COLUMNS[targetColumnIndex].statuses;

  const path: OrderStatus[] = [];
  let current = from;
  // Cadeia linear de status tem no máximo 6 elos (new..completed) — 6 é uma
  // margem segura contra qualquer loop acidental.
  for (let step = 0; step < 6; step++) {
    const next = nextForwardStatus(current);
    if (!next) return null;
    path.push(next);
    if (targetStatuses.includes(next)) return path;
    current = next;
  }
  return null;
}
