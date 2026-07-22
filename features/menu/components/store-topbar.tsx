"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, ShoppingBag } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/features/cart/use-cart";
import { StoreOpenBadge } from "@/features/menu/components/store-open-badge";
import { formatMinutes } from "@/utils/format";

/**
 * Barra superior da loja: identidade + status operacional + acesso ao
 * carrinho. Sticky — referência de altura para os `scroll-mt` das seções.
 */
export function StoreTopbar({
  tenantName,
  avgPrepMinutes,
}: {
  tenantName: string;
  avgPrepMinutes: number | null;
}) {
  const { totalQuantity, setOpen } = useCart();
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <BrandLogo size="sm" className="lg:hidden" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold sm:text-base">
            {tenantName}
          </p>
          {avgPrepMinutes !== null && (
            <p className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Clock className="size-3" aria-hidden />
              Preparo médio {formatMinutes(avgPrepMinutes)}
            </p>
          )}
        </div>

        <StoreOpenBadge />

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={
            totalQuantity > 0
              ? `Abrir carrinho, ${totalQuantity} ${totalQuantity === 1 ? "item" : "itens"}`
              : "Abrir carrinho, vazio"
          }
          className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-input bg-card transition-colors hover:border-primary hover:text-primary"
        >
          <ShoppingBag className="size-5" aria-hidden />
          {totalQuantity > 0 && (
            <motion.span
              // Pulso a cada mudança de quantidade (feedback do "Adicionar").
              key={totalQuantity}
              initial={prefersReducedMotion ? false : { scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              aria-hidden
              className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground tabular-nums"
            >
              {totalQuantity}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  );
}
