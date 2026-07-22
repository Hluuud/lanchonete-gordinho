import { notFound } from "next/navigation";

import { ModifierGroupsManager } from "@/features/admin/modifiers/components/modifier-groups-manager";
import { parseListParams, type RawSearchParams } from "@/features/admin/pagination";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  TenantNotFoundError,
  listAdminModifierGroups,
} from "@/services/admin/modifiers.service";

export const metadata = { title: "Adicionais" };

const ALLOWED_SORT = ["name", "sort_order", "created_at"] as const;

/**
 * Gestão de grupos de adicionais (Sprint 5, Fase 3): CRUD completo de
 * grupos reutilizáveis + suas opções. Modelagem/administração apenas — o
 * cliente ainda não escolhe adicionais ao pedir (ver BACKLOG).
 */
export default async function AdminAdicionaisPage({
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

  const result = await listAdminModifierGroups(slug, params).catch((error: unknown) => {
    if (error instanceof TenantNotFoundError) notFound();
    throw error;
  });

  return <ModifierGroupsManager result={result} />;
}
