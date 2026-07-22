import { Suspense } from "react";
import { notFound } from "next/navigation";

import { KitchenBoard } from "@/features/kitchen/components/kitchen-board";
import { KitchenBoardSkeleton } from "@/features/kitchen/components/kitchen-board-skeleton";
import { requireRole } from "@/lib/auth/session";
import { KITCHEN_STAFF_ROLES } from "@/lib/kitchen/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getActiveKitchenOrders } from "@/services/kitchen-orders.service";

export const metadata = { title: "Cozinha" };

/**
 * Painel da Cozinha (Fase 2): busca os pedidos ativos no servidor (RLS do
 * usuário autenticado) e entrega já carregados para `KitchenBoard`, que passa
 * a atualizá-los via Supabase Realtime — ver `docs/kitchen-panel.md`.
 */
export default async function KitchenHomePage() {
  await requireRole(KITCHEN_STAFF_ROLES);

  return (
    <Suspense fallback={<KitchenBoardSkeleton />}>
      <KitchenBoardContent />
    </Suspense>
  );
}

async function KitchenBoardContent() {
  const slug = await resolveTenantSlug();
  const result = await getActiveKitchenOrders(slug);

  if (!result) {
    notFound();
  }

  return (
    <KitchenBoard initialOrders={result.orders} tenantId={result.tenant.id} />
  );
}
