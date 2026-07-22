"use client";

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return !navigator.onLine;
}

function getServerSnapshot() {
  return false;
}

/** Aviso discreto quando o navegador perde conexão. Não bloqueia a navegação. */
export function OfflineBanner() {
  const isOffline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-center text-sm font-medium text-warning-foreground"
    >
      <WifiOff className="size-4" aria-hidden />
      Você está offline — mostrando o último cardápio carregado.
    </div>
  );
}
