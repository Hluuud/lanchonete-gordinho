import "server-only";

import { buildPaginated, type ListParams, type Paginated } from "@/features/admin/pagination";
import { slugify } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  countProductsInCategory,
  createCategory,
  deleteCategory,
  findAllCategoriesByTenant,
  findCategoryById,
  findCategoryOptions,
  updateCategory,
  type AdminCategoryRow,
} from "@/repositories/menu.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { AdminCategory } from "@/types/domain";
import type { CategoryInput, CategoryUpdateInput } from "@/features/admin/categories/schema";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

export class CategoryNotFoundError extends Error {
  constructor() {
    super("Categoria não encontrada.");
    this.name = "CategoryNotFoundError";
  }
}

/** Impede apagar uma categoria com produtos — o FK é `on delete cascade`, apagaria os produtos junto. */
export class CategoryHasProductsError extends Error {
  constructor(public readonly productCount: number) {
    super(
      `Esta categoria tem ${productCount} produto(s). Mova ou exclua os produtos antes de excluir a categoria.`,
    );
    this.name = "CategoryHasProductsError";
  }
}

/** Nome duplicado gera slug duplicado — a constraint `unique (tenant_id, slug)` rejeita, o service traduz. */
export class DuplicateCategoryNameError extends Error {
  constructor(name: string) {
    super(`Já existe uma categoria com um nome equivalente a "${name}".`);
    this.name = "DuplicateCategoryNameError";
  }
}

function toAdminCategory(row: AdminCategoryRow): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    isAvailable: row.is_available,
    productCount: row.products?.[0]?.count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const UNIQUE_VIOLATION = "23505";

async function resolveTenantOrThrow(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();
  return { supabase, tenant };
}

export async function listAdminCategories(
  tenantSlug: string,
  params: ListParams,
): Promise<Paginated<AdminCategory>> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const { rows, total } = await findAllCategoriesByTenant(supabase, tenant.id, params);
  return buildPaginated(rows.map(toAdminCategory), total, params.page, params.pageSize);
}

/** Pares `{id, name}` de todas as categorias — para popular o `Select` do formulário de produto. */
export async function listCategoryOptions(
  tenantSlug: string,
): Promise<{ id: string; name: string }[]> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);
  return findCategoryOptions(supabase, tenant.id);
}

export async function createAdminCategory(
  tenantSlug: string,
  input: CategoryInput,
): Promise<AdminCategory> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  try {
    const row = await createCategory(supabase, {
      tenantId: tenant.id,
      name: input.name,
      slug: slugify(input.name),
      icon: input.icon ?? null,
      color: input.color ?? null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      isAvailable: input.isAvailable,
    });
    return toAdminCategory(row);
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateCategoryNameError(input.name);
    throw error;
  }
}

export async function updateAdminCategory(
  tenantSlug: string,
  categoryId: string,
  input: CategoryUpdateInput,
): Promise<AdminCategory> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  try {
    const row = await updateCategory(supabase, tenant.id, categoryId, {
      name: input.name,
      slug: input.name !== undefined ? slugify(input.name) : undefined,
      icon: input.icon,
      color: input.color,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      isAvailable: input.isAvailable,
    });
    if (!row) throw new CategoryNotFoundError();
    return toAdminCategory(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateCategoryNameError(input.name ?? "");
    }
    throw error;
  }
}

export async function deleteAdminCategory(
  tenantSlug: string,
  categoryId: string,
): Promise<void> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const existing = await findCategoryById(supabase, tenant.id, categoryId);
  if (!existing) throw new CategoryNotFoundError();

  const productCount = await countProductsInCategory(supabase, tenant.id, categoryId);
  if (productCount > 0) throw new CategoryHasProductsError(productCount);

  await deleteCategory(supabase, tenant.id, categoryId);
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}
