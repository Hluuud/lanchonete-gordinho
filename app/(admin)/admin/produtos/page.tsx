import { notFound } from "next/navigation";

import { ProductsTable } from "@/features/admin/components/products-table";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getMenuByTenantSlug } from "@/services/menu.service";

export const metadata = { title: "Produtos" };

/**
 * Cardápio publicado, somente leitura — reusa `getMenuByTenantSlug` (mesmo
 * service da loja) direto no Server Component, sem hop HTTP.
 */
export default async function AdminProdutosPage() {
  const slug = await resolveTenantSlug();
  const menu = await getMenuByTenantSlug(slug);

  if (!menu) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <ProductsTable categories={menu.categories} />
    </div>
  );
}
