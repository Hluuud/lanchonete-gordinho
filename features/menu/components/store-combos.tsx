"use client";

import { useMemo } from "react";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";

import { PriceTag } from "@/components/price-tag";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";
import {
  buildComboSuggestions,
  type ComboSuggestion,
} from "@/features/menu/combo-suggestions";
import type { Menu } from "@/types/domain";

/**
 * Seção `#combos`: sugestões montadas com produtos reais do cardápio (ver
 * `combo-suggestions.ts` para o porquê de não virem da tabela `combos`).
 * O botão adiciona os itens ao carrinho existente — nenhuma regra nova de
 * preço, nenhuma alteração no checkout.
 */
export function StoreCombos({ menu }: { menu: Menu }) {
  const combos = useMemo(() => buildComboSuggestions(menu), [menu]);

  if (combos.length === 0) return null;

  return (
    <section
      id="combos"
      aria-labelledby="titulo-combos"
      className="scroll-mt-32 bg-secondary/60 px-4 py-12 lg:scroll-mt-20 lg:px-8 lg:py-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Package className="size-6" aria-hidden />
          </span>
          <h2
            id="titulo-combos"
            className="font-display text-3xl leading-none tracking-tight uppercase sm:text-4xl"
          >
            Combos
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Junte os favoritos da casa e peça de uma vez só. O valor é a soma dos
          itens — o que você vê aqui é o que aparece no carrinho.
        </p>

        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ComboCard({ combo }: { combo: ComboSuggestion }) {
  const { addItem, setOpen } = useCart();

  function addCombo() {
    for (const product of combo.products) {
      addItem(product);
    }
    toast.success(`${combo.name} adicionado ao carrinho`);
    setOpen(true);
  }

  return (
    <li className="flex flex-col rounded-3xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <h3 className="font-display text-2xl leading-none tracking-tight uppercase">
        {combo.name}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{combo.tagline}</p>

      <ul className="mt-4 flex flex-1 flex-col gap-2">
        {combo.products.map((product, index) => (
          <li
            // O mesmo produto pode aparecer duas vezes (Combo Casal): o índice
            // faz parte da chave de propósito.
            key={`${product.id}-${index}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Plus className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span className="truncate">{product.name}</span>
            </span>
            <PriceTag
              cents={product.priceCents}
              className="shrink-0 text-xs font-medium text-muted-foreground"
            />
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
        <PriceTag cents={combo.totalCents} className="text-2xl" />
        <Button
          type="button"
          className="rounded-full font-semibold"
          onClick={addCombo}
        >
          Adicionar tudo
        </Button>
      </div>
    </li>
  );
}
