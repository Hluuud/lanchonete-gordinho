"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type RealtimeStatus = "connecting" | "connected" | "disconnected";

/**
 * Canal "sonda" (sem tabela/evento) só para testar se o Realtime do
 * Supabase está alcançável — usado no Painel de Status (Fase 5). Mesmo
 * padrão de `.subscribe()` de `features/kitchen/use-kitchen-realtime.ts`,
 * mas sem lógica de negócio (não assina nenhuma tabela de verdade).
 */
export function useRealtimeStatus(): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase.channel("system-status-probe").subscribe((subscribeStatus) => {
      if (subscribeStatus === "SUBSCRIBED") setStatus("connected");
      else if (
        subscribeStatus === "CHANNEL_ERROR" ||
        subscribeStatus === "TIMED_OUT" ||
        subscribeStatus === "CLOSED"
      ) {
        setStatus("disconnected");
      } else {
        setStatus("connecting");
      }
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return status;
}
