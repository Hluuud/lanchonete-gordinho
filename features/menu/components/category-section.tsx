import { ProductCard } from "@/features/menu/components/product-card";
import type { MenuCategory } from "@/types/domain";

/** Seção de uma categoria com sua grade de produtos. Alvo de âncora da navegação. */
export function CategorySection({ category }: { category: MenuCategory }) {
  return (
    <section
      id={`categoria-${category.slug}`}
      aria-labelledby={`titulo-${category.slug}`}
      className="scroll-mt-24"
    >
      <h2
        id={`titulo-${category.slug}`}
        className="mb-4 text-xl font-bold tracking-tight sm:text-2xl"
      >
        {category.name}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
