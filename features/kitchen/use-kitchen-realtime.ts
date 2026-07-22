"use client";

import { useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { useKitchenOrders } from "@/features/kitchen/use-kitchen-orders";
import { playNewOrderChime } from "@/lib/kitchen/notification-sound";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import type { Order } from "@/types/domain";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export type KitchenConnectionStatus =
  "connecting" | "connected" | "disconnected";

/**
 * Assina o canal Realtime de `orders` do tenant. Ao receber a mudança de um
 * pedido já conhecido, aplica um patch direto (rápido, sem round-trip). Ao
 * receber um pedido desconhecido (criado por outra origem — ex. futuro
 * checkout), busca o detalhe completo (com itens) via REST e toca o aviso
 * sonoro de novo pedido.
 *
 * Não é `useSyncExternalStore` como as demais assinaturas de API de browser
 * do projeto (`use-media-query.ts`): este hook despacha efeitos colaterais
 * assíncronos (fetch, toast, som) a cada evento, não apenas sincroniza um
 * valor lido — não se encaixa no contrato de "getSnapshot" puro.
 */
export function useKitchenRealtime(tenantId: string): KitchenConnectionStatus {
  const { hasOrder, upsertOrder, patchOrder } = useKitchenOrders();
  const [status, setStatus] = useState<KitchenConnectionStatus>("connecting");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function handleChange(
      payload: RealtimePostgresChangesPayload<OrderRow>,
    ) {
      if (payload.eventType === "DELETE") return;

      const row = payload.new as OrderRow;
      if (hasOrder(row.id)) {
        patchOrder(row.id, toOrderPatch(row));
        return;
      }

      const response = await fetch(`/api/kitchen/orders/${row.id}`);
      if (!response.ok) return;
      const order = (await response.json()) as Order;
      upsertOrder(order);
      playNewOrderChime();
    }

    const channel = supabase
      .channel(`kitchen-orders-${tenantId}`)
      .on<OrderRow>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          void handleChange(payload);
        },
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") setStatus("connected");
        else if (
          subscribeStatus === "CHANNEL_ERROR" ||
          subscribeStatus === "TIMED_OUT" ||
          subscribeStatus === "CLOSED"
        )
          setStatus("disconnected");
        else setStatus("connecting");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tenantId, hasOrder, upsertOrder, patchOrder]);

  return status;
}

/** Mesma forma de `toOrder` (services/kitchen-orders.service.ts), mas sem itens — Realtime só entrega a linha da tabela `orders`. */
function toOrderPatch(row: OrderRow): Partial<Order> {
  return {
    orderNumber: row.order_number,
    status: row.status,
    orderType: row.order_type,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    notes: row.notes,
    subtotalCents: row.subtotal_cents,
    isPriority: row.is_priority,
    estimatedReadyAt: row.estimated_ready_at,
    updatedAt: row.updated_at,
    acceptedAt: row.accepted_at,
    preparingAt: row.preparing_at,
    readyAt: row.ready_at,
    deliveredAt: row.delivered_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    cancelledReason: row.cancelled_reason,
  };
}
