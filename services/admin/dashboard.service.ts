import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  findOrdersInDateRange,
  type OrderWithItemsRow,
} from "@/repositories/orders.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type {
  AdminDashboardMetrics,
  AdminHourlyOrderCount,
  AdminTopProduct,
} from "@/types/domain";
import type { OrderStatus } from "@/types/database.types";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

/**
 * Janela usada para métricas que precisam de amostra (mais vendidos,
 * horário de pico, pedidos/hora, tempo médio de preparo) — 30 dias é
 * suficiente para uma lanchonete de porte único sem tornar a query cara;
 * reavaliar (ou mover para `group by` em SQL) se o volume crescer, ver
 * BACKLOG.
 */
const WINDOW_DAYS = 30;
const TOP_PRODUCTS_LIMIT = 5;
const IN_PROGRESS_STATUSES: OrderStatus[] = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "delivered",
];

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function orderTotalCents(order: OrderWithItemsRow): number {
  return order.subtotal_cents + order.service_fee_cents - order.discount_cents;
}

async function resolveTenantOrThrow(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();
  return { supabase, tenant };
}

export async function getAdminDashboard(
  tenantSlug: string,
): Promise<AdminDashboardMetrics> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);
  const todayStart = startOfDay(now);

  const orders = await findOrdersInDateRange(supabase, tenant.id, {
    from: windowStart.toISOString(),
    to: now.toISOString(),
  });

  const todayOrders = orders.filter(
    (order) => new Date(order.created_at) >= todayStart,
  );
  const completedToday = todayOrders.filter((o) => o.status === "completed").length;
  const cancelledToday = todayOrders.filter((o) => o.status === "cancelled").length;

  const inProgress = orders.filter((order) =>
    IN_PROGRESS_STATUSES.includes(order.status),
  ).length;

  const revenueOrdersToday = todayOrders.filter((o) => o.status !== "cancelled");
  const avgTicketCents = revenueOrdersToday.length
    ? Math.round(
        revenueOrdersToday.reduce((sum, o) => sum + orderTotalCents(o), 0) /
          revenueOrdersToday.length,
      )
    : 0;

  // "Vendido" exclui cancelados — um pedido cancelado não é uma venda.
  const soldOrders = orders.filter((o) => o.status !== "cancelled");

  const productTotals = new Map<string, AdminTopProduct>();
  for (const order of soldOrders) {
    for (const item of order.order_items) {
      const key = item.product_id ?? item.product_name_snapshot;
      const current = productTotals.get(key) ?? {
        productId: item.product_id,
        name: item.product_name_snapshot,
        quantity: 0,
      };
      current.quantity += item.quantity;
      productTotals.set(key, current);
    }
  }
  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, TOP_PRODUCTS_LIMIT);

  const hourlyCounts = new Array(24).fill(0) as number[];
  const activeHourBuckets = new Set<string>();
  for (const order of soldOrders) {
    const createdAt = new Date(order.created_at);
    const hour = createdAt.getHours();
    hourlyCounts[hour] += 1;
    activeHourBuckets.add(`${createdAt.toDateString()}-${hour}`);
  }
  const peakHour = soldOrders.length
    ? hourlyCounts.reduce(
        (peak, count, hour) => (count > hourlyCounts[peak] ? hour : peak),
        0,
      )
    : null;
  const ordersPerHour = activeHourBuckets.size
    ? Math.round((soldOrders.length / activeHourBuckets.size) * 10) / 10
    : 0;

  const prepDurationsMinutes: number[] = [];
  for (const order of soldOrders) {
    if (order.preparing_at && order.ready_at) {
      const minutes =
        (new Date(order.ready_at).getTime() - new Date(order.preparing_at).getTime()) /
        60_000;
      if (minutes >= 0) prepDurationsMinutes.push(minutes);
    }
  }
  const avgPrepTimeMinutes = prepDurationsMinutes.length
    ? Math.round(
        prepDurationsMinutes.reduce((sum, minutes) => sum + minutes, 0) /
          prepDurationsMinutes.length,
      )
    : null;

  const hourlyOrderCounts: AdminHourlyOrderCount[] = hourlyCounts.map((count, hour) => ({
    hour,
    count,
  }));

  return {
    ordersToday: todayOrders.length,
    inProgress,
    completedToday,
    cancelledToday,
    avgTicketCents,
    topProducts,
    hourlyOrderCounts,
    peakHour,
    ordersPerHour,
    avgPrepTimeMinutes,
    windowDays: WINDOW_DAYS,
  };
}
