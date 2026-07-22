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
