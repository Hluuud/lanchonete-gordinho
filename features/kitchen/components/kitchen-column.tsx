"use client";

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { KitchenCard } from "@/features/kitchen/components/kitchen-card";
import type { KitchenVisualColumnId } from "@/lib/kitchen/board-columns";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/domain";

/**
 * Coluna visual do board industrial (id ≠ status real — ver
 * `lib/kitchen/board-columns.ts`). Fluida (`flex-1`): com só 4 colunas,
 * cabem lado a lado sem scroll horizontal, mesmo em telas de TV.
 */
export function KitchenColumn({
  id,
  title,
  orders,
  className,
}: {
  id: KitchenVisualColumnId;
  title: string;
  orders: Order[];
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-3", className)}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-sm font-bold text-secondary-foreground tabular-nums">
          {orders.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-3 rounded-xl border-2 border-dashed p-2 transition-colors",
          isOver ? "border-primary bg-primary/10" : "border-border/60",
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
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Nenhum pedido
          </p>
        )}
      </div>
    </div>
  );
}
