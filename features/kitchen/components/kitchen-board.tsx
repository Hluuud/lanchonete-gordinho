"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KitchenColumn } from "@/features/kitchen/components/kitchen-column";
import { KitchenFilters } from "@/features/kitchen/components/kitchen-filters";
import { KitchenHeader } from "@/features/kitchen/components/kitchen-header";
import {
  matchesKitchenFilter,
  matchesKitchenQuery,
  type KitchenFilter,
} from "@/features/kitchen/kitchen-filters-utils";
import { KitchenOrdersProvider } from "@/features/kitchen/kitchen-orders-context";
import { useKitchenOrders } from "@/features/kitchen/use-kitchen-orders";
import { useKitchenRealtime } from "@/features/kitchen/use-kitchen-realtime";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  KITCHEN_BOARD_COLUMNS,
  ORDER_STATUS_LABELS,
  isValidTransition,
} from "@/lib/kitchen/order-status";
import type { Order, OrderStatus } from "@/types/domain";

const SEARCH_DEBOUNCE_MS = 250;
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Orquestra o Painel da Cozinha: dados vêm já carregados do servidor
 * (`initialOrders`) e passam a ser atualizados por Realtime a partir daqui
 * (`KitchenOrdersProvider` + `useKitchenRealtime`, ver `docs/kitchen-panel.md`).
 */
export function KitchenBoard({
  initialOrders,
  tenantId,
}: {
  initialOrders: Order[];
  tenantId: string;
}) {
  return (
    <KitchenOrdersProvider initialOrders={initialOrders}>
      <KitchenBoardContent tenantId={tenantId} />
    </KitchenOrdersProvider>
  );
}

function KitchenBoardContent({ tenantId }: { tenantId: string }) {
  const { orders, changeStatus } = useKitchenOrders();
  const connectionStatus = useKitchenRealtime(tenantId);

  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery] = useDebounce(rawQuery, SEARCH_DEBOUNCE_MS);
  const [filter, setFilter] = useState<KitchenFilter>("all");
  const [mobileColumn, setMobileColumn] = useState<OrderStatus>("new");

  const isMobile = useMediaQuery(MOBILE_QUERY);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          matchesKitchenFilter(order, filter) &&
          matchesKitchenQuery(order, debouncedQuery),
      ),
    [orders, filter, debouncedQuery],
  );

  const ordersByStatus = useMemo(() => {
    const map = new Map<OrderStatus, Order[]>(
      KITCHEN_BOARD_COLUMNS.map((status) => [status, []]),
    );
    for (const order of filteredOrders) {
      map.get(order.status)?.push(order);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
    return map;
  }, [filteredOrders]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const order = orders.find(
      (candidate) => candidate.id === String(active.id),
    );
    const targetStatus = String(over.id) as OrderStatus;
    if (!order || order.status === targetStatus) return;

    if (!isValidTransition(order.status, targetStatus)) {
      toast.error(
        `Não é possível mover de "${ORDER_STATUS_LABELS[order.status]}" para "${ORDER_STATUS_LABELS[targetStatus]}".`,
      );
      return;
    }

    void changeStatus(order.id, targetStatus);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <KitchenHeader connectionStatus={connectionStatus} />
      <KitchenFilters
        filter={filter}
        onFilterChange={setFilter}
        query={rawQuery}
        onQueryChange={setRawQuery}
      />

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {isMobile ? (
          <Tabs
            value={mobileColumn}
            onValueChange={(value) => setMobileColumn(value as OrderStatus)}
          >
            <TabsList className="w-full flex-wrap">
              {KITCHEN_BOARD_COLUMNS.map((status) => (
                <TabsTrigger key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]} (
                  {ordersByStatus.get(status)?.length ?? 0})
                </TabsTrigger>
              ))}
            </TabsList>
            {KITCHEN_BOARD_COLUMNS.map((status) => (
              <TabsContent key={status} value={status}>
                <KitchenColumn
                  status={status}
                  orders={ordersByStatus.get(status) ?? []}
                  className="w-full"
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex flex-1 snap-x gap-4 overflow-x-auto pb-4">
            {KITCHEN_BOARD_COLUMNS.map((status) => (
              <KitchenColumn
                key={status}
                status={status}
                orders={ordersByStatus.get(status) ?? []}
              />
            ))}
          </div>
        )}
      </DndContext>
    </div>
  );
}
