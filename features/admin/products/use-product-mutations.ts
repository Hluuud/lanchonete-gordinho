"use client";

import { useMutation } from "@tanstack/react-query";

import type {
  ProductInput,
  ProductUpdateInput,
} from "@/features/admin/products/schema";
import type { AdminProduct } from "@/types/domain";

async function parseErrorOrThrow(
  response: Response,
  fallback: string,
): Promise<never> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(body?.error ?? fallback);
}

async function postProduct(input: ProductInput): Promise<AdminProduct> {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível criar o produto.");
  return response.json() as Promise<AdminProduct>;
}

async function patchProduct({
  id,
  input,
}: {
  id: string;
  input: ProductUpdateInput;
}): Promise<AdminProduct> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível atualizar o produto.");
  return response.json() as Promise<AdminProduct>;
}

async function deleteProductRequest(id: string): Promise<void> {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return parseErrorOrThrow(response, "Não foi possível excluir o produto.");
  }
}

export function useCreateProduct() {
  return useMutation({ mutationFn: postProduct });
}

export function useUpdateProduct() {
  return useMutation({ mutationFn: patchProduct });
}

export function useDeleteProduct() {
  return useMutation({ mutationFn: deleteProductRequest });
}
