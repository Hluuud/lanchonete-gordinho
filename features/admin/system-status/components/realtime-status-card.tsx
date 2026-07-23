"use client";

import { Wifi } from "lucide-react";

import { StatusCard } from "@/features/admin/system-status/components/status-card";
import { useRealtimeStatus } from "@/features/admin/system-status/use-realtime-status";

export function RealtimeStatusCard() {
  const status = useRealtimeStatus();
  const ok = status === "connecting" ? null : status === "connected";

  return (
    <StatusCard
      icon={Wifi}
      label="Realtime"
      ok={ok}
      detail={status === "connecting" ? "Conectando..." : undefined}
    />
  );
}
