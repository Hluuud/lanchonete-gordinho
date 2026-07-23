"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers3, Pencil, Trash2 } from "lucide-react";
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
import { ComboFormDialog } from "@/features/admin/combos/components/combo-form-dialog";
import { useDeleteCombo } from "@/features/admin/combos/use-combo-mutations";
import type { Paginated } from "@/features/admin/pagination";
import type { AdminCombo } from "@/types/domain";
import { formatCentsToBRL } from "@/utils/format";

export function CombosManager({
  result,
  productOptions,
  tenantId,
}: {
  result: Paginated<AdminCombo>;
  productOptions: { id: string; name: string }[];
  tenantId: string;
}) {
  const router = useRouter();
  const deleteMutation = useDeleteCombo();

  const [formState, setFormState] = useState<{ open: boolean; combo: AdminCombo | null }>({
    open: false,
    combo: null,
  });
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminCombo | null>(null);

  function openCreateDialog() {
    setFormKey((key) => key + 1);
    setFormState({ open: true, combo: null });
  }

  function openEditDialog(combo: AdminCombo) {
    setFormKey((key) => key + 1);
    setFormState({ open: true, combo });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Combo excluído.");
        setDeleteTarget(null);
        router.refresh();
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <AdminListToolbar
        searchPlaceholder="Buscar combo..."
        createLabel="Novo combo"
        onCreate={openCreateDialog}
      />

      {result.items.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="Nenhum combo cadastrado"
          description="Monte combos com produto principal e slots de escolha."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Combo</TableHead>
                <TableHead>Produto principal</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((combo) => (
                <TableRow key={combo.id}>
                  <TableCell className="font-medium">{combo.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {combo.mainProductName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {combo.slots.length === 0
                      ? "Nenhum"
                      : combo.slots.map((slot) => slot.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={combo.isAvailable ? "success" : "outline"}>
                      {combo.isAvailable ? "Disponível" : "Indisponível"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {combo.priceCents != null ? formatCentsToBRL(combo.priceCents) : "Calculado"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${combo.name}`}
                        onClick={() => openEditDialog(combo)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${combo.name}`}
                        onClick={() => setDeleteTarget(combo)}
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

      <ComboFormDialog
        key={formKey}
        open={formState.open}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
        combo={formState.combo}
        productOptions={productOptions}
        tenantId={tenantId}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir combo"
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
