"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ImageOff, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminListPagination } from "@/features/admin/components/admin-list-pagination";
import { AdminListToolbar } from "@/features/admin/components/admin-list-toolbar";
import { ProductFormDialog } from "@/features/admin/products/components/product-form-dialog";
import { useDeleteProduct } from "@/features/admin/products/use-product-mutations";
import type { Paginated } from "@/features/admin/pagination";
import type { AdminProduct } from "@/types/domain";
import { formatCentsToBRL } from "@/utils/format";

const ALL_CATEGORIES_VALUE = "all";

export function ProductsManager({
  result,
  categoryOptions,
  modifierGroupOptions,
  tenantId,
}: {
  result: Paginated<AdminProduct>;
  categoryOptions: { id: string; name: string }[];
  modifierGroupOptions: { id: string; name: string }[];
  tenantId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deleteMutation = useDeleteProduct();

  const [formState, setFormState] = useState<{
    open: boolean;
    product: AdminProduct | null;
  }>({ open: false, product: null });
  // Incrementado a cada abertura — força o dialog a remontar com estado
  // inicial fresco (evita sincronizar via efeito; ver product-form-dialog.tsx).
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  function openCreateDialog() {
    setFormKey((key) => key + 1);
    setFormState({ open: true, product: null });
  }

  function openEditDialog(product: AdminProduct) {
    setFormKey((key) => key + 1);
    setFormState({ open: true, product });
  }

  const selectedCategory = searchParams.get("categoryId") ?? ALL_CATEGORIES_VALUE;

  function handleCategoryFilterChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === ALL_CATEGORIES_VALUE) params.delete("categoryId");
    else params.set("categoryId", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Produto excluído.");
        setDeleteTarget(null);
        router.refresh();
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminListToolbar
          searchPlaceholder="Buscar produto ou SKU..."
          createLabel="Novo produto"
          onCreate={openCreateDialog}
        />
      </div>

      <Select value={selectedCategory} onValueChange={handleCategoryFilterChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Todas as categorias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES_VALUE}>Todas as categorias</SelectItem>
          {categoryOptions.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {result.items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Nenhum produto encontrado"
          description="Crie o primeiro produto do cardápio."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <ImageOff className="size-4 text-muted-foreground" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate font-medium">{product.name}</span>
                          {product.isFeatured && <Badge variant="accent">Destaque</Badge>}
                          {product.isNew && <Badge variant="secondary">Novo</Badge>}
                          {product.isBestseller && <Badge variant="secondary">Mais vendido</Badge>}
                        </div>
                        {product.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.categoryName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={product.isPublished ? "success" : "outline"}>
                        {product.isPublished ? "Visível" : "Oculto"}
                      </Badge>
                      {product.isPublished && !product.isAvailable && (
                        <Badge variant="warning">Indisponível</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.promoPriceCents != null ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCentsToBRL(product.priceCents)}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {formatCentsToBRL(product.promoPriceCents)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold tabular-nums">
                        {formatCentsToBRL(product.priceCents)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${product.name}`}
                        onClick={() => setDeleteTarget(product)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminListPagination page={result.page} totalPages={result.totalPages} />

      <ProductFormDialog
        key={formKey}
        open={formState.open}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
        product={formState.product}
        categoryOptions={categoryOptions}
        modifierGroupOptions={modifierGroupOptions}
        tenantId={tenantId}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir produto"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir "${deleteTarget.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
