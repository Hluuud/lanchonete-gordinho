import { notFound } from "next/navigation";

import { AuditLogsManager } from "@/features/admin/audit-logs/components/audit-logs-manager";
import { parseListParams, type RawSearchParams } from "@/features/admin/pagination";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { TenantNotFoundError, listAdminAuditLogs } from "@/services/admin/audit.service";

export const metadata = { title: "Auditoria" };

const ALLOWED_SORT = ["created_at"] as const;

/**
 * Log de auditoria somente-leitura (Sprint 5.5, Fase 1) — append-only, sem
 * criar/editar/excluir pela UI. Filtros de ação/entidade via `searchParams`,
 * mesmo padrão de paginação server-side de toda listagem administrativa.
 */
export default async function AdminAuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const params = parseListParams(rawParams, {
    allowedSort: ALLOWED_SORT,
    defaultSort: "created_at",
    defaultOrder: "desc",
  });

  const action = firstString(rawParams.action);
  const entityType = firstString(rawParams.entityType);

  const slug = await resolveTenantSlug();

  const result = await listAdminAuditLogs(slug, { ...params, action, entityType }).catch(
    (error: unknown) => {
      if (error instanceof TenantNotFoundError) notFound();
      throw error;
    },
  );

  return <AuditLogsManager result={result} />;
}

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
