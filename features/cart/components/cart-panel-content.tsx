import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PriceTag } from "@/components/price-tag";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/features/cart/components/cart-item-row";
import { useCart } from "@/features/cart/use-cart";

/**
 * Conteúdo compartilhado entre o Drawer (mobile) e o Sheet (desktop) — mesmo
 * comportamento, apenas o "invólucro" muda por breakpoint.
 */
export function CartPanelContent() {
  const { items, subtotalCents, clear, setOpen } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Seu carrinho está vazio"
        description="Adicione itens do cardápio para montar seu pedido."
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-4 pb-4">
        <h2 className="text-lg font-bold">
          Seu carrinho{" "}
          <span className="text-muted-foreground">({items.length})</span>
        </h2>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
        >
          Limpar
        </button>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-4">
        {items.map((item) => (
          <CartItemRow key={item.product.id} item={item} />
        ))}
      </ul>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <PriceTag cents={subtotalCents} className="text-xl" />
        </div>
        <Button
          size="lg"
          className="w-full"
          asChild
          onClick={() => setOpen(false)}
        >
          <Link href="/checkout">Finalizar pedido</Link>
        </Button>
      </div>
    </div>
  );
}
