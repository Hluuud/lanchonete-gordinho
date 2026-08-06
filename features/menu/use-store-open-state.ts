// features/menu/use-store-open-state.ts
"use client";

import { useSyncExternalStore } from "react";

import { getStoreOpenState } from "@/features/menu/store-info";

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
 * Estado aberto/fechado da loja, recalculado a cada minuto
 * (`useSyncExternalStore`, convenção do projeto para APIs de tempo —
 * evita hydration mismatch). `null` no snapshot de servidor/primeira
 * renderização: quem consome decide o placeholder (badge neutro, mascote
 * ausente etc.) em vez de assumir "fechado" antes de saber a hora real.
 */
export function useStoreOpenState(): { isOpen: boolean; label: string } | null {
  const minute = useSyncExternalStore(
    subscribe,
    getMinuteSnapshot,
    getServerSnapshot,
  );

  if (minute === null) return null;
  return getStoreOpenState(new Date());
}
