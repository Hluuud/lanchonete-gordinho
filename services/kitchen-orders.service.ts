import "server-only";

import { toOrder } from "@/lib/kitchen/order-mapper";
import {
  ALLOWED_TRANSITIONS,
  STATUS_TIMESTAMP_COLUMN,
} from "@/lib/kitchen/order-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  findActiveOrdersByTenant,
  findOrderById,
  updateOrderPriority,
  updateOrderStatus,
} from "@/repositories/orders.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { Order, OrderStatus, Tenant } from "@/types/domain";

/** Transição de status não permitida pela máquina de estados (`lib/kitchen/order-status.ts`). */
export class InvalidOrderTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Transição de status inválida: "${from}" → "${to}".`);
    this.name = "InvalidOrderTransitionError";
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("Pedido não encontrado.");
    this.name = "OrderNotFoundError";
  }
}

/**
 * Pedidos ativos do Painel da Cozinha (todo o board, exceto arquivados),
 * junto do tenant resolvido (a página precisa do `tenant.id` para o canal
 * Realtime — evita uma segunda consulta de tenant). `null` quando o tenant
 * não existe — a rota/página decide o status HTTP.
 */
export async function getActiveKitchenOrders(
  tenantSlug: string,
): Promise<{ tenant: Tenant; orders: Order[] } | null> {
  const supabase = await createSupabaseServerClient();

  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) return null;

  const rows = await findActiveOrdersByTenant(supabase, tenant.id);
  return { tenant, orders: rows.map(toOrder) };
}

export async function getKitchenOrderById(
  tenantSlug: string,
  orderId: string,
): Promise<Order | null> {
  const supabase = await createSupabaseServerClient();

  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) return null;

  const row = await findOrderById(supabase, tenant.id, orderId);
  return row ? toOrder(row) : null;
}

/**
 * Muda o status de um pedido, revalidando a transição contra a máquina de
 * estados central — a única fonte de verdade da regra, mesmo que a UI (drag
 * ou botão) já só ofereça transições válidas como opção (CLAUDE.md #1).
 */
export async function changeOrderStatus(
  tenantSlug: string,
  orderId: string,
  nextStatus: OrderStatus,
  options?: { cancelledReason?: string },
): Promise<Order> {
  const supabase = await createSupabaseServerClient();

  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new OrderNotFoundError();

  const current = await findOrderById(supabase, tenant.id, orderId);
  if (!current) throw new OrderNotFoundError();

  if (!ALLOWED_TRANSITIONS[current.status].includes(nextStatus)) {
    throw new InvalidOrderTransitionError(current.status, nextStatus);
  }

  const timestampColumn = STATUS_TIMESTAMP_COLUMN[nextStatus];
  const updated = await updateOrderStatus(
    supabase,
    tenant.id,
    orderId,
    nextStatus,
    timestampColumn,
    options?.cancelledReason,
  );
  if (!updated) throw new OrderNotFoundError();

  return toOrder(updated);
}

export async function setOrderPriority(
  tenantSlug: string,
  orderId: string,
  isPriority: boolean,
): Promise<Order> {
  const supabase = await createSupabaseServerClient();

  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new OrderNotFoundError();

  const updated = await updateOrderPriority(
    supabase,
    tenant.id,
    orderId,
    isPriority,
  );
  if (!updated) throw new OrderNotFoundError();

  return toOrder(updated);
}
