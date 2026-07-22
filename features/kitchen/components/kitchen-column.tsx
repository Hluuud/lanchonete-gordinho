"use client";

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { KitchenCard } from "@/features/kitchen/components/kitchen-card";
import { ORDER_STATUS_LABELS } from "@/lib/kitchen/order-status";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/domain";

export function KitchenColumn({
  status,
  orders,
  className,
}: {
  status: OrderStatus;
  orders: Order[];
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col gap-3 sm:w-80 2xl:w-96",
        className,
      )}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="font-semibold">{ORDER_STATUS_LABELS[status]}</h2>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground tabular-nums">
          {orders.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-3 rounded-xl border-2 border-dashed p-2 transition-colors",
          isOver ? "border-primary bg-primary/5" : "border-transparent",
        )}
      >
        <AnimatePresence initial={false}>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout={!shouldReduceMotion}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              <KitchenCard order={order} />
            </motion.div>
          ))}
        </AnimatePresence>

        {orders.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nenhum pedido
          </p>
        )}
      </div>
    </div>
  );
}
