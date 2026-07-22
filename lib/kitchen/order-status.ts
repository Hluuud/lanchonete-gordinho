import type { Order, OrderStatus, OrderType } from "@/types/domain";

/** Status em que "atrasado" ainda é uma preocupação operacional (depois de entregue, não importa mais). */
const LATE_ELIGIBLE_STATUSES: OrderStatus[] = ["new", "accepted", "preparing"];

/** Pedido passou do tempo estimado e ainda está em preparo — usado pelo filtro "Em atraso" e pelo destaque visual do card. */
export function isOrderLate(order: Order, now: Date = new Date()): boolean {
  if (!order.estimatedReadyAt) return false;
  if (!LATE_ELIGIBLE_STATUSES.includes(order.status)) return false;
  return now.getTime() > new Date(order.estimatedReadyAt).getTime();
}

/**
 * Máquina de estados do pedido — regra de negócio central do Painel da
 * Cozinha (CLAUDE.md #1: regra de negócio nunca decidida pela interface).
 * O client só oferece como opção as transições listadas aqui; o serviço
 * (`services/kitchen-orders.service.ts`) sempre revalida antes de escrever.
 *
 * Fluxo linear novo→aceito→preparo→pronto→entregue→finalizado, com
 * cancelamento possível em qualquer etapa até "pronto" (uma vez entregue ao
 * cliente, não faz sentido operacional cancelar).
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Nomeia a coluna de timestamp que registra a entrada em cada status (exceto "new", coberto por `created_at`). */
export const STATUS_TIMESTAMP_COLUMN: Partial<
  Record<
    OrderStatus,
    | "accepted_at"
    | "preparing_at"
    | "ready_at"
    | "delivered_at"
    | "completed_at"
    | "cancelled_at"
  >
> = {
  accepted: "accepted_at",
  preparing: "preparing_at",
  ready: "ready_at",
  delivered: "delivered_at",
  completed: "completed_at",
  cancelled: "cancelled_at",
};

/**
 * As 6 colunas do Kanban, em ordem. "completed" não é coluna: pedidos
 * entregues são arquivados (botão "Finalizar") e saem do board ativo — ver
 * `docs/kitchen-panel.md`.
 */
export const KITCHEN_BOARD_COLUMNS: OrderStatus[] = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Novo Pedido",
  accepted: "Aceito",
  preparing: "Em Preparo",
  ready: "Pronto",
  delivered: "Entregue",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

/** Rótulo do botão de ação que avança o pedido para o próximo status (null quando não há avanço, ex.: terminal). */
export const ORDER_ADVANCE_ACTION_LABELS: Partial<Record<OrderStatus, string>> =
  {
    new: "Aceitar",
    accepted: "Iniciar preparo",
    preparing: "Marcar pronto",
    ready: "Entregar",
    delivered: "Finalizar",
  };

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  pickup: "Retirada",
  delivery: "Entrega",
};

/** Chave de variante de cor por status, mapeada para os tokens do design system (`Badge`, colunas). */
export const ORDER_STATUS_COLOR: Record<
  OrderStatus,
  "primary" | "accent" | "success" | "warning" | "secondary" | "outline"
> = {
  new: "primary",
  accepted: "accent",
  preparing: "warning",
  ready: "success",
  delivered: "secondary",
  completed: "outline",
  cancelled: "outline",
};

/** Próximo status "para frente" no fluxo linear (ignora cancelamento) — usado pelo botão de ação do card. */
export function nextForwardStatus(status: OrderStatus): OrderStatus | null {
  const candidates = ALLOWED_TRANSITIONS[status].filter(
    (candidate) => candidate !== "cancelled",
  );
  return candidates[0] ?? null;
}
