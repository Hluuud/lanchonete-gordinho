import { Flame, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BadgeFilter, SortOrder } from "@/features/search/search-utils";

type FilterBarProps = {
  badgeFilter: BadgeFilter;
  onBadgeFilterChange: (filter: BadgeFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
};

const BADGE_CHIPS: {
  value: BadgeFilter;
  label: string;
  icon?: typeof Flame;
}[] = [
  { value: "all", label: "Todos" },
  { value: "featured", label: "Destaques", icon: Flame },
  { value: "new", label: "Novidades", icon: Sparkles },
];

/**
 * Filtros do cardápio: por badge (dados reais) e ordenação por preço.
 * "Promoções"/"Combos"/"Mais vendidos" ficam de fora até existir schema/dados
 * reais (ver docs/roadmap) — nenhum dado fabricado.
 */
export function FilterBar({
  badgeFilter,
  onBadgeFilterChange,
  sortOrder,
  onSortOrderChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Filtrar por"
        className="flex flex-wrap gap-2"
      >
        {BADGE_CHIPS.map((chip) => {
          const isActive = badgeFilter === chip.value;
          const Icon = chip.icon;
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onBadgeFilterChange(chip.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-foreground hover:border-primary hover:bg-primary/10",
              )}
            >
              {Icon && <Icon className="size-3.5" aria-hidden />}
              {chip.label}
            </button>
          );
        })}
      </div>

      <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        Ordenar por
        <select
          value={sortOrder}
          onChange={(event) =>
            onSortOrderChange(event.target.value as SortOrder)
          }
          className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none"
        >
          <option value="relevance">Relevância</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </label>
    </div>
  );
}
