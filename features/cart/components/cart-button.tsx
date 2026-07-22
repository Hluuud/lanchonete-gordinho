"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import { PriceTag } from "@/components/price-tag";
import { useCart } from "@/features/cart/use-cart";

/**
 * Carrinho fixo (estilo iFood): pílula flutuante que aparece assim que há
 * itens, mostrando quantidade e subtotal ao vivo. Oculta no checkout — lá o
 * resumo do pedido já ocupa a tela.
 */
export function CartButton() {
  const { totalQuantity, subtotalCents, setOpen } = useCart();
  const pathname = usePathname();

  if (pathname.startsWith("/checkout")) return null;

  return (
    <AnimatePresence>
      {totalQuantity > 0 && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:bottom-6 lg:hidden"
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between gap-4 rounded-full bg-primary px-5 py-3.5 text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:min-w-72"
          >
            <span className="flex items-center gap-2 font-semibold">
              <span className="relative flex items-center">
                <ShoppingBag className="size-5" aria-hidden />
                <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {totalQuantity}
                </span>
              </span>
              Ver carrinho
            </span>
            <PriceTag
              cents={subtotalCents}
              className="text-primary-foreground"
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
