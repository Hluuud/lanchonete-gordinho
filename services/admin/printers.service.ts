import "server-only";

import { buildPaginated, type ListParams, type Paginated } from "@/features/admin/pagination";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createPrinter,
  deletePrinter,
  findAllPrintersByTenant,
  findPrinterById,
  updatePrinter,
  type AdminPrinterRow,
} from "@/repositories/printers.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type {
  AdminPrinter,
  PrinterConnectionType,
  PrinterPaperWidth,
  PrinterRole,
} from "@/types/domain";
import type { PrinterInput } from "@/features/admin/printers/schema";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

export class PrinterNotFoundError extends Error {
  constructor() {
    super("Impressora não encontrada.");
    this.name = "PrinterNotFoundError";
  }
}

function toAdminPrinter(row: AdminPrinterRow): AdminPrinter {
  return {
    id: row.id,
    name: row.name,
    role: row.role as PrinterRole,
    connectionType: row.connection_type as PrinterConnectionType,
    paperWidth: row.paper_width as PrinterPaperWidth,
    protocol: row.protocol,
    ipAddress: row.ip_address,
    port: row.port,
    model: row.model,
    autoPrint: row.auto_print,
    allowReprint: row.allow_reprint,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function resolveTenantOrThrow(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();
  return { supabase, tenant };
}

export async function listAdminPrinters(
  tenantSlug: string,
  params: ListParams,
): Promise<Paginated<AdminPrinter>> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const { rows, total } = await findAllPrintersByTenant(supabase, tenant.id, params);
  return buildPaginated(rows.map(toAdminPrinter), total, params.page, params.pageSize);
}

export async function createAdminPrinter(
  tenantSlug: string,
  input: PrinterInput,
): Promise<AdminPrinter> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const row = await createPrinter(supabase, tenant.id, {
    name: input.name,
    role: input.role,
    connectionType: input.connectionType,
    paperWidth: input.paperWidth,
    protocol: input.protocol,
    ipAddress: input.ipAddress?.trim() || null,
    port: input.port ?? null,
    model: input.model?.trim() || null,
    autoPrint: input.autoPrint,
    allowReprint: input.allowReprint,
    isActive: input.isActive,
  });
  return toAdminPrinter(row);
}

export async function updateAdminPrinter(
  tenantSlug: string,
  printerId: string,
  input: PrinterInput,
): Promise<AdminPrinter> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const row = await updatePrinter(supabase, tenant.id, printerId, {
    name: input.name,
    role: input.role,
    connectionType: input.connectionType,
    paperWidth: input.paperWidth,
    protocol: input.protocol,
    ipAddress: input.ipAddress?.trim() || null,
    port: input.port ?? null,
    model: input.model?.trim() || null,
    autoPrint: input.autoPrint,
    allowReprint: input.allowReprint,
    isActive: input.isActive,
  });
  if (!row) throw new PrinterNotFoundError();
  return toAdminPrinter(row);
}

export async function deleteAdminPrinter(tenantSlug: string, printerId: string): Promise<void> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const existing = await findPrinterById(supabase, tenant.id, printerId);
  if (!existing) throw new PrinterNotFoundError();

  await deletePrinter(supabase, tenant.id, printerId);
}
