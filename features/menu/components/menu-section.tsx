import { CategoryIcon } from "@/features/menu/category-icon";
import { ProductCard } from "@/features/menu/components/product-card";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";

/**
 * Seção do cardápio (categoria real ou virtual derivada de badges) com sua
 * grade de produtos. Alvo de âncora da sidebar e da CategoryNav.
 */
export function MenuSection({ section }: { section: StoreSection }) {
  if (section.products.length === 0) return null;

  const anchor = sectionAnchorId(section.slug);
  const count = section.products.length;

  return (
    <section
      id={anchor}
      aria-labelledby={`titulo-${section.slug}`}
      // scroll-mt deve ficar ≤ linha de detecção do ScrollSpy (sidebar: 84px;
      // CategoryNav mobile: 130px) para a seção clicada ativar no destino.
      className="scroll-mt-32 lg:scroll-mt-20"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <CategoryIcon slug={section.slug} className="size-5" />
        </span>
        <h2
          id={`titulo-${section.slug}`}
          className="text-xl font-bold tracking-tight sm:text-2xl"
        >
          {section.title}
        </h2>
        <span className="text-sm text-muted-foreground tabular-nums">
          {count} {count === 1 ? "item" : "itens"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {section.products.map((product) => (
          <ProductCard key={`${section.id}-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}
