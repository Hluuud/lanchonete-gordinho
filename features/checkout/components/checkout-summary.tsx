import { PriceTag } from "@/components/price-tag";
import type { CartItem } from "@/features/cart/types";

export function CheckoutSummary({
  items,
  subtotalCents,
}: {
  items: CartItem[];
  subtotalCents: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="mb-3 font-semibold">Resumo do pedido</h2>

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.product.id}
            className="flex items-start justify-between gap-2 text-sm"
          >
            <span>
              <span className="font-medium tabular-nums">{item.quantity}x</span>{" "}
              {item.product.name}
              {item.note && (
                <span className="block text-xs text-muted-foreground">
                  Obs.: {item.note}
                </span>
              )}
            </span>
            <PriceTag
              cents={item.product.priceCents * item.quantity}
              className="shrink-0"
            />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t pt-3 font-semibold">
        <span>Total</span>
        <PriceTag cents={subtotalCents} className="text-lg" />
      </div>
    </div>
  );
}
