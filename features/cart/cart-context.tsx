"use client";

import { createContext, useMemo, useReducer } from "react";

import type { Product } from "@/types/domain";
import type { CartItem } from "@/features/cart/types";

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD"; product: Product }
  | { type: "INCREMENT"; productId: string }
  | { type: "DECREMENT"; productId: string }
  | { type: "REMOVE"; productId: string }
  | { type: "SET_NOTE"; productId: string; note: string }
  | { type: "CLEAR" };

export type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  subtotalCents: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setNote: (productId: string, note: string) => void;
  clear: () => void;
  quantityOf: (productId: string) => number;
};

export const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        (item) => item.product.id === action.product.id,
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { product: action.product, quantity: 1, note: "" },
        ],
      };
    }
    case "INCREMENT":
      return {
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };
    case "DECREMENT":
      return {
        items: state.items
          .map((item) =>
            item.product.id === action.productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "REMOVE":
      return {
        items: state.items.filter(
          (item) => item.product.id !== action.productId,
        ),
      };
    case "SET_NOTE":
      return {
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, note: action.note }
            : item,
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

/**
 * Provider do carrinho — estado em memória, sem persistência ou submissão de
 * pedido (isso chega no checkout, Fase 1). Centraliza a única lógica de
 * "negócio" desta sprint: somar preços já existentes, não criar novas regras.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isOpen, setOpen] = useReducer(
    (_state: boolean, next: boolean) => next,
    false,
  );

  const value = useMemo<CartContextValue>(() => {
    const totalQuantity = state.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const subtotalCents = state.items.reduce(
      (sum, item) => sum + item.quantity * item.product.priceCents,
      0,
    );

    return {
      items: state.items,
      totalQuantity,
      subtotalCents,
      isOpen,
      setOpen,
      addItem: (product) => dispatch({ type: "ADD", product }),
      incrementItem: (productId) => dispatch({ type: "INCREMENT", productId }),
      decrementItem: (productId) => dispatch({ type: "DECREMENT", productId }),
      removeItem: (productId) => dispatch({ type: "REMOVE", productId }),
      setNote: (productId, note) =>
        dispatch({ type: "SET_NOTE", productId, note }),
      clear: () => dispatch({ type: "CLEAR" }),
      quantityOf: (productId) =>
        state.items.find((item) => item.product.id === productId)?.quantity ??
        0,
    };
  }, [state.items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
