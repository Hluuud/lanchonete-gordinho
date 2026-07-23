import { notFound } from "next/navigation";

import { CombosManager } from "@/features/admin/combos/components/combos-manager";
import { parseListParams, type RawSearchParams } from "@/features/admin/pagination";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { TenantNotFoundError, listAdminCombos } from "@/services/admin/combos.service";
import { listProductOptions } from "@/services/admin/products.service";
import { getTenantBySlug } from "@/services/tenant.service";

export const metadata = { title: "Combos" };

const ALLOWED_SORT = ["name", "sort_order", "created_at"] as const;

/**
 * Gestão de combos (Sprint 5, Fase 4): produto principal + slots de escolha.
 * Modelagem/administração apenas — o cliente ainda não compra combos (ver
 * BACKLOG).
 */
export default async function AdminCombosPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const params = parseListParams(rawParams, {
    allowedSort: ALLOWED_SORT,
    defaultSort: "sort_order",
  });

  const slug = await resolveTenantSlug();

  const [tenant, result, productOptions] = await Promise.all([
    getTenantBySlug(slug),
    listAdminCombos(slug, params).catch((error: unknown) => {
      if (error instanceof TenantNotFoundError) notFound();
      throw error;
    }),
    listProductOptions(slug),
  ]);

  if (!tenant) notFound();

  return (
    <CombosManager result={result} productOptions={productOptions} tenantId={tenant.id} />
  );
}
