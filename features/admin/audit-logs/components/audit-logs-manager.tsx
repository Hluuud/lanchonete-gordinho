"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, ScrollText } from "lucide-react";

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
import { AuditLogDetailsDialog } from "@/features/admin/audit-logs/components/audit-log-details-dialog";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_TYPE_LABELS,
  auditEntityTypeLabel,
} from "@/features/admin/audit-logs/labels";
import type { Paginated } from "@/features/admin/pagination";
import { ADMIN_ROLE_LABELS } from "@/features/admin/role-labels";
import type { AdminAuditLog, AuditAction } from "@/types/domain";

const ALL_VALUE = "all";

const ACTION_BADGE_VARIANT: Record<AuditAction, "success" | "warning" | "secondary" | "outline"> = {
  login: "outline",
  logout: "outline",
  create: "success",
  update: "secondary",
  delete: "warning",
  price_change: "warning",
  cancel: "warning",
};

export function AuditLogsManager({ result }: { result: Paginated<AdminAuditLog> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const selectedAction = searchParams.get("action") ?? ALL_VALUE;
  const selectedEntityType = searchParams.get("entityType") ?? ALL_VALUE;

  function updateFilter(key: "action" | "entityType", value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === ALL_VALUE) params.delete(key);
    else params.set(key, value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={selectedAction} onValueChange={(value) => updateFilter("action", value)}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Toda ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Toda ação</SelectItem>
            {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedEntityType}
          onValueChange={(value) => updateFilter("entityType", value)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Toda entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Toda entidade</SelectItem>
            {Object.entries(AUDIT_ENTITY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Nenhum evento encontrado"
          description="Ações administrativas (criar, editar, excluir, login) aparecem aqui conforme acontecem."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quando</TableHead>
                <TableHead>Quem</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{log.actorEmail ?? "—"}</span>
                      {log.actorRole && (
                        <span className="text-xs text-muted-foreground">
                          {ADMIN_ROLE_LABELS[log.actorRole]}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ACTION_BADGE_VARIANT[log.action]}>
                      {AUDIT_ACTION_LABELS[log.action]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {auditEntityTypeLabel(log.entityType)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Ver detalhes"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="size-4" aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminListPagination page={result.page} totalPages={result.totalPages} />

      <AuditLogDetailsDialog
        log={selectedLog}
        open={selectedLog !== null}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
}
