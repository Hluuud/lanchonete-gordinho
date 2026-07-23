import "server-only";

import { buildPaginated, type ListParams, type Paginated } from "@/features/admin/pagination";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCombo,
  deleteCombo,
  findAllCombosByTenant,
  findComboById,
  replaceComboSlots,
  updateCombo,
  type ComboRow,
  type ComboSlotInput,
} from "@/repositories/combos.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { AdminCombo } from "@/types/domain";
import type { ComboInput } from "@/features/admin/combos/schema";

/** Normaliza `priceOverrideCents`/campos opcionais do Zod (`| undefined`) para o formato exigido pelo repository (`| null`). */
function toComboSlotInputs(slots: ComboInput["slots"]): ComboSlotInput[] {
  return slots.map((slot) => ({
    name: slot.name,
    isRequired: slot.isRequired,
    minSelections: slot.minSelections,
    maxSelections: slot.maxSelections,
    sortOrder: slot.sortOrder,
    products: slot.products.map((product) => ({
      productId: product.productId,
      priceOverrideCents: product.priceOverrideCents ?? null,
      sortOrder: product.sortOrder,
    })),
  }));
}

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

export class ComboNotFoundError extends Error {
  constructor() {
    super("Combo não encontrado.");
    this.name = "ComboNotFoundError";
  }
}

function toAdminCombo(row: ComboRow): AdminCombo {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    priceCents: row.price_cents,
    mainProductId: row.main_product_id,
    mainProductName: row.main_product?.name ?? null,
    isAvailable: row.is_available,
    sortOrder: row.sort_order,
    slots: (row.combo_slots ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((slot) => ({
        id: slot.id,
        name: slot.name,
        isRequired: slot.is_required,
        minSelections: slot.min_selections,
        maxSelections: slot.max_selections,
        sortOrder: slot.sort_order,
        products: (slot.combo_slot_products ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((product) => ({
            productId: product.product_id,
            productName: product.products?.name ?? "",
            priceOverrideCents: product.price_override_cents,
            sortOrder: product.sort_order,
          })),
      })),
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

export async function listAdminCombos(
  tenantSlug: string,
  params: ListParams,
): Promise<Paginated<AdminCombo>> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const { rows, total } = await findAllCombosByTenant(supabase, tenant.id, params);
  return buildPaginated(rows.map(toAdminCombo), total, params.page, params.pageSize);
}

export async function createAdminCombo(
  tenantSlug: string,
  input: ComboInput,
): Promise<AdminCombo> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const comboId = await createCombo(supabase, {
    tenantId: tenant.id,
    name: input.name,
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
    priceCents: input.priceCents ?? null,
    mainProductId: input.mainProductId ?? null,
    isAvailable: input.isAvailable,
    sortOrder: input.sortOrder,
  });

  await replaceComboSlots(supabase, tenant.id, comboId, toComboSlotInputs(input.slots));

  const row = await findComboById(supabase, tenant.id, comboId);
  if (!row) throw new ComboNotFoundError();
  return toAdminCombo(row);
}

export async function updateAdminCombo(
  tenantSlug: string,
  comboId: string,
  input: ComboInput,
): Promise<AdminCombo> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const updated = await updateCombo(supabase, tenant.id, comboId, {
    name: input.name,
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
    priceCents: input.priceCents ?? null,
    mainProductId: input.mainProductId ?? null,
    isAvailable: input.isAvailable,
    sortOrder: input.sortOrder,
  });
  if (!updated) throw new ComboNotFoundError();

  await replaceComboSlots(supabase, tenant.id, comboId, toComboSlotInputs(input.slots));

  const row = await findComboById(supabase, tenant.id, comboId);
  if (!row) throw new ComboNotFoundError();
  return toAdminCombo(row);
}

export async function deleteAdminCombo(tenantSlug: string, comboId: string): Promise<void> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const existing = await findComboById(supabase, tenant.id, comboId);
  if (!existing) throw new ComboNotFoundError();

  await deleteCombo(supabase, tenant.id, comboId);
}
