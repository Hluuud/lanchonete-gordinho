"use client";

import { useMutation } from "@tanstack/react-query";

import type { UserInviteInput, UserUpdateInput } from "@/features/admin/users/schema";
import type { AdminUser } from "@/types/domain";

async function parseErrorOrThrow(
  response: Response,
  fallback: string,
): Promise<never> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(body?.error ?? fallback);
}

async function inviteUser(input: UserInviteInput): Promise<AdminUser> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível convidar o usuário.");
  return response.json() as Promise<AdminUser>;
}

async function patchUser({
  id,
  input,
}: {
  id: string;
  input: UserUpdateInput;
}): Promise<AdminUser> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível atualizar o usuário.");
  return response.json() as Promise<AdminUser>;
}

export function useInviteUser() {
  return useMutation({ mutationFn: inviteUser });
}

export function useUpdateUser() {
  return useMutation({ mutationFn: patchUser });
}
