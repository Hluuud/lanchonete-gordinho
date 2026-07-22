"use client";

import { useContext } from "react";

import { KitchenOrdersContext } from "@/features/kitchen/kitchen-orders-context";

/** Acesso aos pedidos do painel. Lança erro claro se usado fora do `KitchenOrdersProvider`. */
export function useKitchenOrders() {
  const context = useContext(KitchenOrdersContext);
  if (!context) {
    throw new Error(
      "useKitchenOrders deve ser usado dentro de <KitchenOrdersProvider>.",
    );
  }
  return context;
}
