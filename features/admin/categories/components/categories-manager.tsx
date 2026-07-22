"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CategoryFormDialog } from "@/features/admin/categories/components/category-form-dialog";
import { useDeleteCategory } from "@/features/admin/categories/use-category-mutations";
import type { Paginated } from "@/features/admin/pagination";
import type { AdminCategory } from "@/types/domain";

export function CategoriesManager({
  result,
}: {
  result: Paginated<AdminCategory>;
}) {
  const router = useRouter();
  const deleteMutation = useDeleteCategory();

  const [formState, setFormState] = useState<{
    open: boolean;
    category: AdminCategory | null;
  }>({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Categoria excluída.");
        setDeleteTarget(null);
        router.refresh();
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <AdminListToolbar
        searchPlaceholder="Buscar categoria..."
        createLabel="Nova categoria"
        onCreate={() => setFormState({ open: true, category: null })}
      />

      {result.items.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Nenhuma categoria encontrada"
          description="Crie a primeira categoria do cardápio."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {category.color && (
                        <span
                          aria-hidden
                          className="size-3 shrink-0 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {category.productCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {category.sortOrder}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={category.isActive ? "success" : "outline"}>
                        {category.isActive ? "Visível" : "Oculta"}
                      </Badge>
                      {category.isActive && !category.isAvailable && (
                        <Badge variant="warning">Indisponível</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${category.name}`}
                        onClick={() => setFormState({ open: true, category })}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${category.name}`}
                        onClick={() => setDeleteTarget(category)}
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

      <CategoryFormDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
        category={formState.category}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir categoria"
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
