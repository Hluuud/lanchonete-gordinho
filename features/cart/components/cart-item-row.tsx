import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Trash2 } from "lucide-react";

import { PriceTag } from "@/components/price-tag";
import { QuantityStepper } from "@/features/cart/components/quantity-stepper";
import { useCart } from "@/features/cart/use-cart";
import type { CartItem } from "@/features/cart/types";

export function CartItemRow({ item }: { item: CartItem }) {
  const { incrementItem, decrementItem, removeItem, setNote } = useCart();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.li
      layout={!prefersReducedMotion}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, x: -16 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-2 border-b py-4 last:border-b-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {item.product.imageUrl ? (
            <Image
              src={item.product.imageUrl}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 via-accent/20 to-accent/40 text-lg font-black text-primary/40"
            >
              {item.product.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="leading-tight font-semibold text-foreground">
              {item.product.name}
            </p>
            <PriceTag
              cents={item.product.priceCents}
              className="text-sm text-muted-foreground"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.product.id)}
          aria-label={`Remover ${item.product.name} do carrinho`}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="sr-only" htmlFor={`note-${item.product.id}`}>
          Observação para {item.product.name}
        </label>
        <input
          id={`note-${item.product.id}`}
          type="text"
          value={item.note}
          onChange={(event) => setNote(item.product.id, event.target.value)}
          placeholder="Ex.: sem cebola"
          maxLength={140}
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        />
        <QuantityStepper
          label={item.product.name}
          quantity={item.quantity}
          onIncrement={() => incrementItem(item.product.id)}
          onDecrement={() => decrementItem(item.product.id)}
        />
      </div>
    </motion.li>
  );
}
