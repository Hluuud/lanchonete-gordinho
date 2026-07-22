"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/features/cart/components/quantity-stepper";
import { useCart } from "@/features/cart/use-cart";
import type { Product } from "@/types/domain";

/**
 * Ilha de interatividade dentro do `ProductCard` (que permanece Server
 * Component). Alterna entre botão "adicionar" e stepper de quantidade
 * conforme o item já está ou não no carrinho.
 */
export function AddToCartControl({ product }: { product: Product }) {
  const { quantityOf, addItem, incrementItem, decrementItem } = useCart();
  const quantity = quantityOf(product.id);
  const unavailable = !product.isAvailable;

  if (quantity > 0) {
    return (
      <QuantityStepper
        label={product.name}
        quantity={quantity}
        onIncrement={() => incrementItem(product.id)}
        onDecrement={() => decrementItem(product.id)}
      />
    );
  }

  return (
    <Button
      size="icon"
      aria-label={`Adicionar ${product.name} ao carrinho`}
      disabled={unavailable}
      onClick={() => {
        addItem(product);
        toast.success(`${product.name} adicionado ao carrinho`);
      }}
    >
      <Plus aria-hidden />
    </Button>
  );
}
