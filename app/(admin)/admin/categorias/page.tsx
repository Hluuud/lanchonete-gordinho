import { notFound } from "next/navigation";

import { CategoriesManager } from "@/features/admin/categories/components/categories-manager";
import { parseListParams, type RawSearchParams } from "@/features/admin/pagination";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  TenantNotFoundError,
  listAdminCategories,
} from "@/services/admin/categories.service";

export const metadata = { title: "Categorias" };

const ALLOWED_SORT = ["name", "sort_order", "created_at"] as const;

/**
 * Gestão de categorias: CRUD completo (Sprint 5, Fase 1). Paginação/busca/
 * ordenação são sempre lidas de `searchParams` e resolvidas no servidor —
 * ver `features/admin/pagination.ts`.
 */
export default async function AdminCategoriasPage({
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

  const result = await listAdminCategories(slug, params).catch((error: unknown) => {
    if (error instanceof TenantNotFoundError) notFound();
    throw error;
  });

  return <CategoriesManager result={result} />;
}
