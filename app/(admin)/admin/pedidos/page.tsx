import { notFound } from "next/navigation";

import { OrdersTable } from "@/features/admin/components/orders-table";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getActiveKitchenOrders } from "@/services/kitchen-orders.service";

export const metadata = { title: "Pedidos" };

/**
 * Pedidos ativos, somente leitura — reusa `getActiveKitchenOrders` (mesmo
 * service da cozinha) direto no Server Component, sem hop HTTP. Sem
 * realtime aqui (ver BACKLOG); a operação em tempo real acontece em `/cozinha`.
 */
export default async function AdminPedidosPage() {
  const slug = await resolveTenantSlug();
  const result = await getActiveKitchenOrders(slug);

  if (!result) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">
        {result.orders.length}{" "}
        {result.orders.length === 1 ? "pedido ativo" : "pedidos ativos"} — não
        inclui pedidos finalizados.
      </p>
      <OrdersTable orders={result.orders} />
    </div>
  );
}
