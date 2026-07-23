"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ComboSlotFields } from "@/features/admin/combos/components/combo-slot-fields";
import { comboInputSchema, type ComboInput } from "@/features/admin/combos/schema";
import { useCreateCombo, useUpdateCombo } from "@/features/admin/combos/use-combo-mutations";
import type { AdminCombo } from "@/types/domain";

const NO_MAIN_PRODUCT = "__none__";

const EMPTY_VALUES: ComboInput = {
  name: "",
  description: "",
  imageUrl: null,
  priceCents: null,
  mainProductId: null,
  isAvailable: true,
  sortOrder: 0,
  slots: [],
};

function toFormValues(combo: AdminCombo): ComboInput {
  return {
    name: combo.name,
    description: combo.description ?? "",
    imageUrl: combo.imageUrl,
    priceCents: combo.priceCents,
    mainProductId: combo.mainProductId,
    isAvailable: combo.isAvailable,
    sortOrder: combo.sortOrder,
    slots: combo.slots.map((slot, index) => ({
      name: slot.name,
      isRequired: slot.isRequired,
      minSelections: slot.minSelections,
      maxSelections: slot.maxSelections,
      sortOrder: index,
      products: slot.products.map((product, productIndex) => ({
        productId: product.productId,
        priceOverrideCents: product.priceOverrideCents,
        sortOrder: productIndex,
      })),
    })),
  };
}

function centsToReais(cents: number | null): number | "" {
  return cents == null ? "" : Math.round(cents) / 100;
}

function reaisToCents(reais: string): number | null {
  if (reais === "") return null;
  return Math.round(Number(reais) * 100);
}

/**
 * Um único dialog para criar/editar combo + seus slots — `combo: null` =
 * modo criação. Remontado via `key` pelo pai a cada abertura (mesma
 * estratégia de `ProductFormDialog`/`ModifierGroupFormDialog`).
 */
export function ComboFormDialog({
  open,
  onOpenChange,
  combo,
  productOptions,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combo: AdminCombo | null;
  productOptions: { id: string; name: string }[];
  tenantId: string;
}) {
  const router = useRouter();
  const isEditing = combo !== null;
  const createMutation = useCreateCombo();
  const updateMutation = useUpdateCombo();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ComboInput>({
    resolver: zodResolver(comboInputSchema),
    defaultValues: combo ? toFormValues(combo) : EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "slots" });

  function onSubmit(values: ComboInput) {
    const payload: ComboInput = {
      ...values,
      description: values.description?.trim() || null,
    };

    const promise = isEditing
      ? updateMutation.mutateAsync({ id: combo.id, input: payload })
      : createMutation.mutateAsync(payload);

    promise
      .then(() => {
        toast.success(isEditing ? "Combo atualizado." : "Combo criado.");
        onOpenChange(false);
        router.refresh();
      })
      .catch((error: Error) => toast.error(error.message));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar combo" : "Novo combo"}</DialogTitle>
          <DialogDescription>
            Produto principal fixo + slots de escolha (ex.: &ldquo;Escolha uma bebida&rdquo;).
          </DialogDescription>
        </DialogHeader>

        <form id="combo-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? null}
                onChange={field.onChange}
                pathPrefix={`${tenantId}/combos`}
                label="Foto do combo"
              />
            )}
          />

          <div>
            <label htmlFor="combo-name" className="mb-1.5 block text-sm font-medium">
              Nome
            </label>
            <Input id="combo-name" placeholder="Combo Família" {...register("name")} autoFocus />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="combo-description" className="mb-1.5 block text-sm font-medium">
              Descrição
            </label>
            <Textarea id="combo-description" rows={2} {...register("description")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="combo-main-product" className="mb-1.5 block text-sm font-medium">
                Produto principal
              </label>
              <Controller
                control={control}
                name="mainProductId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NO_MAIN_PRODUCT}
                    onValueChange={(value) =>
                      field.onChange(value === NO_MAIN_PRODUCT ? null : value)
                    }
                  >
                    <SelectTrigger id="combo-main-product" className="w-full">
                      <SelectValue placeholder="Nenhum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_MAIN_PRODUCT}>Nenhum</SelectItem>
                      {productOptions.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label htmlFor="combo-price" className="mb-1.5 block text-sm font-medium">
                Preço fixo (R$)
              </label>
              <Controller
                control={control}
                name="priceCents"
                render={({ field }) => (
                  <Input
                    id="combo-price"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Calculado"
                    value={centsToReais(field.value ?? null)}
                    onChange={(event) => field.onChange(reaisToCents(event.target.value))}
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="combo-sort-order" className="mb-1.5 block text-sm font-medium">
                Ordem
              </label>
              <Input
                id="combo-sort-order"
                type="number"
                min={0}
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Disponível</p>
              <p className="text-xs text-muted-foreground">Desative para pausar vendas.</p>
            </div>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Slots de escolha</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: "",
                    isRequired: true,
                    minSelections: 1,
                    maxSelections: 1,
                    sortOrder: fields.length,
                    products: [],
                  })
                }
              >
                <Plus className="size-4" aria-hidden />
                Adicionar slot
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Nenhum slot ainda — ex.: &ldquo;Escolha uma bebida&rdquo;, &ldquo;Escolha um
                acompanhamento&rdquo;.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <ComboSlotFields
                  key={field.id}
                  control={control}
                  register={register}
                  slotIndex={index}
                  productOptions={productOptions}
                  onRemoveSlot={() => remove(index)}
                />
              ))}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="combo-form" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
