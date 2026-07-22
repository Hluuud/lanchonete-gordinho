import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { OrderStatusBadge } from "@/features/kitchen/components/order-status-badge";
import { ORDER_TYPE_LABELS } from "@/lib/kitchen/order-status";
import { formatCentsToBRL } from "@/utils/format";
import type { Order } from "@/types/domain";

const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Tabela somente leitura de pedidos ativos (mesma fonte da cozinha —
 * `getActiveKitchenOrders`, que exclui apenas `completed`; o histórico
 * completo fica para uma fase futura, ver BACKLOG).
 */
export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Nenhum pedido ativo"
        description="Pedidos novos aparecem aqui assim que forem recebidos."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-secondary/60 text-left text-xs font-semibold text-muted-foreground uppercase">
            <th className="px-4 py-3">Senha</th>
            <th className="px-4 py-3">Horário</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Itens</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-bold tabular-nums">
                #{order.orderNumber ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {TIME_FORMAT.format(new Date(order.createdAt))}
              </td>
              <td className="px-4 py-3">{ORDER_TYPE_LABELS[order.orderType]}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? "item" : "itens"}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {formatCentsToBRL(order.totalCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
