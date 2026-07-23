"use client";

import { useMutation } from "@tanstack/react-query";

import type { StoreSettingsInput } from "@/features/admin/store-settings/schema";
import type { AdminStoreSettings } from "@/types/domain";

async function patchStoreSettings(input: StoreSettingsInput): Promise<AdminStoreSettings> {
  const response = await fetch("/api/admin/store-settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Não foi possível salvar as configurações.");
  }
  return response.json() as Promise<AdminStoreSettings>;
}

export function useUpdateStoreSettings() {
  return useMutation({ mutationFn: patchStoreSettings });
}
