import { Suspense } from "react";
import { notFound } from "next/navigation";

import { MenuSkeleton } from "@/features/menu/components/menu-skeleton";
import { StoreExperience } from "@/features/menu/components/store-experience";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getMenuByTenantSlug } from "@/services/menu.service";

/**
 * Home da loja: resolve o tenant → serviço → repositório → Supabase (RLS
 * anon) no servidor, e entrega os dados já carregados para `StoreExperience`
 * (busca/filtro client-side, sem chamadas extra ao banco). Guest não
 * autentica para ver o cardápio.
 */
export default function StorePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent />
      </Suspense>
    </main>
  );
}

async function MenuContent() {
  const slug = await resolveTenantSlug();
  const menu = await getMenuByTenantSlug(slug);

  if (!menu) {
    notFound();
  }

  return <StoreExperience menu={menu} />;
}
