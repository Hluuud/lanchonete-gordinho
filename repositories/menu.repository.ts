import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getPageRange } from "@/features/admin/pagination";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/**
 * Row de categoria com seus produtos aninhados, como retornada pelo Supabase.
 * Exportada para que a camada de serviço mapeie para o domínio.
 */
export type CategoryWithProductsRow = Awaited<
  ReturnType<typeof findCategoriesWithProducts>
>[number];

/**
 * Busca categorias ativas do tenant com os produtos relacionados.
 * A visibilidade final (publicado/disponível) é garantida pela RLS no banco;
 * regras de apresentação (ordenação, filtro de vazios) ficam na camada de serviço.
 */
export async function findCategoriesWithProducts(
  client: Client,
  tenantId: string,
) {
  const { data, error } = await client
    .from("categories")
    .select(
      `
      id,
      name,
      slug,
      sort_order,
      products (
        id,
        category_id,
        name,
        description,
        price_cents,
        image_url,
        prep_time_minutes,
        is_available,
        is_published,
        is_featured,
        is_new,
        sort_order
      )
    `,
    )
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin — Categorias (Sprint 5, Fase 1)
//
// Diferente de `findCategoriesWithProducts` (vitrine pública, só ativas), as
// funções abaixo servem a tela de gestão: veem categorias inativas/
// indisponíveis, oferecem paginação/busca/ordenação e escrevem.
// ---------------------------------------------------------------------------

const ADMIN_CATEGORY_SELECT = `
  id, name, slug, icon, color, sort_order, is_active, is_available,
  created_at, updated_at,
  products (count)
`;

/** Row de categoria administrativa (com contagem de produtos), como retornada pelo Supabase. */
export type AdminCategoryRow = Awaited<
  ReturnType<typeof findAllCategoriesByTenant>
>["rows"][number];

export type AdminCategoryListParams = {
  page: number;
  pageSize: number;
  q: string;
  /** Validado contra uma allowlist em `features/admin/pagination.ts` antes de chegar aqui. */
  sort: string;
  order: "asc" | "desc";
};

/** Todas as categorias do tenant (ativas ou não), paginadas/buscáveis — visão de gestão. */
export async function findAllCategoriesByTenant(
  client: Client,
  tenantId: string,
  { page, pageSize, q, sort, order }: AdminCategoryListParams,
) {
  const [from, to] = getPageRange(page, pageSize);

  let query = client
    .from("categories")
    .select(ADMIN_CATEGORY_SELECT, { count: "exact" })
    .eq("tenant_id", tenantId);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function findCategoryById(
  client: Client,
  tenantId: string,
  categoryId: string,
) {
  const { data, error } = await client
    .from("categories")
    .select(ADMIN_CATEGORY_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", categoryId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Quantos produtos referenciam esta categoria — usado para bloquear exclusão (o FK é `on delete cascade`). */
export async function countProductsInCategory(
  client: Client,
  tenantId: string,
  categoryId: string,
): Promise<number> {
  const { count, error } = await client
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("category_id", categoryId);

  if (error) throw error;
  return count ?? 0;
}

export type CreateCategoryInput = {
  tenantId: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  isAvailable: boolean;
};

export async function createCategory(client: Client, input: CreateCategoryInput) {
  const { data, error } = await client
    .from("categories")
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      slug: input.slug,
      icon: input.icon,
      color: input.color,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      is_available: input.isAvailable,
    })
    .select(ADMIN_CATEGORY_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export type UpdateCategoryInput = Partial<
  Omit<CreateCategoryInput, "tenantId">
>;

export async function updateCategory(
  client: Client,
  tenantId: string,
  categoryId: string,
  input: UpdateCategoryInput,
) {
  const payload: Database["public"]["Tables"]["categories"]["Update"] = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.color !== undefined) payload.color = input.color;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.isActive !== undefined) payload.is_active = input.isActive;
  if (input.isAvailable !== undefined) payload.is_available = input.isAvailable;

  const { data, error } = await client
    .from("categories")
    .update(payload)
    .eq("id", categoryId)
    .eq("tenant_id", tenantId)
    .select(ADMIN_CATEGORY_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteCategory(
  client: Client,
  tenantId: string,
  categoryId: string,
) {
  const { error } = await client
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("tenant_id", tenantId);

  if (error) throw error;
}

/** Pares `{id, name}` de todos os produtos do tenant — para selects de combo (produto principal, produtos elegíveis por slot). */
export async function findProductOptions(client: Client, tenantId: string) {
  const { data, error } = await client
    .from("products")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Pares `{id, name}` de todas as categorias do tenant — para popular o `Select` do formulário de produto. */
export async function findCategoryOptions(client: Client, tenantId: string) {
  const { data, error } = await client
    .from("categories")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin — Produtos (Sprint 5, Fase 2)
//
// Diferente do cardápio público (só publicado/disponível), a gestão vê e
// edita tudo — rascunhos, indisponíveis, ocultos.
// ---------------------------------------------------------------------------

const ADMIN_PRODUCT_SELECT = `
  id, category_id, name, description, price_cents, promo_price_cents, sku,
  image_url, prep_time_minutes, sort_order, is_available, is_published,
  is_featured, is_new, is_bestseller, ingredients, allergens, tags,
  created_at, updated_at,
  categories!products_category_id_tenant_id_fkey ( name ),
  product_modifier_groups ( group_id )
`;

/** Row de produto administrativo (com o nome da categoria aninhado), como retornada pelo Supabase. */
export type AdminProductRow = Awaited<
  ReturnType<typeof findAllProductsByTenant>
>["rows"][number];

export type AdminProductListParams = {
  page: number;
  pageSize: number;
  q: string;
  /** Validado contra uma allowlist em `features/admin/pagination.ts` antes de chegar aqui. */
  sort: string;
  order: "asc" | "desc";
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
};

/** Todos os produtos do tenant (publicados ou não), paginados/buscáveis/filtráveis — visão de gestão. */
export async function findAllProductsByTenant(
  client: Client,
  tenantId: string,
  { page, pageSize, q, sort, order, categoryId, isAvailable, isFeatured }: AdminProductListParams,
) {
  const [from, to] = getPageRange(page, pageSize);

  let query = client
    .from("products")
    .select(ADMIN_PRODUCT_SELECT, { count: "exact" })
    .eq("tenant_id", tenantId);

  if (q) {
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (isAvailable !== undefined) {
    query = query.eq("is_available", isAvailable);
  }
  if (isFeatured !== undefined) {
    query = query.eq("is_featured", isFeatured);
  }

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function findProductById(
  client: Client,
  tenantId: string,
  productId: string,
) {
  const { data, error } = await client
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type CreateProductInput = {
  tenantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  priceCents: number;
  promoPriceCents: number | null;
  sku: string | null;
  imageUrl: string | null;
  prepTimeMinutes: number;
  sortOrder: number;
  isAvailable: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  ingredients: string[];
  allergens: string[];
  tags: string[];
};

export async function createProduct(client: Client, input: CreateProductInput) {
  const { data, error } = await client
    .from("products")
    .insert({
      tenant_id: input.tenantId,
      category_id: input.categoryId,
      name: input.name,
      description: input.description,
      price_cents: input.priceCents,
      promo_price_cents: input.promoPriceCents,
      sku: input.sku,
      image_url: input.imageUrl,
      prep_time_minutes: input.prepTimeMinutes,
      sort_order: input.sortOrder,
      is_available: input.isAvailable,
      is_published: input.isPublished,
      is_featured: input.isFeatured,
      is_new: input.isNew,
      is_bestseller: input.isBestseller,
      ingredients: input.ingredients,
      allergens: input.allergens,
      tags: input.tags,
    })
    .select(ADMIN_PRODUCT_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export type UpdateProductInput = Partial<Omit<CreateProductInput, "tenantId">>;

export async function updateProduct(
  client: Client,
  tenantId: string,
  productId: string,
  input: UpdateProductInput,
) {
  const payload: Database["public"]["Tables"]["products"]["Update"] = {};
  if (input.categoryId !== undefined) payload.category_id = input.categoryId;
  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.priceCents !== undefined) payload.price_cents = input.priceCents;
  if (input.promoPriceCents !== undefined) payload.promo_price_cents = input.promoPriceCents;
  if (input.sku !== undefined) payload.sku = input.sku;
  if (input.imageUrl !== undefined) payload.image_url = input.imageUrl;
  if (input.prepTimeMinutes !== undefined) payload.prep_time_minutes = input.prepTimeMinutes;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.isAvailable !== undefined) payload.is_available = input.isAvailable;
  if (input.isPublished !== undefined) payload.is_published = input.isPublished;
  if (input.isFeatured !== undefined) payload.is_featured = input.isFeatured;
  if (input.isNew !== undefined) payload.is_new = input.isNew;
  if (input.isBestseller !== undefined) payload.is_bestseller = input.isBestseller;
  if (input.ingredients !== undefined) payload.ingredients = input.ingredients;
  if (input.allergens !== undefined) payload.allergens = input.allergens;
  if (input.tags !== undefined) payload.tags = input.tags;

  const { data, error } = await client
    .from("products")
    .update(payload)
    .eq("id", productId)
    .eq("tenant_id", tenantId)
    .select(ADMIN_PRODUCT_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteProduct(
  client: Client,
  tenantId: string,
  productId: string,
) {
  const { error } = await client
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("tenant_id", tenantId);

  if (error) throw error;
}
