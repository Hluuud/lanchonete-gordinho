import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/features/kitchen/components/order-status-badge";
import { ORDER_TYPE_LABELS } from "@/lib/kitchen/order-status";
import type { Order } from "@/types/domain";

const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Lista simples de pedidos cancelados — fora das 4 colunas do board, acessível pelo filtro "Cancelados". */
export function CancelledOrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <p className="px-2 py-12 text-center text-sm text-muted-foreground">
        Nenhum pedido cancelado.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-xl border border-border/60 bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-2xl font-black tabular-nums">
              #{order.orderNumber ?? "—"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <OrderStatusBadge status={order.status} />
              <Badge variant="outline">
                {ORDER_TYPE_LABELS[order.orderType]}
              </Badge>
            </div>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Recebido às {TIME_FORMAT.format(new Date(order.createdAt))}
            {order.cancelledAt &&
              ` · cancelado às ${TIME_FORMAT.format(new Date(order.cancelledAt))}`}
          </p>

          {order.cancelledReason && (
            <p className="mt-2 rounded-md bg-muted p-2 text-sm text-foreground">
              Motivo: {order.cancelledReason}
            </p>
          )}

          <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity}x {item.productName}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
