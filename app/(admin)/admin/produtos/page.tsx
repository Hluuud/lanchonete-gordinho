import { notFound } from "next/navigation";

import { ProductsManager } from "@/features/admin/products/components/products-manager";
import { parseListParams, type RawSearchParams } from "@/features/admin/pagination";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { listCategoryOptions } from "@/services/admin/categories.service";
import { listModifierGroupOptions } from "@/services/admin/modifiers.service";
import {
  TenantNotFoundError,
  listAdminProducts,
} from "@/services/admin/products.service";
import { getTenantBySlug } from "@/services/tenant.service";

export const metadata = { title: "Produtos" };

const ALLOWED_SORT = ["name", "price_cents", "sort_order", "created_at"] as const;

/**
 * Gestão de produtos: CRUD completo (Sprint 5, Fase 2). Mesmo template da
 * Fase 1 (Categorias) — paginação/busca/ordenação/filtro sempre resolvidos
 * no servidor via `searchParams`.
 */
export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const params = parseListParams(rawParams, {
    allowedSort: ALLOWED_SORT,
    defaultSort: "sort_order",
  });

  const categoryId = firstString(rawParams.categoryId);
  const isAvailable = firstString(rawParams.isAvailable);
  const isFeatured = firstString(rawParams.isFeatured);

  const slug = await resolveTenantSlug();

  const [tenant, result, categoryOptions, modifierGroupOptions] = await Promise.all([
    getTenantBySlug(slug),
    listAdminProducts(slug, {
      ...params,
      categoryId,
      isAvailable: isAvailable === undefined ? undefined : isAvailable === "true",
      isFeatured: isFeatured === undefined ? undefined : isFeatured === "true",
    }).catch((error: unknown) => {
      if (error instanceof TenantNotFoundError) notFound();
      throw error;
    }),
    listCategoryOptions(slug),
    listModifierGroupOptions(slug),
  ]);

  if (!tenant) notFound();

  return (
    <ProductsManager
      result={result}
      categoryOptions={categoryOptions}
      modifierGroupOptions={modifierGroupOptions}
      tenantId={tenant.id}
    />
  );
}

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
