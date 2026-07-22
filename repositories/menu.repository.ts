import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

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
