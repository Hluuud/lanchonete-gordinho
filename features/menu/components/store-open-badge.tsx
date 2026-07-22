"use client";

import { useSyncExternalStore } from "react";

import { getStoreOpenState } from "@/features/menu/store-info";
import { cn } from "@/lib/utils";

const MINUTE_MS = 60_000;

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, MINUTE_MS);
  return () => window.clearInterval(id);
}

function getMinuteSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS);
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * Badge Aberto/Fechado da barra superior. Relógio via `useSyncExternalStore`
 * com snapshot por minuto (convenção do projeto para APIs de tempo — evita
 * hydration mismatch: o servidor renderiza um placeholder neutro).
 */
export function StoreOpenBadge() {
  const minute = useSyncExternalStore(
    subscribe,
    getMinuteSnapshot,
    getServerSnapshot,
  );

  if (minute === null) {
    return (
      <span
        className="h-7 w-28 animate-pulse rounded-full bg-secondary"
        aria-hidden
      />
    );
  }

  const { isOpen, label } = getStoreOpenState(new Date());

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
        isOpen ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isOpen ? "bg-success" : "bg-muted-foreground",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
