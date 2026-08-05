import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MenuSkeleton } from "@/features/menu/components/menu-skeleton";
import { StoreExperience } from "@/features/menu/components/store-experience";
import { buildRestaurantJsonLd } from "@/lib/seo/restaurant-json-ld";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getMenuByTenantSlug } from "@/services/menu.service";

/** Sem `title` próprio: herda o default do layout raiz (já é `brand.name`). */
export const metadata: Metadata = buildPageMetadata({ path: "/" });

/**
 * Home da loja: resolve o tenant → serviço → repositório → Supabase (RLS
 * anon) no servidor, e entrega os dados já carregados para `StoreExperience`
 * (busca/filtro client-side, sem chamadas extra ao banco). Guest não
 * autentica para ver o cardápio.
 */
export default function StorePage() {
  const restaurantJsonLd = buildRestaurantJsonLd();

  return (
    <main className="flex flex-1 flex-col">
      {/* Dados 100% estáticos/confiáveis (marca, contato, horário) — sem
          risco de injeção via dangerouslySetInnerHTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
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
