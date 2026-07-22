"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ImageUpload } from "@/components/image-upload";
import {
  productCoreSchema,
  type ProductCoreInput,
} from "@/features/admin/products/schema";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/admin/products/use-product-mutations";
import type { AdminProduct } from "@/types/domain";

const EMPTY_VALUES: ProductCoreInput = {
  categoryId: "",
  name: "",
  description: "",
  priceCents: 0,
  promoPriceCents: null,
  sku: "",
  prepTimeMinutes: 15,
  sortOrder: 0,
  isAvailable: true,
  isPublished: true,
  isFeatured: false,
  isNew: false,
  isBestseller: false,
};

function centsToReais(cents: number): number {
  return Math.round(cents) / 100;
}

function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

function toCommaText(values: string[]): string {
  return values.join(", ");
}

function fromCommaText(text: string): string[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFormValues(product: AdminProduct): ProductCoreInput {
  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description ?? "",
    priceCents: product.priceCents,
    promoPriceCents: product.promoPriceCents,
    sku: product.sku ?? "",
    prepTimeMinutes: product.prepTimeMinutes,
    sortOrder: product.sortOrder,
    isAvailable: product.isAvailable,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestseller: product.isBestseller,
  };
}

/**
 * Um único dialog para criar/editar produto — `product: null` = modo
 * criação. Sem efeito de sincronização: o pai (`ProductsManager`) monta uma
 * instância nova (via `key`) a cada abertura, então o estado inicial é
 * sempre calculado direto dos props na primeira renderização.
 */
