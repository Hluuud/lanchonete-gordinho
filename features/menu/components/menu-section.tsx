import { categoryDescription } from "@/features/menu/category-content";
import { CategoryIcon } from "@/features/menu/category-icon";
import { ProductCard } from "@/features/menu/components/product-card";
import { Reveal } from "@/features/menu/components/reveal";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";

/**
 * Seção do cardápio (categoria real ou virtual derivada de badges) com sua
 * grade de produtos. Alvo de âncora da sidebar e da CategoryNav.
 *
 * Só o cabeçalho entra em `Reveal` — a grade pode ter dezenas de produtos
 * (todas as categorias, ao mesmo tempo, na página), e cada `Reveal` é um
 * observer a mais; `ProductCard` já é hover/animação só em CSS por esse
 * mesmo motivo de custo.
 */
export function MenuSection({ section }: { section: StoreSection }) {
  if (section.products.length === 0) return null;

  const anchor = sectionAnchorId(section.slug);
  const count = section.products.length;
  const description = categoryDescription(section.slug);

  return (
    <section
      id={anchor}
      aria-labelledby={`titulo-${section.slug}`}
      // scroll-mt deve ficar ≤ linha de detecção do ScrollSpy (sidebar: 84px;
      // CategoryNav mobile: 130px) para a seção clicada ativar no destino.
      className="scroll-mt-32 lg:scroll-mt-20"
    >
      <Reveal className="mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CategoryIcon slug={section.slug} className="size-6" />
          </span>
          <h2
            id={`titulo-${section.slug}`}
            className="font-display text-3xl leading-none tracking-tight uppercase sm:text-4xl"
          >
            {section.title}
          </h2>
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {count} {count === 1 ? "item" : "itens"}
          </span>
        </div>
        {description && (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </Reveal>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {section.products.map((product) => (
          <ProductCard key={`${section.id}-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}
