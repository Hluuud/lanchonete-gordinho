"use client";

import { createContext, useCallback, useMemo, useReducer } from "react";
import { toast } from "sonner";

import type { Order, OrderStatus } from "@/types/domain";

type OrdersState = {
  orders: Order[];
};

type OrdersAction =
  | { type: "UPSERT_ORDER"; order: Order }
  | { type: "PATCH_ORDER"; orderId: string; patch: Partial<Order> };

export type KitchenOrdersContextValue = {
  orders: Order[];
  hasOrder: (orderId: string) => boolean;
  upsertOrder: (order: Order) => void;
  patchOrder: (orderId: string, patch: Partial<Order>) => void;
  changeStatus: (
    orderId: string,
    nextStatus: OrderStatus,
    cancelledReason?: string,
  ) => Promise<void>;
  setPriority: (orderId: string, isPriority: boolean) => Promise<void>;
};

export const KitchenOrdersContext =
  createContext<KitchenOrdersContextValue | null>(null);

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "UPSERT_ORDER": {
      const exists = state.orders.some((order) => order.id === action.order.id);
      return {
        orders: exists
          ? state.orders.map((order) =>
              order.id === action.order.id ? action.order : order,
            )
          : [...state.orders, action.order],
      };
    }
    case "PATCH_ORDER":
      return {
        orders: state.orders.map((order) =>
          order.id === action.orderId ? { ...order, ...action.patch } : order,
        ),
      };
    default:
      return state;
  }
}

/**
 * Estado dos pedidos do Painel da Cozinha: `useReducer` alimentado tanto por
 * ações otimistas do próprio painel (drag/botão) quanto pelo canal Realtime
 * (`use-kitchen-realtime.ts`). Falha de rede em `changeStatus`/`setPriority`
 * reverte para o snapshot anterior + toast — nunca deixa a UI mentir sobre o
 * estado real do servidor.
 */
export function KitchenOrdersProvider({
  initialOrders,
  children,
}: {
  initialOrders: Order[];
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(ordersReducer, {
    orders: initialOrders,
  });

  const hasOrder = useCallback(
    (orderId: string) => state.orders.some((order) => order.id === orderId),
    [state.orders],
  );

  const upsertOrder = useCallback(
    (order: Order) => dispatch({ type: "UPSERT_ORDER", order }),
    [],
  );

  const patchOrder = useCallback(
    (orderId: string, patch: Partial<Order>) =>
      dispatch({ type: "PATCH_ORDER", orderId, patch }),
    [],
  );

  const changeStatus = useCallback(
    async (
      orderId: string,
      nextStatus: OrderStatus,
      cancelledReason?: string,
    ) => {
      const previous = state.orders.find((order) => order.id === orderId);
      if (!previous) return;

      dispatch({ type: "PATCH_ORDER", orderId, patch: { status: nextStatus } });

      try {
        const response = await fetch(`/api/kitchen/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: nextStatus, cancelledReason }),
        });
        if (!response.ok) throw new Error("status update failed");
        const updated = (await response.json()) as Order;
        dispatch({ type: "UPSERT_ORDER", order: updated });
      } catch {
        dispatch({ type: "UPSERT_ORDER", order: previous });
        toast.error("Não foi possível atualizar o status do pedido.");
      }
    },
    [state.orders],
  );

  const setPriority = useCallback(
    async (orderId: string, isPriority: boolean) => {
      const previous = state.orders.find((order) => order.id === orderId);
      if (!previous) return;

      dispatch({ type: "PATCH_ORDER", orderId, patch: { isPriority } });

      try {
        const response = await fetch(
          `/api/kitchen/orders/${orderId}/priority`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ isPriority }),
          },
        );
        if (!response.ok) throw new Error("priority update failed");
        const updated = (await response.json()) as Order;
        dispatch({ type: "UPSERT_ORDER", order: updated });
      } catch {
        dispatch({ type: "UPSERT_ORDER", order: previous });
        toast.error("Não foi possível atualizar a prioridade do pedido.");
      }
    },
    [state.orders],
  );

  const value = useMemo<KitchenOrdersContextValue>(
    () => ({
      orders: state.orders,
      hasOrder,
      upsertOrder,
      patchOrder,
      changeStatus,
      setPriority,
    }),
    [
      state.orders,
      hasOrder,
      upsertOrder,
      patchOrder,
      changeStatus,
      setPriority,
    ],
  );

  return (
    <KitchenOrdersContext.Provider value={value}>
      {children}
    </KitchenOrdersContext.Provider>
  );
}
