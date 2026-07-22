"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Flame, GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useElapsedTime } from "@/features/kitchen/use-elapsed-time";
import { useKitchenOrders } from "@/features/kitchen/use-kitchen-orders";
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

function KitchenCardComponent({ order }: { order: Order }) {
  const { changeStatus, setPriority } = useKitchenOrders();
  const elapsed = useElapsedTime(order.createdAt);
  const late = isOrderLate(order);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: order.id });

  const advanceLabel = ORDER_ADVANCE_ACTION_LABELS[order.status];
  const advanceTo = nextForwardStatus(order.status);
  const canCancel = ALLOWED_TRANSITIONS[order.status].includes("cancelled");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm transition-shadow",
        late ? "border-warning" : "border-border",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg font-bold tabular-nums">
          #{order.orderNumber ?? "—"}
        </span>
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label={`Arrastar pedido #${order.orderNumber ?? ""}`}
          className="touch-none rounded p-1 text-muted-foreground hover:bg-secondary active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{TIME_FORMAT.format(new Date(order.createdAt))}</span>
        <span>há {elapsed}</span>
        {order.estimatedReadyAt && (
          <span>
            previsto {TIME_FORMAT.format(new Date(order.estimatedReadyAt))}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge variant="outline">{ORDER_TYPE_LABELS[order.orderType]}</Badge>
        {order.isPriority && <Badge variant="accent">Prioridade</Badge>}
        {late && (
          <Badge variant="warning" className="motion-safe:animate-pulse">
            Atrasado
          </Badge>
        )}
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-sm">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="font-medium tabular-nums">{item.quantity}x</span>{" "}
            {item.productName}
            {item.notes && (
              <span className="block pl-5 text-xs text-muted-foreground">
                Obs.: {item.notes}
              </span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-2 rounded-md bg-muted p-2 text-xs text-muted-foreground">
          {order.notes}
        </p>
      )}

      {order.customerName && (
        <p className="mt-2 truncate text-xs font-medium">
          {order.customerName}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPriority(order.id, !order.isPriority)}
        >
          <Flame className="size-4" aria-hidden />
          {order.isPriority ? "Remover prioridade" : "Prioridade"}
        </Button>
        {canCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => changeStatus(order.id, "cancelled")}
          >
            Cancelar
          </Button>
        )}
        {advanceLabel && advanceTo && (
          <Button size="sm" onClick={() => changeStatus(order.id, advanceTo)}>
            {advanceLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Memoizado — o board pode ter dezenas de cards; evita re-render de cards não afetados por uma mudança pontual. */
export const KitchenCard = memo(KitchenCardComponent);
