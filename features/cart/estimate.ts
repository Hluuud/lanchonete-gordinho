import type { CartItem } from "@/features/cart/types";

/**
 * Estimativa de preparo do carrinho: o MAIOR `prepTimeMinutes` entre os itens
 * (a cozinha prepara em paralelo — somar superestimaria absurdamente).
 *
 * É uma aproximação exibida como "~X min"; a estimativa oficial do pedido
 * (`estimatedReadyAt`) continua sendo responsabilidade do backend.
 */
export function estimateCartPrepMinutes(items: CartItem[]): number | null {
  const prepTimes = items
    .map((item) => item.product.prepTimeMinutes)
    .filter((minutes) => minutes > 0);

  if (prepTimes.length === 0) return null;
  return Math.max(...prepTimes);
}
