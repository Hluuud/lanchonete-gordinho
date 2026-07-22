"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KitchenFilter } from "@/features/kitchen/kitchen-filters-utils";

const FILTERS: { value: KitchenFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pickup", label: "Retirada" },
  { value: "delivery", label: "Entrega" },
  { value: "late", label: "Em atraso" },
  { value: "priority", label: "Prioridade" },
  { value: "cancelled", label: "Cancelados" },
];

export function KitchenFilters({
  filter,
  onFilterChange,
  query,
  onQueryChange,
}: {
  filter: KitchenFilter;
  onFilterChange: (filter: KitchenFilter) => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as KitchenFilter)}
      >
        <TabsList>
          {FILTERS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative sm:w-64">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Senha, produto ou cliente"
          className="pl-8"
          aria-label="Buscar pedido"
        />
      </div>
    </div>
  );
}
