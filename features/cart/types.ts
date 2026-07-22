import type { Product } from "@/types/domain";

/**
 * Item do carrinho. Estado exclusivamente client-side (em memória) nesta
 * sprint — não há persistência nem checkout ainda (Fase 1). `note` é texto
 * livre do cliente; "adicionais" ficam fora de escopo até existir um modelo
 * de modificadores de produto.
 */
export type CartItem = {
  product: Product;
  quantity: number;
  note: string;
};
