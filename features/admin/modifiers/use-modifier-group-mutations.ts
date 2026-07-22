"use client";

import { useMutation } from "@tanstack/react-query";

import type { ModifierGroupInput } from "@/features/admin/modifiers/schema";
import type { AdminModifierGroup } from "@/types/domain";

async function parseErrorOrThrow(
  response: Response,
  fallback: string,
): Promise<never> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(body?.error ?? fallback);
}

async function postModifierGroup(input: ModifierGroupInput): Promise<AdminModifierGroup> {
  const response = await fetch("/api/admin/modifier-groups", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível criar o grupo.");
  return response.json() as Promise<AdminModifierGroup>;
}

async function patchModifierGroup({
  id,
  input,
}: {
  id: string;
  input: ModifierGroupInput;
}): Promise<AdminModifierGroup> {
  const response = await fetch(`/api/admin/modifier-groups/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível atualizar o grupo.");
  return response.json() as Promise<AdminModifierGroup>;
}

async function deleteModifierGroupRequest(id: string): Promise<void> {
  const response = await fetch(`/api/admin/modifier-groups/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return parseErrorOrThrow(response, "Não foi possível excluir o grupo.");
  }
}

export function useCreateModifierGroup() {
  return useMutation({ mutationFn: postModifierGroup });
}

export function useUpdateModifierGroup() {
  return useMutation({ mutationFn: patchModifierGroup });
}

export function useDeleteModifierGroup() {
  return useMutation({ mutationFn: deleteModifierGroupRequest });
}
