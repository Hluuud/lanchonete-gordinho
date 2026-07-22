import "server-only";

import { buildPaginated, type ListParams, type Paginated } from "@/features/admin/pagination";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createProduct,
  deleteProduct,
  findAllProductsByTenant,
  findProductById,
  updateProduct,
  type AdminProductRow,
} from "@/repositories/menu.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { AdminProduct } from "@/types/domain";
import type {
  ProductInput,
  ProductUpdateInput,
} from "@/features/admin/products/schema";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

export class ProductNotFoundError extends Error {
  constructor() {
    super("Produto não encontrado.");
    this.name = "ProductNotFoundError";
  }
}

export class DuplicateSkuError extends Error {
  constructor(sku: string) {
    super(`Já existe um produto com o SKU "${sku}".`);
    this.name = "DuplicateSkuError";
  }
}

/** `promo_price_cents` precisa ser menor que `price_cents` — validado pela constraint no banco, revalidado aqui para mensagem amigável. */
export class InvalidPromoPriceError extends Error {
  constructor() {
    super("O preço promocional deve ser menor que o preço normal.");
    this.name = "InvalidPromoPriceError";
  }
}

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

function toAdminProduct(row: AdminProductRow): AdminProduct {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? "",
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    promoPriceCents: row.promo_price_cents,
    sku: row.sku,
    imageUrl: row.image_url,
    prepTimeMinutes: row.prep_time_minutes,
    sortOrder: row.sort_order,
    isAvailable: row.is_available,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    ingredients: row.ingredients,
    allergens: row.allergens,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function resolveTenantOrThrow(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();
  return { supabase, tenant };
}

export type AdminProductListFilters = ListParams & {
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
};

export async function listAdminProducts(
  tenantSlug: string,
  params: AdminProductListFilters,
): Promise<Paginated<AdminProduct>> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const { rows, total } = await findAllProductsByTenant(supabase, tenant.id, params);
  return buildPaginated(rows.map(toAdminProduct), total, params.page, params.pageSize);
}

export async function createAdminProduct(
  tenantSlug: string,
  input: ProductInput,
): Promise<AdminProduct> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  try {
    const row = await createProduct(supabase, {
      tenantId: tenant.id,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      priceCents: input.priceCents,
      promoPriceCents: input.promoPriceCents ?? null,
      sku: input.sku ?? null,
      imageUrl: input.imageUrl ?? null,
      prepTimeMinutes: input.prepTimeMinutes,
      sortOrder: input.sortOrder,
      isAvailable: input.isAvailable,
      isPublished: input.isPublished,
      isFeatured: input.isFeatured,
      isNew: input.isNew,
      isBestseller: input.isBestseller,
      ingredients: input.ingredients,
      allergens: input.allergens,
      tags: input.tags,
    });
    return toAdminProduct(row);
  } catch (error) {
    throw translateWriteError(error, input.sku ?? null);
  }
}

export async function updateAdminProduct(
  tenantSlug: string,
  productId: string,
  input: ProductUpdateInput,
): Promise<AdminProduct> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  try {
    const row = await updateProduct(supabase, tenant.id, productId, {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description === undefined ? undefined : input.description,
      priceCents: input.priceCents,
      promoPriceCents: input.promoPriceCents === undefined ? undefined : input.promoPriceCents,
      sku: input.sku === undefined ? undefined : input.sku,
      imageUrl: input.imageUrl === undefined ? undefined : input.imageUrl,
      prepTimeMinutes: input.prepTimeMinutes,
      sortOrder: input.sortOrder,
      isAvailable: input.isAvailable,
      isPublished: input.isPublished,
      isFeatured: input.isFeatured,
      isNew: input.isNew,
      isBestseller: input.isBestseller,
      ingredients: input.ingredients,
      allergens: input.allergens,
      tags: input.tags,
    });
    if (!row) throw new ProductNotFoundError();
    return toAdminProduct(row);
  } catch (error) {
    if (error instanceof ProductNotFoundError) throw error;
    throw translateWriteError(error, input.sku ?? null);
  }
}

export async function deleteAdminProduct(
  tenantSlug: string,
  productId: string,
): Promise<void> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const existing = await findProductById(supabase, tenant.id, productId);
  if (!existing) throw new ProductNotFoundError();

  await deleteProduct(supabase, tenant.id, productId);
}

function translateWriteError(error: unknown, sku: string | null): Error {
  const code = errorCode(error);
  if (code === UNIQUE_VIOLATION) return new DuplicateSkuError(sku ?? "");
  if (code === CHECK_VIOLATION) return new InvalidPromoPriceError();
  return error instanceof Error ? error : new Error("Erro inesperado.");
}

function errorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: string }).code;
  }
  return undefined;
}
