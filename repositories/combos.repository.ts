import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getPageRange } from "@/features/admin/pagination";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

const COMBO_SELECT = `
  id, name, description, image_url, price_cents, main_product_id,
  is_available, sort_order, created_at, updated_at,
  main_product:products!combos_main_product_id_tenant_id_fkey ( name ),
  combo_slots (
    id, name, is_required, min_selections, max_selections, sort_order,
    combo_slot_products (
      product_id, price_override_cents, sort_order,
      products ( name )
    )
  )
`;

/** Row de combo (com produto principal e slots/opções aninhados), como retornada pelo Supabase. */
export type ComboRow = Awaited<ReturnType<typeof findAllCombosByTenant>>["rows"][number];

export type ComboListParams = {
  page: number;
  pageSize: number;
  q: string;
  sort: string;
  order: "asc" | "desc";
};

export async function findAllCombosByTenant(
  client: Client,
  tenantId: string,
  { page, pageSize, q, sort, order }: ComboListParams,
) {
  const [from, to] = getPageRange(page, pageSize);

  let query = client
    .from("combos")
    .select(COMBO_SELECT, { count: "exact" })
    .eq("tenant_id", tenantId);

  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function findComboById(client: Client, tenantId: string, comboId: string) {
  const { data, error } = await client
    .from("combos")
    .select(COMBO_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", comboId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type ComboCoreInput = {
  tenantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  mainProductId: string | null;
  isAvailable: boolean;
  sortOrder: number;
};

export async function createCombo(client: Client, input: ComboCoreInput): Promise<string> {
  const { data, error } = await client
    .from("combos")
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      description: input.description,
      image_url: input.imageUrl,
      price_cents: input.priceCents,
      main_product_id: input.mainProductId,
      is_available: input.isAvailable,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export type ComboCoreUpdateInput = Partial<Omit<ComboCoreInput, "tenantId">>;

export async function updateCombo(
  client: Client,
  tenantId: string,
  comboId: string,
  input: ComboCoreUpdateInput,
): Promise<boolean> {
  const payload: Database["public"]["Tables"]["combos"]["Update"] = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.imageUrl !== undefined) payload.image_url = input.imageUrl;
  if (input.priceCents !== undefined) payload.price_cents = input.priceCents;
  if (input.mainProductId !== undefined) payload.main_product_id = input.mainProductId;
  if (input.isAvailable !== undefined) payload.is_available = input.isAvailable;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;

  const { data, error } = await client
    .from("combos")
    .update(payload)
    .eq("id", comboId)
    .eq("tenant_id", tenantId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}

export async function deleteCombo(client: Client, tenantId: string, comboId: string) {
  const { error } = await client
    .from("combos")
    .delete()
    .eq("id", comboId)
    .eq("tenant_id", tenantId);

  if (error) throw error;
}

export type ComboSlotInput = {
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  products: {
    productId: string;
    priceOverrideCents: number | null;
    sortOrder: number;
  }[];
};

/**
 * Substitui todos os slots (e seus produtos elegíveis) de um combo pelos
 * fornecidos — mesma estratégia de `replaceModifierOptions`
 * (`repositories/modifiers.repository.ts`): apaga tudo e reinsere do zero,
 * seguro porque nada mais referencia `combo_slots`/`combo_slot_products`.
 */
export async function replaceComboSlots(
  client: Client,
  tenantId: string,
  comboId: string,
  slots: ComboSlotInput[],
) {
  const { error: deleteError } = await client
    .from("combo_slots")
    .delete()
    .eq("combo_id", comboId)
    .eq("tenant_id", tenantId);
  if (deleteError) throw deleteError;

  for (const slot of slots) {
    const { data: slotRow, error: slotError } = await client
      .from("combo_slots")
      .insert({
        tenant_id: tenantId,
        combo_id: comboId,
        name: slot.name,
        is_required: slot.isRequired,
        min_selections: slot.minSelections,
        max_selections: slot.maxSelections,
        sort_order: slot.sortOrder,
      })
      .select("id")
      .single();
    if (slotError) throw slotError;

    if (slot.products.length === 0) continue;

    const { error: productsError } = await client.from("combo_slot_products").insert(
      slot.products.map((product) => ({
        tenant_id: tenantId,
        slot_id: slotRow.id,
        product_id: product.productId,
        price_override_cents: product.priceOverrideCents,
        sort_order: product.sortOrder,
      })),
    );
    if (productsError) throw productsError;
  }
}
