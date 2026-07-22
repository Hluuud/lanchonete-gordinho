import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  findCategoriesWithProducts,
  type CategoryWithProductsRow,
} from "@/repositories/menu.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { Menu, MenuCategory, Product } from "@/types/domain";

type ProductRow = CategoryWithProductsRow["products"][number];

/**
 * Regras de negócio do cardápio. Orquestra os repositórios e mapeia as Rows do
 * banco para o domínio, aplicando políticas de apresentação:
 *  - somente produtos publicados são exibidos;
 *  - produtos são ordenados por `sort_order`;
 *  - categorias sem produtos visíveis são omitidas.
 *
 * A UI depende apenas do domínio (`Menu`), nunca do formato do banco.
 */
export async function getMenuByTenantSlug(slug: string): Promise<Menu | null> {
  const supabase = await createSupabaseServerClient();

  const tenant = await findTenantBySlug(supabase, slug);
  if (!tenant) return null;

  const rows = await findCategoriesWithProducts(supabase, tenant.id);

  const categories: MenuCategory[] = rows
    .map(toMenuCategory)
    .filter((category) => category.products.length > 0);

  return { tenant, categories };
}

function toMenuCategory(row: CategoryWithProductsRow): MenuCategory {
  const products = (row.products ?? [])
    .filter((product) => product.is_published)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toProduct);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    products,
  };
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    imageUrl: row.image_url,
    prepTimeMinutes: row.prep_time_minutes,
    isAvailable: row.is_available,
    badges: {
      isFeatured: row.is_featured,
      isNew: row.is_new,
    },
    // Sem avaliações no banco ainda — slot reservado na UI para o futuro.
    rating: null,
  };
}
