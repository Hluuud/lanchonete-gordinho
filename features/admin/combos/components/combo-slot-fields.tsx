"use client";

import {
  Controller,
  useFieldArray,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ComboInput } from "@/features/admin/combos/schema";

/**
 * Uma linha de slot dentro do formulário de combo — tem seu próprio
 * `useFieldArray` para os produtos elegíveis (array aninhado dentro de
 * `slots.${slotIndex}.products`), por isso vive num componente próprio
 * (hooks não podem ser chamados em loop no componente pai).
 */
export function ComboSlotFields({
  control,
  slotIndex,
  productOptions,
  onRemoveSlot,
  register,
}: {
  control: Control<ComboInput>;
  slotIndex: number;
  productOptions: { id: string; name: string }[];
  onRemoveSlot: () => void;
  register: UseFormRegister<ComboInput>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `slots.${slotIndex}.products`,
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Input placeholder="Ex.: Escolha uma bebida" {...register(`slots.${slotIndex}.name`)} />
        <Button type="button" variant="ghost" size="icon" aria-label="Remover slot" onClick={onRemoveSlot}>
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Mínimo</label>
          <Controller
            control={control}
            name={`slots.${slotIndex}.minSelections`}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                value={field.value}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            )}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Máximo</label>
          <Controller
            control={control}
            name={`slots.${slotIndex}.maxSelections`}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                value={field.value}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            )}
          />
        </div>
        <div className="flex items-end justify-between gap-2 pb-1.5">
          <span className="text-xs text-muted-foreground">Obrigatório</span>
          <Controller
            control={control}
            name={`slots.${slotIndex}.isRequired`}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Produtos elegíveis</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ productId: "", priceOverrideCents: null, sortOrder: fields.length })
            }
          >
            <Plus className="size-3.5" aria-hidden />
            Adicionar produto
          </Button>
        </div>

        {fields.map((field, productIndex) => (
          <div key={field.id} className="flex items-center gap-2">
            <Controller
              control={control}
              name={`slots.${slotIndex}.products.${productIndex}.productId`}
              render={({ field: productField }) => (
                <Select value={productField.value} onValueChange={productField.onChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remover produto do slot"
              onClick={() => remove(productIndex)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
