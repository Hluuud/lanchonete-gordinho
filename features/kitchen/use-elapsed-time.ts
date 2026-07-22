"use client";

import { useCallback, useSyncExternalStore } from "react";

import { formatElapsedTime } from "@/utils/format";

const TICK_MS = 30_000;

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, TICK_MS);
  return () => window.clearInterval(id);
}

/**
 * Rótulo de tempo decorrido que se atualiza sozinho, via
 * `useSyncExternalStore` + `setInterval` (mesmo padrão de
 * `hooks/use-media-query.ts` para assinar algo externo ao React, sem
 * `setState` em efeito). Snapshot de servidor é neutro ("agora") — o
 * hook corrige para o valor real assim que monta no client, sem warning
 * de hidratação.
 */
export function useElapsedTime(since: string): string {
  const getSnapshot = useCallback(() => formatElapsedTime(since), [since]);
  const getServerSnapshot = useCallback(() => "agora", []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
