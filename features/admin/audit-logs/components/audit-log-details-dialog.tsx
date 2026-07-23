"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AUDIT_ACTION_LABELS, auditEntityTypeLabel } from "@/features/admin/audit-logs/labels";
import type { AdminAuditLog } from "@/types/domain";

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

/** Somente leitura — auditoria é append-only, não há o que editar aqui. */
export function AuditLogDetailsDialog({
  log,
  open,
  onOpenChange,
}: {
  log: AdminAuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {log ? AUDIT_ACTION_LABELS[log.action] : "Detalhes"}
            {log?.entityType && ` — ${auditEntityTypeLabel(log.entityType)}`}
          </DialogTitle>
          <DialogDescription>
            {log && new Date(log.createdAt).toLocaleString("pt-BR")} ·{" "}
            {log?.actorEmail ?? "Sistema"}
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="flex flex-col gap-4">
            <JsonBlock label="Antes" value={log.before} />
            <JsonBlock label="Depois" value={log.after} />
            <JsonBlock label="Metadados" value={log.metadata} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
