import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABELS,
} from "@/lib/kitchen/order-status";
import type { OrderStatus } from "@/types/domain";

/** Badge de status de pedido, reutilizável (card, filtros, histórico futuro). */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={ORDER_STATUS_COLOR[status]}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
