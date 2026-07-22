"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, TICK_MS);
  return () => window.clearInterval(id);
}

function getSnapshot() {
  return Date.now();
}

/**
 * Snapshot neutro para SSR/hidratação: `0` mantém tudo "recente" (nada some)
 * até o primeiro tick no client — mesmo padrão de `use-elapsed-time.ts`.
 */
function getServerSnapshot() {
  return 0;
}

/** Relógio que força um re-render a cada 30s — usado pelo auto-hide de pedidos finalizados. */
export function useNowTick(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
