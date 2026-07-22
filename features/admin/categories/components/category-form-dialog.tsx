"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import {
  categoryInputSchema,
  type CategoryFormValues,
  type CategoryInput,
} from "@/features/admin/categories/schema";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/features/admin/categories/use-category-mutations";
import type { AdminCategory } from "@/types/domain";

const EMPTY_VALUES: CategoryFormValues = {
  name: "",
  icon: "",
  color: "",
  sortOrder: 0,
  isActive: true,
  isAvailable: true,
};

function toFormValues(category: AdminCategory): CategoryFormValues {
  return {
    name: category.name,
    icon: category.icon ?? "",
    color: category.color ?? "",
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    isAvailable: category.isAvailable,
  };
}

/** Um único dialog para criar/editar — `category: null` = modo criação. */
export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminCategory | null;
}) {
  const router = useRouter();
  const isEditing = category !== null;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues, unknown, CategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) reset(category ? toFormValues(category) : EMPTY_VALUES);
  }, [open, category, reset]);

  function onSubmit(values: CategoryInput) {
    const payload: CategoryInput = {
      ...values,
      icon: values.icon?.trim() || null,
      color: values.color?.trim() || null,
    };

    const promise = isEditing
      ? updateMutation.mutateAsync({ id: category.id, input: payload })
      : createMutation.mutateAsync(payload);

    promise
      .then(() => {
        toast.success(isEditing ? "Categoria atualizada." : "Categoria criada.");
        onOpenChange(false);
        router.refresh();
      })
      .catch((error: Error) => toast.error(error.message));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            A ordem definida aqui reflete automaticamente no cardápio.
          </DialogDescription>
        </DialogHeader>

        <form
          id="category-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium">
              Nome
            </label>
            <Input id="category-name" {...register("name")} autoFocus />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category-icon" className="mb-1.5 block text-sm font-medium">
                Ícone (lucide)
              </label>
              <Input id="category-icon" placeholder="sandwich" {...register("icon")} />
            </div>
            <div>
              <label htmlFor="category-color" className="mb-1.5 block text-sm font-medium">
                Cor
              </label>
              <Input id="category-color" placeholder="#f97316" {...register("color")} />
              {errors.color && (
                <p className="mt-1 text-xs text-destructive">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="category-sort-order" className="mb-1.5 block text-sm font-medium">
              Ordem de exibição
            </label>
            <Input
              id="category-sort-order"
              type="number"
              min={0}
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Visível no cardápio</p>
              <p className="text-xs text-muted-foreground">
                Desative para ocultar a categoria inteira da loja.
              </p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Disponível para pedidos</p>
              <p className="text-xs text-muted-foreground">
                Desative para mostrar a categoria sem permitir novos pedidos agora.
              </p>
            </div>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
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
          <Button type="submit" form="category-form" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
