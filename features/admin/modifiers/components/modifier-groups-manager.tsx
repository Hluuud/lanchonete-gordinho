"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Pencil, Trash2 } from "lucide-react";
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
import { ModifierGroupFormDialog } from "@/features/admin/modifiers/components/modifier-group-form-dialog";
import { useDeleteModifierGroup } from "@/features/admin/modifiers/use-modifier-group-mutations";
import type { Paginated } from "@/features/admin/pagination";
import type { AdminModifierGroup } from "@/types/domain";
import { formatCentsToBRL } from "@/utils/format";

const SELECTION_TYPE_LABELS: Record<AdminModifierGroup["selectionType"], string> = {
  single: "Única",
  multiple: "Múltipla",
};

export function ModifierGroupsManager({ result }: { result: Paginated<AdminModifierGroup> }) {
  const router = useRouter();
  const deleteMutation = useDeleteModifierGroup();

  const [formState, setFormState] = useState<{
    open: boolean;
    group: AdminModifierGroup | null;
  }>({ open: false, group: null });
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminModifierGroup | null>(null);

  function openCreateDialog() {
    setFormKey((key) => key + 1);
    setFormState({ open: true, group: null });
  }

  function openEditDialog(group: AdminModifierGroup) {
    setFormKey((key) => key + 1);
    setFormState({ open: true, group });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Grupo excluído.");
        setDeleteTarget(null);
        router.refresh();
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <AdminListToolbar
        searchPlaceholder="Buscar grupo..."
        createLabel="Novo grupo"
        onCreate={openCreateDialog}
      />

      {result.items.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhum grupo de adicionais"
          description='Crie grupos como "Molhos" ou "Queijos" e reutilize entre produtos.'
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Seleção</TableHead>
                <TableHead>Opções</TableHead>
                <TableHead>Produtos vinculados</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <span className="font-medium">{group.name}</span>
                    {group.isRequired && (
                      <Badge variant="warning" className="ml-2">
                        Obrigatório
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {SELECTION_TYPE_LABELS[group.selectionType]} ({group.minSelections}–
                    {group.maxSelections})
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.options.length === 0 ? (
                      "Nenhuma"
                    ) : (
                      <span title={group.options.map((o) => o.name).join(", ")}>
                        {group.options.length}{" "}
                        {group.options.length === 1 ? "opção" : "opções"} (
                        {group.options
                          .slice(0, 2)
                          .map((o) => `${o.name} ${formatCentsToBRL(o.priceCents)}`)
                          .join(", ")}
                        {group.options.length > 2 ? "..." : ""})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {group.productCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${group.name}`}
                        onClick={() => openEditDialog(group)}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${group.name}`}
                        onClick={() => setDeleteTarget(group)}
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

      <ModifierGroupFormDialog
        key={formKey}
        open={formState.open}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
        group={formState.group}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir grupo de adicionais"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir "${deleteTarget.name}"? Ele será desvinculado de ${deleteTarget.productCount} produto(s). Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
