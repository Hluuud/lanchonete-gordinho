"use client";

import { useCallback, useSyncExternalStore } from "react";

const TICK_MS = 30_000;

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, TICK_MS);
  return () => window.clearInterval(id);
}

/**
 * Minutos decorridos desde `since`, atualizado a cada 30s — companheiro
 * numérico de `use-elapsed-time.ts` (que formata para exibição), usado para
 * classificar urgência (`urgency.ts`). Snapshot de servidor `0` é o neutro
 * seguro (mesmo padrão do projeto para relógios client-only).
 */
export function useElapsedMinutes(since: string): number {
  const getSnapshot = useCallback(() => {
    const elapsedMs = Date.now() - new Date(since).getTime();
    return Math.max(0, Math.floor(elapsedMs / 60_000));
  }, [since]);
  const getServerSnapshot = useCallback(() => 0, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
