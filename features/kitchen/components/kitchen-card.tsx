"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Flame, GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/features/kitchen/components/order-status-badge";
import { useElapsedMinutes } from "@/features/kitchen/use-elapsed-minutes";
import { useElapsedTime } from "@/features/kitchen/use-elapsed-time";
import { useKitchenOrders } from "@/features/kitchen/use-kitchen-orders";
import { getUrgencyFromMinutes } from "@/features/kitchen/urgency";
import { cn } from "@/lib/utils";
import {
  ALLOWED_TRANSITIONS,
  ORDER_ADVANCE_ACTION_LABELS,
  ORDER_TYPE_LABELS,
  isOrderLate,
  nextForwardStatus,
} from "@/lib/kitchen/order-status";
import type { Order } from "@/types/domain";

const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const URGENCY_BORDER = {
  normal: "border-border",
  warning: "border-warning",
  critical: "border-destructive",
} as const;

const URGENCY_TEXT = {
  normal: "text-muted-foreground",
  warning: "text-warning",
  critical: "text-destructive",
} as const;

function KitchenCardComponent({ order }: { order: Order }) {
  const { changeStatus, setPriority } = useKitchenOrders();
  const elapsedLabel = useElapsedTime(order.createdAt);
  const elapsedMinutes = useElapsedMinutes(order.createdAt);
  const urgency = getUrgencyFromMinutes(elapsedMinutes);
  const late = isOrderLate(order);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: order.id });

  const advanceLabel = ORDER_ADVANCE_ACTION_LABELS[order.status];
  const advanceTo = nextForwardStatus(order.status);
  const canCancel = ALLOWED_TRANSITIONS[order.status].includes("cancelled");
  // Pedido já entregue: prioridade na cozinha não tem mais efeito operacional.
  const showPriorityToggle = order.status !== "delivered";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-xl border-2 bg-card p-4 shadow-sm transition-shadow",
        URGENCY_BORDER[urgency],
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-4xl leading-none font-black tabular-nums">
          #{order.orderNumber ?? "—"}
        </span>
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label={`Arrastar pedido #${order.orderNumber ?? ""}`}
          className="touch-none rounded p-2 text-muted-foreground hover:bg-secondary active:cursor-grabbing"
        >
          <GripVertical className="size-5" aria-hidden />
        </button>
      </div>

      <div
        className={cn(
          "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold",
          URGENCY_TEXT[urgency],
        )}
      >
        <span>{TIME_FORMAT.format(new Date(order.createdAt))}</span>
        <span>há {elapsedLabel}</span>
        {order.estimatedReadyAt && (
          <span className="text-muted-foreground">
            previsto {TIME_FORMAT.format(new Date(order.estimatedReadyAt))}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <OrderStatusBadge status={order.status} />
        <Badge variant="outline">{ORDER_TYPE_LABELS[order.orderType]}</Badge>
        {order.isPriority && <Badge variant="accent">Prioridade</Badge>}
        {late && (
          <Badge variant="warning" className="motion-safe:animate-pulse">
            Atrasado
          </Badge>
        )}
      </div>

      <ul className="mt-3 flex flex-col gap-1.5 text-base">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="font-bold tabular-nums">{item.quantity}x</span>{" "}
            {item.productName}
            {item.notes && (
              <span className="block pl-6 text-sm text-warning">
                Obs.: {item.notes}
              </span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-2 rounded-md bg-muted p-2 text-sm text-foreground">
          {order.notes}
        </p>
      )}

      {order.customerName && (
        <p className="mt-2 truncate text-sm font-medium">
          {order.customerName}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {showPriorityToggle && (
          <Button
            size="md"
            variant="ghost"
            onClick={() => setPriority(order.id, !order.isPriority)}
            className="min-h-12"
          >
            <Flame className="size-4" aria-hidden />
            {order.isPriority ? "Remover prioridade" : "Prioridade"}
          </Button>
        )}
        {canCancel && (
          <Button
            size="md"
            variant="outline"
            onClick={() => changeStatus(order.id, "cancelled")}
            className="min-h-12"
          >
            Cancelar
          </Button>
        )}
        {advanceLabel && advanceTo && (
          <Button
            size="md"
            onClick={() => changeStatus(order.id, advanceTo)}
            className="min-h-12 flex-1 text-base"
          >
            {advanceLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Memoizado — o board pode ter dezenas de cards; evita re-render de cards não afetados por uma mudança pontual. */
export const KitchenCard = memo(KitchenCardComponent);
