"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ADD_TO_CART_FEEDBACK } from "@/features/cart/config";
import { QuantityStepper } from "@/features/cart/components/quantity-stepper";
import { useCart } from "@/features/cart/use-cart";
import type { Product } from "@/types/domain";

/**
 * Ilha de interatividade dentro do `ProductCard` (que permanece Server
 * Component). Alterna entre botão "adicionar" e stepper de quantidade
 * conforme o item já está ou não no carrinho.
 *
 * `variant="labeled"` exibe o botão largo "Adicionar" (cards grandes);
 * `"icon"` mantém o botão compacto (carrossel, espaços apertados).
 */
export function AddToCartControl({
  product,
  variant = "icon",
}: {
  product: Product;
  variant?: "icon" | "labeled";
}) {
  const { quantityOf, addItem, incrementItem, decrementItem, setOpen } =
    useCart();
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

  function handleAdd() {
    addItem(product);
    if (ADD_TO_CART_FEEDBACK === "open-panel") {
      setOpen(true);
      return;
    }
    toast.success(`${product.name} adicionado ao carrinho`);
  }

  if (variant === "labeled") {
    return (
      <Button
        size="md"
        aria-label={`Adicionar ${product.name} ao carrinho`}
        disabled={unavailable}
        onClick={handleAdd}
        className="min-h-11"
      >
        Adicionar
        <Plus aria-hidden />
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      aria-label={`Adicionar ${product.name} ao carrinho`}
      disabled={unavailable}
      onClick={handleAdd}
    >
      <Plus aria-hidden />
    </Button>
  );
}
