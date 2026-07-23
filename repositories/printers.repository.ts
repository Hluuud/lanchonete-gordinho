import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getPageRange } from "@/features/admin/pagination";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

// -----------------------------------------------------------------------------
// Admin — Impressoras (Sprint 5, Fase 8)
// Só persistência de configuração — sem execução real de impressão ainda.
// Arquivo próprio (tabela nova, sem tabela irmã que já tivesse repository).
// -----------------------------------------------------------------------------

const ADMIN_PRINTER_SELECT = `
  id, name, role, connection_type, paper_width, protocol, ip_address, port,
  model, auto_print, allow_reprint, is_active, created_at, updated_at
`;

export type AdminPrinterRow = Awaited<
  ReturnType<typeof findAllPrintersByTenant>
>["rows"][number];

export type AdminPrinterListParams = {
  page: number;
  pageSize: number;
  q: string;
  sort: string;
  order: "asc" | "desc";
};

export async function findAllPrintersByTenant(
  client: Client,
  tenantId: string,
  { page, pageSize, q, sort, order }: AdminPrinterListParams,
) {
  const [from, to] = getPageRange(page, pageSize);

  let query = client
    .from("printers")
    .select(ADMIN_PRINTER_SELECT, { count: "exact" })
    .eq("tenant_id", tenantId);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function findPrinterById(client: Client, tenantId: string, printerId: string) {
  const { data, error } = await client
    .from("printers")
    .select(ADMIN_PRINTER_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", printerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type PrinterWriteInput = {
  name: string;
  role: string;
  connectionType: string;
  paperWidth: string;
  protocol: string;
  ipAddress: string | null;
  port: number | null;
  model: string | null;
  autoPrint: boolean;
  allowReprint: boolean;
  isActive: boolean;
};

export async function createPrinter(
  client: Client,
  tenantId: string,
  input: PrinterWriteInput,
) {
  const { data, error } = await client
    .from("printers")
    .insert({
      tenant_id: tenantId,
      name: input.name,
      role: input.role,
      connection_type: input.connectionType,
      paper_width: input.paperWidth,
      protocol: input.protocol,
      ip_address: input.ipAddress,
      port: input.port,
      model: input.model,
      auto_print: input.autoPrint,
      allow_reprint: input.allowReprint,
      is_active: input.isActive,
    })
    .select(ADMIN_PRINTER_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function updatePrinter(
  client: Client,
  tenantId: string,
  printerId: string,
  input: PrinterWriteInput,
) {
  const { data, error } = await client
    .from("printers")
    .update({
      name: input.name,
      role: input.role,
      connection_type: input.connectionType,
      paper_width: input.paperWidth,
      protocol: input.protocol,
      ip_address: input.ipAddress,
      port: input.port,
      model: input.model,
      auto_print: input.autoPrint,
      allow_reprint: input.allowReprint,
      is_active: input.isActive,
    })
    .eq("tenant_id", tenantId)
    .eq("id", printerId)
    .select(ADMIN_PRINTER_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deletePrinter(client: Client, tenantId: string, printerId: string) {
  const { error } = await client
    .from("printers")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("id", printerId);

  if (error) throw error;
}