export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categoryOptions,
  modifierGroupOptions,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
  categoryOptions: { id: string; name: string }[];
  modifierGroupOptions: { id: string; name: string }[];
  tenantId: string;
}) {
  const router = useRouter();
  const isEditing = product !== null;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);
  const [ingredientsText, setIngredientsText] = useState(
    product ? toCommaText(product.ingredients) : "",
  );
  const [allergensText, setAllergensText] = useState(
    product ? toCommaText(product.allergens) : "",
  );
  const [tagsText, setTagsText] = useState(product ? toCommaText(product.tags) : "");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    product?.modifierGroupIds ?? [],
  );

  function toggleGroup(groupId: string, checked: boolean) {
    setSelectedGroupIds((current) =>
      checked ? [...current, groupId] : current.filter((id) => id !== groupId),
    );
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductCoreInput>({
    resolver: zodResolver(productCoreSchema),
    defaultValues: product ? toFormValues(product) : EMPTY_VALUES,
  });

  function onSubmit(values: ProductCoreInput) {
    const payload = {
      ...values,
      description: values.description?.trim() || null,
      sku: values.sku?.trim() || null,
      imageUrl,
      ingredients: fromCommaText(ingredientsText),
      allergens: fromCommaText(allergensText),
      tags: fromCommaText(tagsText),
      modifierGroupIds: selectedGroupIds,
    };

    const promise = isEditing
      ? updateMutation.mutateAsync({ id: product.id, input: payload })
      : createMutation.mutateAsync(payload);

    promise
      .then(() => {
        toast.success(isEditing ? "Produto atualizado." : "Produto criado.");
        onOpenChange(false);
        router.refresh();
      })
      .catch((error: Error) => toast.error(error.message));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            Alterações refletem automaticamente no cardápio do cliente.
          </DialogDescription>
        </DialogHeader>

        <form
          id="product-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            pathPrefix={`${tenantId}/products`}
            label="Foto do produto"
            aspectClassName="aspect-square"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-name" className="mb-1.5 block text-sm font-medium">
                Nome
              </label>
              <Input id="product-name" {...register("name")} autoFocus />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="product-category" className="mb-1.5 block text-sm font-medium">
                Categoria
              </label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="product-category" className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="product-description" className="mb-1.5 block text-sm font-medium">
              Descrição
            </label>
            <Textarea id="product-description" rows={2} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="product-price" className="mb-1.5 block text-sm font-medium">
                Preço (R$)
              </label>
              <Controller
                control={control}
                name="priceCents"
                render={({ field }) => (
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min={0}
                    value={centsToReais(field.value)}
                    onChange={(event) => field.onChange(reaisToCents(Number(event.target.value)))}
                  />
                )}
              />
              {errors.priceCents && (
                <p className="mt-1 text-xs text-destructive">{errors.priceCents.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="product-promo-price" className="mb-1.5 block text-sm font-medium">
                Preço promo. (R$)
              </label>
              <Controller
                control={control}
                name="promoPriceCents"
                render={({ field }) => (
                  <Input
                    id="product-promo-price"
                    type="number"
                    step="0.01"
                    min={0}
                    value={field.value == null ? "" : centsToReais(field.value)}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === "" ? null : reaisToCents(Number(event.target.value)),
                      )
                    }
                  />
                )}
              />
              {errors.promoPriceCents && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.promoPriceCents.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="product-prep-time" className="mb-1.5 block text-sm font-medium">
                Preparo (min)
              </label>
              <Input
                id="product-prep-time"
                type="number"
                min={0}
                {...register("prepTimeMinutes", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label htmlFor="product-sort-order" className="mb-1.5 block text-sm font-medium">
                Ordem
              </label>
              <Input
                id="product-sort-order"
                type="number"
                min={0}
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-sku" className="mb-1.5 block text-sm font-medium">
              SKU interno (opcional)
            </label>
            <Input id="product-sku" {...register("sku")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="product-ingredients" className="mb-1.5 block text-sm font-medium">
                Ingredientes
              </label>
              <Input
                id="product-ingredients"
                placeholder="pão, carne, queijo"
                value={ingredientsText}
                onChange={(event) => setIngredientsText(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="product-allergens" className="mb-1.5 block text-sm font-medium">
                Alérgenos
              </label>
              <Input
                id="product-allergens"
                placeholder="glúten, lactose"
                value={allergensText}
                onChange={(event) => setAllergensText(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="product-tags" className="mb-1.5 block text-sm font-medium">
                Tags
              </label>
              <Input
                id="product-tags"
                placeholder="picante, vegetariano"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium">Grupos de adicionais</p>
            {modifierGroupOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhum grupo cadastrado ainda — crie em &ldquo;Adicionais&rdquo;.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 rounded-lg border p-3">
                {modifierGroupOptions.map((group) => (
                  <label
                    key={group.id}
                    className="flex items-center gap-2 text-sm"
                    htmlFor={`product-modifier-group-${group.id}`}
                  >
                    <Checkbox
                      id={`product-modifier-group-${group.id}`}
                      checked={selectedGroupIds.includes(group.id)}
                      onCheckedChange={(checked) => toggleGroup(group.id, checked === true)}
                    />
                    {group.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ToggleRow
              control={control}
              name="isPublished"
              title="Visível no cardápio"
              description="Desative para ocultar da loja."
            />
            <ToggleRow
              control={control}
              name="isAvailable"
              title="Disponível para pedidos"
              description="Desative para pausar vendas sem ocultar."
            />
            <ToggleRow
              control={control}
              name="isFeatured"
              title="Destaque"
              description="Aparece na seção de promoções/destaques."
            />
            <ToggleRow
              control={control}
              name="isNew"
              title="Novo"
              description="Aparece na seção de novidades."
            />
            <ToggleRow
              control={control}
              name="isBestseller"
              title="Mais vendido"
              description="Selo manual — cálculo automático fica para o futuro."
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
          <Button type="submit" form="product-form" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  control,
  name,
  title,
  description,
}: {
  control: ReturnType<typeof useForm<ProductCoreInput>>["control"];
  name: "isPublished" | "isAvailable" | "isFeatured" | "isNew" | "isBestseller";
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="min-w-0 pr-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        )}
      />
    </div>
  );
}
