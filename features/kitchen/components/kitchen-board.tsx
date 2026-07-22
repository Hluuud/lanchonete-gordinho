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

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancelledOrdersList } from "@/features/kitchen/components/cancelled-orders-list";
import { KitchenColumn } from "@/features/kitchen/components/kitchen-column";
import { KitchenFilters } from "@/features/kitchen/components/kitchen-filters";
import { KitchenHeader } from "@/features/kitchen/components/kitchen-header";
import { KITCHEN_DONE_AUTOHIDE_MS } from "@/features/kitchen/config";
import {
  matchesKitchenFilter,
  matchesKitchenQuery,
  type KitchenFilter,
} from "@/features/kitchen/kitchen-filters-utils";
import { KitchenOrdersProvider } from "@/features/kitchen/kitchen-orders-context";
import { useKitchenOrders } from "@/features/kitchen/use-kitchen-orders";
import { useKitchenRealtime } from "@/features/kitchen/use-kitchen-realtime";
import { useNowTick } from "@/features/kitchen/use-now-tick";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  KITCHEN_VISUAL_COLUMNS,
  columnOfStatus,
  resolveDropPath,
  type KitchenVisualColumnId,
} from "@/lib/kitchen/board-columns";
import type { Order } from "@/types/domain";

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
  const { orders, changeStatusPath } = useKitchenOrders();
  const connectionStatus = useKitchenRealtime(tenantId);
  const nowTick = useNowTick();

  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery] = useDebounce(rawQuery, SEARCH_DEBOUNCE_MS);
  const [filter, setFilter] = useState<KitchenFilter>("all");
  const [mobileColumn, setMobileColumn] =
    useState<KitchenVisualColumnId>("incoming");
  const [showHiddenDone, setShowHiddenDone] = useState(false);

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

  // `nowTick === 0` só ocorre no snapshot neutro de SSR/hidratação — nada
  // some até o primeiro tick real no client (`use-now-tick.ts`).
  const isAutoHidden = useMemo(() => {
    return (order: Order) =>
      nowTick !== 0 &&
      order.status === "delivered" &&
      order.deliveredAt !== null &&
      nowTick - new Date(order.deliveredAt).getTime() >
        KITCHEN_DONE_AUTOHIDE_MS;
  }, [nowTick]);

  const hiddenDoneCount = useMemo(() => {
    if (showHiddenDone) return 0;
    return filteredOrders.filter(isAutoHidden).length;
  }, [filteredOrders, isAutoHidden, showHiddenDone]);

  const ordersByColumn = useMemo(() => {
    const map = new Map<KitchenVisualColumnId, Order[]>(
      KITCHEN_VISUAL_COLUMNS.map((column) => [column.id, []]),
    );
    for (const order of filteredOrders) {
      const columnId = columnOfStatus(order.status);
      if (!columnId) continue; // completed/cancelled — fora do board

      if (!showHiddenDone && isAutoHidden(order)) continue; // oculto (o pedido continua "delivered" no servidor)

      map.get(columnId)?.push(order);
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
  }, [filteredOrders, showHiddenDone, isAutoHidden]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const order = orders.find(
      (candidate) => candidate.id === String(active.id),
    );
    if (!order) return;

    const targetColumnId = String(over.id) as KitchenVisualColumnId;
    if (columnOfStatus(order.status) === targetColumnId) return; // já está lá

    const path = resolveDropPath(order.status, targetColumnId);
    if (!path) {
      const targetTitle = KITCHEN_VISUAL_COLUMNS.find(
        (column) => column.id === targetColumnId,
      )?.title;
      toast.error(
        `Não é possível mover o pedido #${order.orderNumber} diretamente para "${targetTitle}".`,
      );
      return;
    }

    void changeStatusPath(order.id, path);
  }

  const showCancelledView = filter === "cancelled";

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <KitchenHeader connectionStatus={connectionStatus} />
      <KitchenFilters
        filter={filter}
        onFilterChange={setFilter}
        query={rawQuery}
        onQueryChange={setRawQuery}
      />

      {showCancelledView ? (
        <CancelledOrdersList orders={filteredOrders} />
      ) : (
        <>
          {hiddenDoneCount > 0 && (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHiddenDone(true)}
              >
                Mostrar {hiddenDoneCount} finalizado
                {hiddenDoneCount === 1 ? "" : "s"} oculto
                {hiddenDoneCount === 1 ? "" : "s"}
              </Button>
            </div>
          )}

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {isMobile ? (
              <Tabs
                value={mobileColumn}
                onValueChange={(value) =>
                  setMobileColumn(value as KitchenVisualColumnId)
                }
              >
                <TabsList className="w-full flex-wrap">
                  {KITCHEN_VISUAL_COLUMNS.map((column) => (
                    <TabsTrigger key={column.id} value={column.id}>
                      {column.title} ({ordersByColumn.get(column.id)?.length ?? 0})
                    </TabsTrigger>
                  ))}
                </TabsList>
                {KITCHEN_VISUAL_COLUMNS.map((column) => (
                  <TabsContent key={column.id} value={column.id}>
                    <KitchenColumn
                      id={column.id}
                      title={column.title}
                      orders={ordersByColumn.get(column.id) ?? []}
                      className="w-full"
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="flex flex-1 gap-4">
                {KITCHEN_VISUAL_COLUMNS.map((column) => (
                  <KitchenColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    orders={ordersByColumn.get(column.id) ?? []}
                  />
                ))}
              </div>
            )}
          </DndContext>
        </>
      )}
    </div>
  );
}
