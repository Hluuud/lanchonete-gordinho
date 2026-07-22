"use client";

import { useMutation } from "@tanstack/react-query";

import type { CheckoutInput } from "@/features/checkout/schema";
import type { Order } from "@/types/domain";

async function postCheckout(input: CheckoutInput): Promise<Order> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Não foi possível criar o pedido.");
  }

  return response.json() as Promise<Order>;
}

/** Submissão do checkout via TanStack Query — `mutate` de novo com as mesmas variáveis é o "retry". */
export function useCheckout() {
  return useMutation({
    mutationFn: postCheckout,
  });
}
