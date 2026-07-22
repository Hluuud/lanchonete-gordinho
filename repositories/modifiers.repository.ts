import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getPageRange } from "@/features/admin/pagination";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

const MODIFIER_GROUP_SELECT = `
  id, name, selection_type, is_required, min_selections, max_selections,
  sort_order,
  modifier_options ( id, name, price_cents, is_available, sort_order ),
  product_modifier_groups ( product_id )
`;

/** Row de grupo de adicionais (com opções e vínculos de produto aninhados), como retornada pelo Supabase. */
export type ModifierGroupRow = Awaited<
  ReturnType<typeof findAllModifierGroupsByTenant>
>["rows"][number];

export type ModifierGroupListParams = {
  page: number;
  pageSize: number;
  q: string;
  sort: string;
  order: "asc" | "desc";
};

/** Todos os grupos do tenant, paginados/buscáveis — com opções e contagem de produtos vinculados. */
export async function findAllModifierGroupsByTenant(
  client: Client,
  tenantId: string,
  { page, pageSize, q, sort, order }: ModifierGroupListParams,
) {
  const [from, to] = getPageRange(page, pageSize);

  let query = client
    .from("modifier_groups")
    .select(MODIFIER_GROUP_SELECT, { count: "exact" })
    .eq("tenant_id", tenantId);

  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function findModifierGroupById(
  client: Client,
  tenantId: string,
  groupId: string,
) {
  const { data, error } = await client
    .from("modifier_groups")
    .select(MODIFIER_GROUP_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type ModifierGroupCoreInput = {
  tenantId: string;
  name: string;
  selectionType: "single" | "multiple";
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
};

export async function createModifierGroup(
  client: Client,
  input: ModifierGroupCoreInput,
): Promise<string> {
  const { data, error } = await client
    .from("modifier_groups")
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      selection_type: input.selectionType,
      is_required: input.isRequired,
      min_selections: input.minSelections,
      max_selections: input.maxSelections,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export type ModifierGroupCoreUpdateInput = Partial<
  Omit<ModifierGroupCoreInput, "tenantId">
>;

export async function updateModifierGroup(
  client: Client,
  tenantId: string,
  groupId: string,
  input: ModifierGroupCoreUpdateInput,
): Promise<boolean> {
  const payload: Database["public"]["Tables"]["modifier_groups"]["Update"] = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.selectionType !== undefined) payload.selection_type = input.selectionType;
  if (input.isRequired !== undefined) payload.is_required = input.isRequired;
  if (input.minSelections !== undefined) payload.min_selections = input.minSelections;
  if (input.maxSelections !== undefined) payload.max_selections = input.maxSelections;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;

  const { data, error } = await client
    .from("modifier_groups")
    .update(payload)
    .eq("id", groupId)
    .eq("tenant_id", tenantId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export async function deleteModifierGroup(
  client: Client,
  tenantId: string,
  groupId: string,
) {
  const { error } = await client
    .from("modifier_groups")
    .delete()
    .eq("id", groupId)
    .eq("tenant_id", tenantId);

  if (error) throw error;
}

export type ModifierOptionInput = {
  name: string;
  priceCents: number;
  isAvailable: boolean;
  sortOrder: number;
};

/**
 * Substitui todas as opções de um grupo pelas fornecidas — mais simples e
 * seguro que diff/upsert (opções não têm nenhuma referência externa ainda,
 * já que o cliente não seleciona adicionais ao pedir nesta sprint).
 */
export async function replaceModifierOptions(
  client: Client,
  tenantId: string,
  groupId: string,
  options: ModifierOptionInput[],
) {
  const { error: deleteError } = await client
    .from("modifier_options")
    .delete()
    .eq("group_id", groupId)
    .eq("tenant_id", tenantId);
  if (deleteError) throw deleteError;

  if (options.length === 0) return;

  const { error: insertError } = await client.from("modifier_options").insert(
    options.map((option) => ({
      tenant_id: tenantId,
      group_id: groupId,
      name: option.name,
      price_cents: option.priceCents,
      is_available: option.isAvailable,
      sort_order: option.sortOrder,
    })),
  );
  if (insertError) throw insertError;
}

/** Substitui os grupos vinculados a um produto pelos fornecidos — mesma estratégia de `replaceModifierOptions`. */
export async function setProductModifierGroups(
  client: Client,
  tenantId: string,
  productId: string,
  groupIds: string[],
) {
  const { error: deleteError } = await client
    .from("product_modifier_groups")
    .delete()
    .eq("product_id", productId)
    .eq("tenant_id", tenantId);
  if (deleteError) throw deleteError;

  if (groupIds.length === 0) return;

  const { error: insertError } = await client.from("product_modifier_groups").insert(
    groupIds.map((groupId, index) => ({
      tenant_id: tenantId,
      product_id: productId,
      group_id: groupId,
      sort_order: index,
    })),
  );
  if (insertError) throw insertError;
}

/** Pares `{id, name}` de todos os grupos do tenant — para o multi-select do formulário de produto. */
export async function findModifierGroupOptions(client: Client, tenantId: string) {
  const { data, error } = await client
    .from("modifier_groups")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
