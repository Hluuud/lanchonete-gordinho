import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { OrderStatus } from "@/types/domain";

type Client = SupabaseClient<Database>;

const ORDER_WITH_ITEMS_SELECT = `
  id, tenant_id, order_number, status, order_type, customer_name, customer_phone,
  notes, subtotal_cents, is_priority, estimated_ready_at, created_at, updated_at,
  accepted_at, preparing_at, ready_at, delivered_at, completed_at, cancelled_at,
  cancelled_reason,
  order_items (
    id, product_id, product_name_snapshot, unit_price_cents, quantity, notes
  )
`;

/**
 * Row de pedido com itens aninhados, como retornada pelo Supabase.
 * Exportada para que a camada de serviço mapeie para o domínio.
 */
export type OrderWithItemsRow = Awaited<
  ReturnType<typeof findActiveOrdersByTenant>
>[number];

export type OrderTimestampColumn =
  | "accepted_at"
  | "preparing_at"
  | "ready_at"
  | "delivered_at"
  | "completed_at"
  | "cancelled_at";

/** Pedidos ativos (board da cozinha) — exclui "completed" (arquivado). Mais antigo primeiro. */
export async function findActiveOrdersByTenant(
  client: Client,
  tenantId: string,
) {
  const { data, error } = await client
    .from("orders")
    .select(ORDER_WITH_ITEMS_SELECT)
    .eq("tenant_id", tenantId)
    .neq("status", "completed")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function findOrderById(
  client: Client,
  tenantId: string,
  orderId: string,
) {
  const { data, error } = await client
    .from("orders")
    .select(ORDER_WITH_ITEMS_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(
  client: Client,
  tenantId: string,
  orderId: string,
  status: OrderStatus,
  timestampColumn?: OrderTimestampColumn,
  cancelledReason?: string,
) {
  const payload: Database["public"]["Tables"]["orders"]["Update"] = {
    status,
  };
  if (timestampColumn) {
    payload[timestampColumn] = new Date().toISOString();
  }
  if (status === "cancelled" && cancelledReason) {
    payload.cancelled_reason = cancelledReason;
  }

  const { data, error } = await client
    .from("orders")
    .update(payload)
    .eq("id", orderId)
    .eq("tenant_id", tenantId)
    .select(ORDER_WITH_ITEMS_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateOrderPriority(
  client: Client,
  tenantId: string,
  orderId: string,
  isPriority: boolean,
) {
  const { data, error } = await client
    .from("orders")
    .update({ is_priority: isPriority })
    .eq("id", orderId)
    .eq("tenant_id", tenantId)
    .select(ORDER_WITH_ITEMS_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}
