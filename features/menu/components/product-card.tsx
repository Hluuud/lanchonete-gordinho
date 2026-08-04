import Image from "next/image";
import { Clock, Star } from "lucide-react";

import { PriceTag } from "@/components/price-tag";
import { ProductBadge } from "@/components/product-badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AddToCartControl } from "@/features/cart/components/add-to-cart-control";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/utils/format";
import type { Product } from "@/types/domain";

/** Rótulos livres do lojista exibidos no card — os demais viram busca apenas. */
const MAX_VISIBLE_TAGS = 2;

/**
 * Card de produto do cardápio. Continua Server Component — apenas o controle
 * de adicionar/quantidade (`AddToCartControl`) é uma ilha client-side.
 * Hover/animação são só CSS (sem JS) por custo-benefício de performance.
 */
export function ProductCard({ product }: { product: Product }) {
  const unavailable = !product.isAvailable;
  const visibleTags = product.tags.slice(0, MAX_VISIBLE_TAGS);

  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-primary/25",
        unavailable &&
          "opacity-75 hover:translate-y-0 hover:shadow-sm hover:ring-0",
      )}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-primary/15 via-accent/20 to-accent/40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span
            aria-hidden
            className="font-display flex h-full items-center justify-center text-6xl text-primary/35 select-none"
          >
            {product.name.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Véu inferior: sustenta o contraste do preço sobre fotos claras. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />

        {(product.badges.isBestseller ||
          product.badges.isFeatured ||
          product.badges.isNew) && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.badges.isBestseller && <ProductBadge kind="bestseller" />}
            {product.badges.isFeatured && <ProductBadge kind="featured" />}
            {product.badges.isNew && <ProductBadge kind="new" />}
          </div>
        )}

        <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Clock className="size-3.5" aria-hidden />
          {formatMinutes(product.prepTimeMinutes)}
        </span>

        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
              Indisponível no momento
            </span>
          </div>
        )}
      </div>

      <CardContent className="gap-1.5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg leading-tight font-bold text-card-foreground">
            {product.name}
          </h3>
          {product.rating != null && (
            <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-foreground">
              <Star className="size-3.5 fill-accent text-accent" aria-hidden />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}
        {visibleTags.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 sm:p-5 sm:pt-0">
        <PriceTag cents={product.priceCents} className="text-2xl" />
        <AddToCartControl product={product} variant="labeled" />
      </CardFooter>
    </Card>
  );
}
