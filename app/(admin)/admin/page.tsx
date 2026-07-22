import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  PackageX,
  Tags,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

import { DashboardSkeleton } from "@/features/admin/components/dashboard-skeleton";
import { MetricCard } from "@/features/admin/components/metric-card";
import { isOrderLate } from "@/lib/kitchen/order-status";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getActiveKitchenOrders } from "@/services/kitchen-orders.service";
import { getMenuByTenantSlug } from "@/services/menu.service";
import { formatCentsToBRL } from "@/utils/format";

export const metadata = { title: "Dashboard" };

/**
 * Métricas derivadas dos dados já existentes (services da cozinha e do
 * cardápio) — nenhum dado fabricado. Faturamento/histórico consolidado
 * fica para uma fase futura com dados de pedidos finalizados (BACKLOG).
 */
export default function AdminHomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardMetrics />
    </Suspense>
  );
}

async function DashboardMetrics() {
  const slug = await resolveTenantSlug();
  const [ordersResult, menu] = await Promise.all([
    getActiveKitchenOrders(slug),
    getMenuByTenantSlug(slug),
  ]);

  if (!ordersResult || !menu) notFound();

  const { orders } = ordersResult;
  const lateCount = orders.filter((order) => isOrderLate(order)).length;
  const activeRevenueCents = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.totalCents, 0);

  const allProducts = menu.categories.flatMap((category) => category.products);
  const unavailableCount = allProducts.filter(
    (product) => !product.isAvailable,
  ).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={ClipboardList}
          label="Pedidos ativos"
          value={String(orders.length)}
          hint="Não inclui finalizados"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Pedidos em atraso"
          value={String(lateCount)}
          hint="Passaram do horário previsto"
        />
        <MetricCard
          icon={Wallet}
          label="Total em pedidos ativos"
          value={formatCentsToBRL(activeRevenueCents)}
          hint="Exclui cancelados — não é faturamento consolidado"
        />
        <MetricCard
          icon={UtensilsCrossed}
          label="Produtos publicados"
          value={String(allProducts.length)}
        />
        <MetricCard
          icon={PackageX}
          label="Produtos indisponíveis"
          value={String(unavailableCount)}
        />
        <MetricCard
          icon={Tags}
          label="Categorias"
          value={String(menu.categories.length)}
        />
      </div>
    </div>
  );
}
