"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Printer as PrinterIcon, Trash2 } from "lucide-react";
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
import type { Paginated } from "@/features/admin/pagination";
import { PrinterFormDialog } from "@/features/admin/printers/components/printer-form-dialog";
import {
  PRINTER_CONNECTION_LABELS,
  PRINTER_ROLE_LABELS,
} from "@/features/admin/printers/labels";
import { useDeletePrinter } from "@/features/admin/printers/use-printer-mutations";
import type { AdminPrinter } from "@/types/domain";

export function PrintersManager({ result }: { result: Paginated<AdminPrinter> }) {
  const router = useRouter();
  const deleteMutation = useDeletePrinter();

  const [formState, setFormState] = useState<{
    open: boolean;
    printer: AdminPrinter | null;
  }>({ open: false, printer: null });
  const [deleteTarget, setDeleteTarget] = useState<AdminPrinter | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Impressora excluída.");
        setDeleteTarget(null);
        router.refresh();
      },
      onError: (error: Error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <AdminListToolbar
        searchPlaceholder="Buscar impressora..."
        createLabel="Nova impressora"
        onCreate={() => setFormState({ open: true, printer: null })}
      />

      {result.items.length === 0 ? (
        <EmptyState
          icon={PrinterIcon}
          title="Nenhuma impressora cadastrada"
          description="Cadastre a primeira impressora do estabelecimento."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Impressora</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Conexão</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((printer) => (
                <TableRow key={printer.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{printer.name}</span>
                      {printer.model && (
                        <span className="text-xs text-muted-foreground">{printer.model}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{PRINTER_ROLE_LABELS[printer.role]}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{PRINTER_CONNECTION_LABELS[printer.connectionType]}</span>
                      {printer.connectionType === "network" && printer.ipAddress && (
                        <span className="text-xs text-muted-foreground">
                          {printer.ipAddress}
                          {printer.port ? `:${printer.port}` : ""}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{printer.paperWidth}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={printer.isActive ? "success" : "outline"}>
                        {printer.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                      {printer.autoPrint && <Badge variant="secondary">Auto</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${printer.name}`}
                        onClick={() => setFormState({ open: true, printer })}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${printer.name}`}
                        onClick={() => setDeleteTarget(printer)}
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

      <PrinterFormDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((state) => ({ ...state, open }))}
        printer={formState.printer}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir impressora"
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
