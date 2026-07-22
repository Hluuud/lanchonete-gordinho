"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  modifierGroupInputSchema,
  type ModifierGroupInput,
} from "@/features/admin/modifiers/schema";
import {
  useCreateModifierGroup,
  useUpdateModifierGroup,
} from "@/features/admin/modifiers/use-modifier-group-mutations";
import type { AdminModifierGroup } from "@/types/domain";

const EMPTY_VALUES: ModifierGroupInput = {
  name: "",
  selectionType: "single",
  isRequired: false,
  minSelections: 0,
  maxSelections: 1,
  sortOrder: 0,
  options: [],
};

function toFormValues(group: AdminModifierGroup): ModifierGroupInput {
  return {
    name: group.name,
    selectionType: group.selectionType,
    isRequired: group.isRequired,
    minSelections: group.minSelections,
    maxSelections: group.maxSelections,
    sortOrder: group.sortOrder,
    options: group.options.map((option, index) => ({
      name: option.name,
      priceCents: option.priceCents,
      isAvailable: option.isAvailable,
      sortOrder: index,
    })),
  };
}

function centsToReais(cents: number): number {
  return Math.round(cents) / 100;
}

function reaisToCents(reais: number): number {
  return Math.round((Number.isFinite(reais) ? reais : 0) * 100);
}

/**
 * Um único dialog para criar/editar grupo + suas opções — `group: null` =
 * modo criação. Remontado via `key` pelo pai a cada abertura (mesma
 * estratégia de `ProductFormDialog`, evita efeito de sincronização).
 */
export function ModifierGroupFormDialog({
  open,
  onOpenChange,
  group,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminModifierGroup | null;
}) {
  const router = useRouter();
  const isEditing = group !== null;
  const createMutation = useCreateModifierGroup();
  const updateMutation = useUpdateModifierGroup();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ModifierGroupInput>({
    resolver: zodResolver(modifierGroupInputSchema),
    defaultValues: group ? toFormValues(group) : EMPTY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const selectionType = useWatch({ control, name: "selectionType" });
  const minSelections = useWatch({ control, name: "minSelections" });

  function onSubmit(values: ModifierGroupInput) {
    const promise = isEditing
      ? updateMutation.mutateAsync({ id: group.id, input: values })
      : createMutation.mutateAsync(values);

    promise
      .then(() => {
        toast.success(isEditing ? "Grupo atualizado." : "Grupo criado.");
        onOpenChange(false);
        router.refresh();
      })
      .catch((error: Error) => toast.error(error.message));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar grupo" : "Novo grupo de adicionais"}</DialogTitle>
          <DialogDescription>
            Grupos são reutilizáveis — vincule o mesmo grupo a vários produtos na tela de Produtos.
          </DialogDescription>
        </DialogHeader>

        <form
          id="modifier-group-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="group-name" className="mb-1.5 block text-sm font-medium">
              Nome do grupo
            </label>
            <Input id="group-name" placeholder="Molhos" {...register("name")} autoFocus />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="group-selection-type" className="mb-1.5 block text-sm font-medium">
                Seleção
              </label>
              <Controller
                control={control}
                name="selectionType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="group-selection-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Única</SelectItem>
                      <SelectItem value="multiple">Múltipla</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label htmlFor="group-min" className="mb-1.5 block text-sm font-medium">
                Mínimo
              </label>
              <Input
                id="group-min"
                type="number"
                min={0}
                {...register("minSelections", { valueAsNumber: true })}
              />
              {errors.minSelections && (
                <p className="mt-1 text-xs text-destructive">{errors.minSelections.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="group-max" className="mb-1.5 block text-sm font-medium">
                Máximo
              </label>
              <Input
                id="group-max"
                type="number"
                min={1}
                disabled={selectionType === "single"}
                {...register("maxSelections", { valueAsNumber: true })}
              />
              {errors.maxSelections && (
                <p className="mt-1 text-xs text-destructive">{errors.maxSelections.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="group-sort-order" className="mb-1.5 block text-sm font-medium">
                Ordem
              </label>
              <Input
                id="group-sort-order"
                type="number"
                min={0}
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Obrigatório</p>
              <p className="text-xs text-muted-foreground">
                O cliente precisa escolher ao menos {minSelections || 1} opção(ões).
              </p>
            </div>
            <Controller
              control={control}
              name="isRequired"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Opções</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ name: "", priceCents: 0, isAvailable: true, sortOrder: fields.length })
                }
              >
                <Plus className="size-4" aria-hidden />
                Adicionar opção
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Nenhuma opção ainda — adicione ao menos uma.
              </p>
            )}

            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <Input
                    placeholder="Nome (ex.: Ketchup)"
                    className="flex-1"
                    {...register(`options.${index}.name` as const)}
                  />
                  <Controller
                    control={control}
                    name={`options.${index}.priceCents` as const}
                    render={({ field: priceField }) => (
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="Preço"
                        className="w-24"
                        value={centsToReais(priceField.value)}
                        onChange={(event) => priceField.onChange(reaisToCents(Number(event.target.value)))}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`options.${index}.isAvailable` as const}
                    render={({ field: availableField }) => (
                      <Switch
                        checked={availableField.value}
                        onCheckedChange={availableField.onChange}
                        aria-label="Disponível"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover opção"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
            {errors.options?.message && (
              <p className="text-xs text-destructive">{errors.options.message}</p>
            )}
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
          <Button type="submit" form="modifier-group-form" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
