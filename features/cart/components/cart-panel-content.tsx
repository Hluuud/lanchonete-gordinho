import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

import { MascotMoment } from "@/features/menu/components/mascot-moment";
import { PriceTag } from "@/components/price-tag";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/features/cart/components/cart-item-row";
import { estimateCartPrepMinutes } from "@/features/cart/estimate";
import { useCart } from "@/features/cart/use-cart";
import { formatMinutes } from "@/utils/format";

/**
 * Conteúdo compartilhado entre o Drawer (mobile) e o Sheet (desktop) — mesmo
 * comportamento, apenas o "invólucro" muda por breakpoint.
 */
export function CartPanelContent() {
  const { items, subtotalCents, clear, setOpen } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12">
        <MascotMoment
          pose="holding-burger"
          message="Seu carrinho está vazio — adicione itens do cardápio para montar seu pedido."
        />
      </div>
    );
  }

  const estimatedMinutes = estimateCartPrepMinutes(items);

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
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}
        </AnimatePresence>
      </ul>

      <div className="border-t p-4">
        {estimatedMinutes !== null && (
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              Preparo estimado
            </span>
            <span>~{formatMinutes(estimatedMinutes)}</span>
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Total</span>
          <PriceTag cents={subtotalCents} className="text-2xl" />
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
