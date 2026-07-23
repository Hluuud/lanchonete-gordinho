import { notFound } from "next/navigation";

import { parseListParams, type RawSearchParams } from "@/features/admin/pagination";
import { PrintersManager } from "@/features/admin/printers/components/printers-manager";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { TenantNotFoundError, listAdminPrinters } from "@/services/admin/printers.service";

export const metadata = { title: "Impressoras" };

const ALLOWED_SORT = ["name", "role", "created_at"] as const;

/**
 * Gestão de impressoras (Sprint 5, Fase 8): só persistência de configuração
 * — a execução real de impressão (ESC/POS) é evolução futura.
 */
export default async function AdminImpressorasPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const params = parseListParams(rawParams, {
    allowedSort: ALLOWED_SORT,
    defaultSort: "name",
  });

  const slug = await resolveTenantSlug();

  const result = await listAdminPrinters(slug, params).catch((error: unknown) => {
    if (error instanceof TenantNotFoundError) notFound();
    throw error;
  });

  return <PrintersManager result={result} />;
}
