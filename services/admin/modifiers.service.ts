import "server-only";

import { buildPaginated, type ListParams, type Paginated } from "@/features/admin/pagination";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createModifierGroup,
  deleteModifierGroup,
  findAllModifierGroupsByTenant,
  findModifierGroupById,
  findModifierGroupOptions,
  replaceModifierOptions,
  updateModifierGroup,
  type ModifierGroupRow,
} from "@/repositories/modifiers.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { AdminModifierGroup } from "@/types/domain";
import type { ModifierGroupInput } from "@/features/admin/modifiers/schema";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

export class ModifierGroupNotFoundError extends Error {
  constructor() {
    super("Grupo de adicionais não encontrado.");
    this.name = "ModifierGroupNotFoundError";
  }
}

function toAdminModifierGroup(row: ModifierGroupRow): AdminModifierGroup {
  return {
    id: row.id,
    name: row.name,
    selectionType: row.selection_type,
    isRequired: row.is_required,
    minSelections: row.min_selections,
    maxSelections: row.max_selections,
    sortOrder: row.sort_order,
    options: (row.modifier_options ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((option) => ({
        id: option.id,
        name: option.name,
        priceCents: option.price_cents,
        isAvailable: option.is_available,
        sortOrder: option.sort_order,
      })),
    productCount: (row.product_modifier_groups ?? []).length,
  };
}

async function resolveTenantOrThrow(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();
  return { supabase, tenant };
}

export async function listAdminModifierGroups(
  tenantSlug: string,
  params: ListParams,
): Promise<Paginated<AdminModifierGroup>> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const { rows, total } = await findAllModifierGroupsByTenant(supabase, tenant.id, params);
  return buildPaginated(rows.map(toAdminModifierGroup), total, params.page, params.pageSize);
}

/** Pares `{id, name}` de todos os grupos — para o multi-select do formulário de produto. */
export async function listModifierGroupOptions(
  tenantSlug: string,
): Promise<{ id: string; name: string }[]> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);
  return findModifierGroupOptions(supabase, tenant.id);
}

export async function createAdminModifierGroup(
  tenantSlug: string,
  input: ModifierGroupInput,
): Promise<AdminModifierGroup> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const groupId = await createModifierGroup(supabase, {
    tenantId: tenant.id,
    name: input.name,
    selectionType: input.selectionType,
    isRequired: input.isRequired,
    minSelections: input.minSelections,
    maxSelections: input.maxSelections,
    sortOrder: input.sortOrder,
  });

  await replaceModifierOptions(supabase, tenant.id, groupId, input.options);

  const row = await findModifierGroupById(supabase, tenant.id, groupId);
  if (!row) throw new ModifierGroupNotFoundError();
  return toAdminModifierGroup(row);
}

export async function updateAdminModifierGroup(
  tenantSlug: string,
  groupId: string,
  input: ModifierGroupInput,
): Promise<AdminModifierGroup> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const updated = await updateModifierGroup(supabase, tenant.id, groupId, {
    name: input.name,
    selectionType: input.selectionType,
    isRequired: input.isRequired,
    minSelections: input.minSelections,
    maxSelections: input.maxSelections,
    sortOrder: input.sortOrder,
  });
  if (!updated) throw new ModifierGroupNotFoundError();

  await replaceModifierOptions(supabase, tenant.id, groupId, input.options);

  const row = await findModifierGroupById(supabase, tenant.id, groupId);
  if (!row) throw new ModifierGroupNotFoundError();
  return toAdminModifierGroup(row);
}

export async function deleteAdminModifierGroup(
  tenantSlug: string,
  groupId: string,
): Promise<void> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const existing = await findModifierGroupById(supabase, tenant.id, groupId);
  if (!existing) throw new ModifierGroupNotFoundError();

  await deleteModifierGroup(supabase, tenant.id, groupId);
}
