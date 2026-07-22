"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderType } from "@/types/domain";

const OPTIONS: { value: OrderType; label: string }[] = [
  { value: "pickup", label: "Retirada" },
  { value: "dine_in", label: "Consumo no local" },
  { value: "delivery", label: "Entrega" },
];

export function OrderTypeSelector({
  value,
  onChange,
}: {
  value: OrderType;
  onChange: (value: OrderType) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium">Tipo do pedido</span>
      <Tabs value={value} onValueChange={(next) => onChange(next as OrderType)}>
        <TabsList className="w-full">
          {OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="flex-1"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
