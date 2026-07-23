import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { OrderStatus, OrderType } from "@/types/domain";

type Client = SupabaseClient<Database>;

const ORDER_WITH_ITEMS_SELECT = `
  id, tenant_id, order_number, status, order_type, customer_name, customer_phone,
  notes, subtotal_cents, service_fee_cents, discount_cents, coupon_code,
  is_priority, estimated_ready_at, created_at, updated_at,
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

/**
 * Pedidos de um intervalo de datas, **todos os status** (inclui `completed`
 * e `cancelled`) — diferente de `findActiveOrdersByTenant`, que exclui
 * `completed` de propósito (board ativo da cozinha). Usada pelo Dashboard
 * (Sprint 5, Fase 7), que precisa do histórico para métricas.
 */
export async function findOrdersInDateRange(
  client: Client,
  tenantId: string,
  range: { from: string; to: string },
) {
  const { data, error } = await client
    .from("orders")
    .select(ORDER_WITH_ITEMS_SELECT)
    .eq("tenant_id", tenantId)
    .gte("created_at", range.from)
    .lt("created_at", range.to)
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

// ---------------------------------------------------------------------------
// Checkout (Sprint 3)
// ---------------------------------------------------------------------------

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
  notes: string | null;
};

export type CreateOrderInput = {
  tenantId: string;
  orderType: OrderType;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  items: CreateOrderItemInput[];
};

/** Erro de negócio vindo da função `create_order` (Postgres) — `code` é o `errcode` (`P0001`/`P0002`/`P0003`). */
export class OrderCreationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "OrderCreationError";
  }
}

/**
 * Cria um pedido + itens atomicamente via RPC `create_order` (ver ADR 0005/
 * 0006) — nunca insere diretamente em `orders`/`order_items`. A função
 * retorna o pedido completo (com itens) já em `jsonb`, evitando uma segunda
 * leitura (que seria bloqueada por RLS para um convidado sem papel de staff).
 */
export async function createOrder(
  client: Client,
  input: CreateOrderInput,
): Promise<OrderWithItemsRow> {
  const { data, error } = await client.rpc("create_order", {
    p_tenant_id: input.tenantId,
    p_order_type: input.orderType,
    p_customer_name: input.customerName ?? "",
    p_customer_phone: input.customerPhone ?? "",
    p_notes: input.notes ?? "",
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      notes: item.notes ?? "",
    })),
  });

  if (error) {
    throw new OrderCreationError(error.message, error.code ?? "unknown");
  }

  return data as unknown as OrderWithItemsRow;
}

/** Detalhe de acompanhamento público (sem PII) — `order_tracking_status`, alimentada por trigger a partir de `orders`. */
export async function findPublicOrderTracking(client: Client, orderId: string) {
  const { data, error } = await client
    .from("order_tracking_status")
    .select(
      "order_id, tenant_id, order_number, status, order_type, subtotal_cents, service_fee_cents, discount_cents, estimated_ready_at, created_at, updated_at, accepted_at, preparing_at, ready_at, delivered_at, completed_at, cancelled_at",
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Itens de um pedido, para a página pública de acompanhamento (sem PII — seguro, ver RLS `order_items_select_public`). */
export async function findOrderItemsByOrderId(client: Client, orderId: string) {
  const { data, error } = await client
    .from("order_items")
    .select(
      "id, product_id, product_name_snapshot, unit_price_cents, quantity, notes",
    )
    .eq("order_id", orderId);

  if (error) throw error;
  return data ?? [];
}
