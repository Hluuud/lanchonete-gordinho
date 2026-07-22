"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { KitchenConnectionStatus } from "@/features/kitchen/use-kitchen-realtime";
import {
  isSoundEnabled,
  setSoundEnabled,
  subscribeSoundEnabled,
} from "@/lib/kitchen/notification-sound";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<KitchenConnectionStatus, string> = {
  connecting: "Conectando...",
  connected: "Conectado em tempo real",
  disconnected: "Reconectando...",
};

const STATUS_COLOR: Record<KitchenConnectionStatus, string> = {
  connecting: "text-muted-foreground",
  connected: "text-success",
  disconnected: "text-destructive",
};

export function KitchenHeader({
  connectionStatus,
}: {
  connectionStatus: KitchenConnectionStatus;
}) {
  const soundOn = useSyncExternalStore(
    subscribeSoundEnabled,
    isSoundEnabled,
    () => true,
  );

  function toggleSound() {
    setSoundEnabled(!soundOn);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">Painel da Cozinha</h1>
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs",
            STATUS_COLOR[connectionStatus],
          )}
        >
          {connectionStatus === "connected" ? (
            <Wifi className="size-3.5" aria-hidden />
          ) : (
            <WifiOff className="size-3.5" aria-hidden />
          )}
          {STATUS_LABEL[connectionStatus]}
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={toggleSound}
        aria-label={
          soundOn ? "Desativar som de novo pedido" : "Ativar som de novo pedido"
        }
      >
        {soundOn ? (
          <Volume2 className="size-4" aria-hidden />
        ) : (
          <VolumeX className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  );
}
