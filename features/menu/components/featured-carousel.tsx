"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PriceTag } from "@/components/price-tag";
import { ProductBadge } from "@/components/product-badge";
import { AddToCartControl } from "@/features/cart/components/add-to-cart-control";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

const AUTO_ADVANCE_MS = 5500;

/** Banner rotativo de produtos em destaque — dados reais (`is_featured`). */
export function FeaturedCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const goTo = useCallback(
    (next: number) => setIndex((next + products.length) % products.length),
    [products.length],
  );

  useEffect(() => {
    if (paused || products.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [index, paused, products.length, goTo]);

  if (products.length === 0) return null;

  const product = products[index];

  return (
    <section
      aria-label="Destaques"
      className="relative overflow-hidden rounded-2xl border shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-21/9 w-full sm:aspect-32/9">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -24 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
            className="absolute inset-0 flex items-center bg-gradient-to-br from-primary/90 via-primary to-accent/80 px-6 sm:px-10"
          >
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt=""
                fill
                priority={index === 0}
                className="object-cover opacity-25"
              />
            )}
            <div className="relative flex w-full items-center justify-between gap-4">
              <div className="min-w-0 text-primary-foreground">
                <ProductBadge kind="featured" />
                <h2 className="mt-2 truncate text-xl font-black sm:text-3xl">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mt-1 line-clamp-1 max-w-md text-sm opacity-90 sm:text-base">
                    {product.description}
                  </p>
                )}
                <div className="mt-3">
                  <PriceTag
                    cents={product.priceCents}
                    className="text-lg text-primary-foreground sm:text-2xl"
                  />
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-background p-1 shadow-lg">
                <AddToCartControl product={product} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Destaque anterior"
            className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur transition-colors hover:bg-background"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Próximo destaque"
            className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur transition-colors hover:bg-background"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>

          <div
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
            role="tablist"
            aria-label="Selecionar destaque"
          >
            {products.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                aria-label={`Ir para destaque ${itemIndex + 1}`}
                onClick={() => goTo(itemIndex)}
                className={cn(
                  "h-1.5 rounded-full bg-background/60 transition-all",
                  itemIndex === index ? "w-6 bg-background" : "w-1.5",
                )}
              />
            ))}
          </div>
        </>
      )}

      <span className="sr-only" aria-live="polite">
        {`Mostrando destaque ${index + 1} de ${products.length}: ${product.name}`}
      </span>
    </section>
  );
}
