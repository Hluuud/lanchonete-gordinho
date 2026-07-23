"use client";

import { useMutation } from "@tanstack/react-query";

import type { ComboInput } from "@/features/admin/combos/schema";
import type { AdminCombo } from "@/types/domain";

async function parseErrorOrThrow(
  response: Response,
  fallback: string,
): Promise<never> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(body?.error ?? fallback);
}

async function postCombo(input: ComboInput): Promise<AdminCombo> {
  const response = await fetch("/api/admin/combos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível criar o combo.");
  return response.json() as Promise<AdminCombo>;
}

async function patchCombo({
  id,
  input,
}: {
  id: string;
  input: ComboInput;
}): Promise<AdminCombo> {
  const response = await fetch(`/api/admin/combos/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível atualizar o combo.");
  return response.json() as Promise<AdminCombo>;
}

async function deleteComboRequest(id: string): Promise<void> {
  const response = await fetch(`/api/admin/combos/${id}`, { method: "DELETE" });
  if (!response.ok) {
    return parseErrorOrThrow(response, "Não foi possível excluir o combo.");
  }
}

export function useCreateCombo() {
  return useMutation({ mutationFn: postCombo });
}

export function useUpdateCombo() {
  return useMutation({ mutationFn: patchCombo });
}

export function useDeleteCombo() {
  return useMutation({ mutationFn: deleteComboRequest });
}
