"use client";

import { useMutation } from "@tanstack/react-query";

import type { PrinterInput } from "@/features/admin/printers/schema";
import type { AdminPrinter } from "@/types/domain";

async function parseErrorOrThrow(
  response: Response,
  fallback: string,
): Promise<never> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  throw new Error(body?.error ?? fallback);
}

async function postPrinter(input: PrinterInput): Promise<AdminPrinter> {
  const response = await fetch("/api/admin/printers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível criar a impressora.");
  return response.json() as Promise<AdminPrinter>;
}

async function patchPrinter({
  id,
  input,
}: {
  id: string;
  input: PrinterInput;
}): Promise<AdminPrinter> {
  const response = await fetch(`/api/admin/printers/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return parseErrorOrThrow(response, "Não foi possível atualizar a impressora.");
  return response.json() as Promise<AdminPrinter>;
}

async function deletePrinterRequest(id: string): Promise<void> {
  const response = await fetch(`/api/admin/printers/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return parseErrorOrThrow(response, "Não foi possível excluir a impressora.");
  }
}

export function useCreatePrinter() {
  return useMutation({ mutationFn: postPrinter });
}

export function useUpdatePrinter() {
  return useMutation({ mutationFn: patchPrinter });
}

export function useDeletePrinter() {
  return useMutation({ mutationFn: deletePrinterRequest });
}
