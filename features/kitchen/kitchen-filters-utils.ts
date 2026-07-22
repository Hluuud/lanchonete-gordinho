import { isOrderLate } from "@/lib/kitchen/order-status";
import type { Order } from "@/types/domain";

export type KitchenFilter = "all" | "pickup" | "delivery" | "late" | "priority";

export function matchesKitchenFilter(
  order: Order,
  filter: KitchenFilter,
  now: Date = new Date(),
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pickup":
      return order.orderType === "pickup";
    case "delivery":
      return order.orderType === "delivery";
    case "late":
      return isOrderLate(order, now);
    case "priority":
      return order.isPriority;
  }
}

// Marcas de acentuação combinantes (U+0300–U+036F) — remove acentos após NFD.
const DIACRITICS_PATTERN = /[̀-ͯ]/g;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .trim();
}

/** Busca por senha, produto ou cliente — sem diferenciar acentos (mesmo critério de `features/search`). */
export function matchesKitchenQuery(order: Order, query: string): boolean {
  if (query.trim() === "") return true;

  const needle = normalize(query);
  const haystacks = [
    order.orderNumber != null ? String(order.orderNumber) : "",
    order.customerName ?? "",
    ...order.items.map((item) => item.productName),
  ];

  return haystacks.some((text) => normalize(text).includes(needle));
}
