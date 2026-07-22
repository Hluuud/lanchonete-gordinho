"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScrollSpyOptions = {
  /**
   * Distância (px) do topo da viewport até a "linha de detecção". Aceita uma
   * função para medir em runtime (ex.: altura de uma barra sticky) — avaliada
   * no momento da assinatura do observer, sem re-assinar a cada render.
   */
  topOffsetPx?: number | (() => number);
};

/**
 * Indica qual seção está "ativa" durante o scroll (ScrollSpy).
 *
 * A ativação usa uma linha de detecção de 1px logo abaixo de `topOffsetPx`,
 * em vez de uma margem percentual fixa — assim seções curtas (poucos
 * produtos) também disparam corretamente o estado ativo.
 *
 * Consumidores: a lista de `sectionIds` pode ser recriada a cada render (o
 * hook estabiliza internamente por conteúdo).
 */
export function useScrollSpy(
  sectionIds: string[],
  { topOffsetPx = 0 }: ScrollSpyOptions = {},
): string | undefined {
  const idsKey = sectionIds.join("|");
  const stableIds = useMemo(
    () => idsKey.split("|").filter(Boolean),
    [idsKey],
  );

  const [activeId, setActiveId] = useState<string | undefined>(stableIds[0]);

  const offsetRef = useRef(topOffsetPx);
  useEffect(() => {
    offsetRef.current = topOffsetPx;
  });

  useEffect(() => {
    const sections = stableIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const offset = offsetRef.current;
    const lineOffset = (typeof offset === "function" ? offset() : offset) + 1;
    const bottomMargin = Math.max(window.innerHeight - lineOffset - 1, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];

        if (active) setActiveId(active.target.id);
      },
      {
        rootMargin: `-${lineOffset}px 0px -${bottomMargin}px 0px`,
        threshold: 0,
      },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [stableIds]);

  return activeId;
}
