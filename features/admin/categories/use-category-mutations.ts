"use client";

import { useMutation } from "@tanstack/react-query";

import type {
  CategoryInput,
  CategoryUpdateInput,
} from "@/features/admin/categories/schema";
import type { AdminCategory } from "@/types/domain";

async function parseErrorOrThrow(
  response: Response,
  fallback: string,
): Promise<never> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(body?.error ?? fallback);
}

async function postCategory(input: CategoryInput): Promise<AdminCategory> {
  const response = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível criar a categoria.");
  return response.json() as Promise<AdminCategory>;
}

async function patchCategory({
  id,
  input,
}: {
  id: string;
  input: CategoryUpdateInput;
}): Promise<AdminCategory> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível atualizar a categoria.");
  return response.json() as Promise<AdminCategory>;
}

async function deleteCategoryRequest(id: string): Promise<void> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return parseErrorOrThrow(response, "Não foi possível excluir a categoria.");
  }
}

export function useCreateCategory() {
  return useMutation({ mutationFn: postCategory });
}

export function useUpdateCategory() {
  return useMutation({ mutationFn: patchCategory });
}

export function useDeleteCategory() {
  return useMutation({ mutationFn: deleteCategoryRequest });
}
