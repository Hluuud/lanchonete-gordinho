"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Observa uma media query via `useSyncExternalStore` (padrão correto para
 * assinar APIs externas ao React — sem "tearing", sem setState em efeito).
 * Retorna `false` no snapshot de servidor; atualiza no client.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
