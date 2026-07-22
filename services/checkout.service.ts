import "server-only";

import { mapOrderCreationErrorMessage } from "@/lib/checkout/error-messages";
import { toOrder } from "@/lib/kitchen/order-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  OrderCreationError,
  createOrder,
  findOrderItemsByOrderId,
  findPublicOrderTracking,
  type CreateOrderItemInput,
} from "@/repositories/orders.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { Order, OrderType, PublicOrderTracking } from "@/types/domain";

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export type CheckoutInput = {
  orderType: OrderType;
  customerName: string | null;
  notes: string | null;
  items: CreateOrderItemInput[];
};

/**
 * Envia o checkout: resolve o tenant e delega a criação atômica a
 * `create_order` (RPC, ver ADR 0005/0006). Nunca confia em preço enviado
 * pelo client — a função só recebe `productId`/`quantity`/`notes`.
 */
export async function submitCheckout(
  tenantSlug: string,
  input: CheckoutInput,
): Promise<Order> {
  const supabase = await createSupabaseServerClient();

  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) {
    throw new CheckoutValidationError("Restaurante não encontrado.");
  }

  try {
    const row = await createOrder(supabase, {
      tenantId: tenant.id,
      orderType: input.orderType,
      customerName: input.customerName,
      customerPhone: null,
      notes: input.notes,
      items: input.items,
    });
    return toOrder(row);
  } catch (error) {
    if (error instanceof OrderCreationError) {
      throw new CheckoutValidationError(
        mapOrderCreationErrorMessage(error.code),
      );
    }
    throw error;
  }
}

/**
 * Detalhe de acompanhamento público (sem PII) — usa o client normal
 * (RLS-respeitando), **não** o admin: `order_tracking_status`/`order_items`
 * já são públicas para qualquer visitante com o `id` do pedido (ver ADR 0006).
 */
export async function getPublicOrderTracking(
  orderId: string,
): Promise<PublicOrderTracking | null> {
  const supabase = await createSupabaseServerClient();

  const tracking = await findPublicOrderTracking(supabase, orderId);
  if (!tracking) return null;

  const items = await findOrderItemsByOrderId(supabase, orderId);
  const subtotalCents = tracking.subtotal_cents;
  const serviceFeeCents = tracking.service_fee_cents;
  const discountCents = tracking.discount_cents;

  return {
    orderId: tracking.order_id,
    orderNumber: tracking.order_number,
    status: tracking.status,
    orderType: tracking.order_type,
    subtotalCents,
    serviceFeeCents,
    discountCents,
    totalCents: subtotalCents + serviceFeeCents - discountCents,
    estimatedReadyAt: tracking.estimated_ready_at,
    createdAt: tracking.created_at,
    updatedAt: tracking.updated_at,
    acceptedAt: tracking.accepted_at,
    preparingAt: tracking.preparing_at,
    readyAt: tracking.ready_at,
    deliveredAt: tracking.delivered_at,
    completedAt: tracking.completed_at,
    cancelledAt: tracking.cancelled_at,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name_snapshot,
      unitPriceCents: item.unit_price_cents,
      quantity: item.quantity,
      notes: item.notes,
    })),
  };
}
