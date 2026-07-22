import "server-only";

import type { OrderWithItemsRow } from "@/repositories/orders.repository";
import type { Order, OrderItem } from "@/types/domain";

type OrderItemRow = OrderWithItemsRow["order_items"][number];

/**
 * Mapeia a Row do Supabase (`orders` + `order_items` aninhados, ou o `jsonb`
 * equivalente retornado por `create_order`) para o domínio. Compartilhado
 * entre o Painel da Cozinha (`kitchen-orders.service.ts`) e o Checkout
 * (`checkout.service.ts`) — regra #4 do CLAUDE.md, não duplicar mapeamento.
 */
export function toOrder(row: OrderWithItemsRow): Order {
  const subtotalCents = row.subtotal_cents;
  const serviceFeeCents = row.service_fee_cents;
  const discountCents = row.discount_cents;

  return {
    id: row.id,
    tenantId: row.tenant_id,
    orderNumber: row.order_number,
    status: row.status,
    orderType: row.order_type,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    notes: row.notes,
    subtotalCents,
    serviceFeeCents,
    discountCents,
    couponCode: row.coupon_code,
    totalCents: subtotalCents + serviceFeeCents - discountCents,
    isPriority: row.is_priority,
    estimatedReadyAt: row.estimated_ready_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acceptedAt: row.accepted_at,
    preparingAt: row.preparing_at,
    readyAt: row.ready_at,
    deliveredAt: row.delivered_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    cancelledReason: row.cancelled_reason,
    items: (row.order_items ?? []).map(toOrderItem),
  };
}

export function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name_snapshot,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
    notes: row.notes,
  };
}
