"use client";

import { useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import type { PublicOrderTracking } from "@/types/domain";

type TrackingRow = Database["public"]["Tables"]["order_tracking_status"]["Row"];

/**
 * Assina `order_tracking_status` para um único pedido — tabela pública, sem
 * PII (ver ADR 0006). Diferente do board da cozinha, não precisa de
 * Context/reducer: o escopo é uma única página, um único registro.
 */
export function useOrderTrackingRealtime(
  orderId: string,
  initial: PublicOrderTracking,
) {
  const [tracking, setTracking] = useState(initial);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on<TrackingRow>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "order_tracking_status",
          filter: `order_id=eq.${orderId}`,
        },
        (payload: RealtimePostgresChangesPayload<TrackingRow>) => {
          const row = payload.new as TrackingRow;
          setTracking((current) => ({
            ...current,
            status: row.status,
            subtotalCents: row.subtotal_cents,
            serviceFeeCents: row.service_fee_cents,
            discountCents: row.discount_cents,
            totalCents:
              row.subtotal_cents + row.service_fee_cents - row.discount_cents,
            estimatedReadyAt: row.estimated_ready_at,
            updatedAt: row.updated_at,
            acceptedAt: row.accepted_at,
            preparingAt: row.preparing_at,
            readyAt: row.ready_at,
            deliveredAt: row.delivered_at,
            completedAt: row.completed_at,
            cancelledAt: row.cancelled_at,
          }));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  return tracking;
}
