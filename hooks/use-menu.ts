"use client";

import { useQuery } from "@tanstack/react-query";

import type { Menu } from "@/types/domain";

async function fetchMenu(): Promise<Menu> {
  const response = await fetch("/api/menu", {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Falha ao carregar o cardápio.");
  }

  return response.json() as Promise<Menu>;
}

/**
 * Consumo do cardápio no client via TanStack Query.
 * Abstrai o fetch/cache — componentes de UI usam este hook, nunca o fetch cru
 * nem o Supabase diretamente. Base para atualizações dinâmicas (busca/realtime).
 */
export function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: fetchMenu,
  });
}
