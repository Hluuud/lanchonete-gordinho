import { TrendingUp } from "lucide-react";

import { ProductCard } from "@/features/menu/components/product-card";
import { selectBestsellers } from "@/features/menu/virtual-sections";
import type { Menu } from "@/types/domain";

/** Quantos campeões cabem na vitrine sem virar um segundo cardápio. */
const MAX_ITEMS = 6;

/**
 * Seção `#mais-vendidos`. Usa os produtos marcados como campeões de venda
 * pelo lojista; enquanto não houver nenhum, cai nos destaques — e nesse caso
 * o texto muda junto, porque afirmar "mais vendido" sobre um produto que
 * ninguém contou seria inventar dado.
 */
export function StoreBestsellers({ menu }: { menu: Menu }) {
  const { products, isFallback } = selectBestsellers(menu);

  if (products.length === 0) return null;

  const visible = products.slice(0, MAX_ITEMS);

  return (
    <section
      id="mais-vendidos"
      aria-labelledby="titulo-mais-vendidos"
      className="scroll-mt-32 px-4 py-12 lg:scroll-mt-20 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <TrendingUp className="size-6" aria-hidden />
          </span>
          <h2
            id="titulo-mais-vendidos"
            className="font-display text-3xl leading-none tracking-tight uppercase sm:text-4xl"
          >
            {isFallback ? "Os queridinhos da casa" : "Mais vendidos"}
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {isFallback
            ? "A seleção que a casa faz questão de te mostrar primeiro."
            : "Os pedidos que mais saem do balcão — se está na dúvida, comece por aqui."}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={`bestseller-${product.id}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
