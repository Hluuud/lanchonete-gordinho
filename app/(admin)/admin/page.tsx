import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  PackageX,
  Tags,
  Timer,
  UtensilsCrossed,
  Wallet,
  XCircle,
} from "lucide-react";

import { DashboardSkeleton } from "@/features/admin/components/dashboard-skeleton";
import { HourlyOrdersChart } from "@/features/admin/components/hourly-orders-chart";
import { MetricCard } from "@/features/admin/components/metric-card";
import { TopProductsList } from "@/features/admin/components/top-products-list";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getAdminDashboard } from "@/services/admin/dashboard.service";
import { getMenuByTenantSlug } from "@/services/menu.service";
import { formatCentsToBRL, formatMinutes } from "@/utils/format";

export const metadata = { title: "Dashboard" };

/**
 * Métricas agregadas de `orders`/`order_items` (Sprint 5, Fase 7) +
 * indicadores de catálogo já existentes (Sprint 4) — tudo dado real, nenhum
 * placeholder fabricado (ver `services/admin/dashboard.service.ts`).
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
  const [dashboard, menu] = await Promise.all([
    getAdminDashboard(slug),
    getMenuByTenantSlug(slug),
  ]);

  if (!dashboard || !menu) notFound();

  const allProducts = menu.categories.flatMap((category) => category.products);
  const unavailableCount = allProducts.filter((product) => !product.isAvailable).length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={Clock}
          label="Pedidos hoje"
          value={String(dashboard.ordersToday)}
        />
        <MetricCard
          icon={Timer}
          label="Em andamento"
          value={String(dashboard.inProgress)}
          hint="Fila atual, qualquer dia"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Finalizados hoje"
          value={String(dashboard.completedToday)}
        />
        <MetricCard
          icon={XCircle}
          label="Cancelados hoje"
          value={String(dashboard.cancelledToday)}
        />
        <MetricCard
          icon={Wallet}
          label="Ticket médio hoje"
          value={formatCentsToBRL(dashboard.avgTicketCents)}
        />
        <MetricCard
          icon={Timer}
          label="Tempo médio de preparo"
          value={
            dashboard.avgPrepTimeMinutes !== null
              ? formatMinutes(dashboard.avgPrepTimeMinutes)
              : "Sem dados"
          }
          hint={`Últimos ${dashboard.windowDays} dias`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopProductsList products={dashboard.topProducts} windowDays={dashboard.windowDays} />
        <HourlyOrdersChart
          hourlyCounts={dashboard.hourlyOrderCounts}
          peakHour={dashboard.peakHour}
          ordersPerHour={dashboard.ordersPerHour}
          windowDays={dashboard.windowDays}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
