import { ProductCard } from "@/features/menu/components/product-card";
import type { Product } from "@/types/domain";

/** Fileira horizontal de novidades (`is_new`) — só renderiza se houver dados reais. */
export function NewArrivalsRow({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="titulo-novidades">
      <h2
        id="titulo-novidades"
        className="mb-4 text-xl font-bold tracking-tight sm:text-2xl"
      >
        Novidades
      </h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-64 shrink-0 snap-start sm:w-72">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
