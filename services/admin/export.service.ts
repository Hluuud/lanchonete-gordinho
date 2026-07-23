import "server-only";

import { toOrder } from "@/lib/kitchen/order-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findOrdersInDateRange } from "@/repositories/orders.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import { listAdminAuditLogs } from "@/services/admin/audit.service";
import { listAdminProducts } from "@/services/admin/products.service";
import { getAdminStoreSettings } from "@/services/admin/store-settings.service";
import type { AdminAuditLog, AdminProduct, AdminStoreSettings, Order } from "@/types/domain";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

/**
 * Grande o suficiente para "exportar tudo" numa lanchonete de porte único —
 * evita reintroduzir paginação só para a exportação, que já reusa as
 * listagens paginadas existentes. Reavaliar se o volume real justificar.
 */
const EXPORT_PAGE_SIZE = 10_000;

export async function exportOrders(
  tenantSlug: string,
  range: { from: string; to: string },
): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();

  const rows = await findOrdersInDateRange(supabase, tenant.id, range);
  return rows.map(toOrder);
}

export async function exportProducts(tenantSlug: string): Promise<AdminProduct[]> {
  const result = await listAdminProducts(tenantSlug, {
    page: 1,
    pageSize: EXPORT_PAGE_SIZE,
    q: "",
    sort: "sort_order",
    order: "asc",
  });
  return result.items;
}

export async function exportStoreSettings(tenantSlug: string): Promise<AdminStoreSettings> {
  return getAdminStoreSettings(tenantSlug);
}

export async function exportAuditLogs(tenantSlug: string): Promise<AdminAuditLog[]> {
  const result = await listAdminAuditLogs(tenantSlug, {
    page: 1,
    pageSize: EXPORT_PAGE_SIZE,
    q: "",
    sort: "created_at",
    order: "desc",
  });
  return result.items;
}
