import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { Tenant } from "@/types/domain";

type Client = SupabaseClient<Database>;

/**
 * Acesso a dados de tenants. Única camada que conhece o Supabase para esta
 * entidade — recebe o client por injeção (testável/desacoplado).
 */
export async function findTenantBySlug(
  client: Client,
  slug: string,
): Promise<Tenant | null> {
  const { data, error } = await client
    .from("tenants")
    .select("id, slug, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

const TENANT_SETTINGS_SELECT = `
  id, name, phone, whatsapp, instagram, facebook, address, logo_url,
  banner_url, promo_banner_url, primary_color, secondary_color,
  welcome_message, closing_message, avg_prep_time_minutes, store_mode,
  business_hours
`;

/** Row completa de configuração do tenant (Sprint 5, Fase 5) — visão de gestão. */
export type TenantSettingsRow = Awaited<ReturnType<typeof findTenantSettingsById>>;

export async function findTenantSettingsById(client: Client, tenantId: string) {
  const { data, error } = await client
    .from("tenants")
    .select(TENANT_SETTINGS_SELECT)
    .eq("id", tenantId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type UpdateTenantSettingsInput = Partial<{
  name: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  address: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  promoBannerUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  welcomeMessage: string | null;
  closingMessage: string | null;
  avgPrepTimeMinutes: number | null;
  storeMode: string;
  businessHours: Database["public"]["Tables"]["tenants"]["Update"]["business_hours"];
}>;

/**
 * Atualiza campos operacionais do tenant — nunca `slug`/`is_active`
 * (protegidos por trigger, ver `0019_tenant_config_rls.sql`; este tipo de
 * input nem oferece esses campos, defesa em profundidade na própria
 * assinatura da função).
 */
export async function updateTenantSettings(
  client: Client,
  tenantId: string,
  input: UpdateTenantSettingsInput,
) {
  const payload: Database["public"]["Tables"]["tenants"]["Update"] = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.whatsapp !== undefined) payload.whatsapp = input.whatsapp;
  if (input.instagram !== undefined) payload.instagram = input.instagram;
  if (input.facebook !== undefined) payload.facebook = input.facebook;
  if (input.address !== undefined) payload.address = input.address;
  if (input.logoUrl !== undefined) payload.logo_url = input.logoUrl;
  if (input.bannerUrl !== undefined) payload.banner_url = input.bannerUrl;
  if (input.promoBannerUrl !== undefined) payload.promo_banner_url = input.promoBannerUrl;
  if (input.primaryColor !== undefined) payload.primary_color = input.primaryColor;
  if (input.secondaryColor !== undefined) payload.secondary_color = input.secondaryColor;
  if (input.welcomeMessage !== undefined) payload.welcome_message = input.welcomeMessage;
  if (input.closingMessage !== undefined) payload.closing_message = input.closingMessage;
  if (input.avgPrepTimeMinutes !== undefined) {
    payload.avg_prep_time_minutes = input.avgPrepTimeMinutes;
  }
  if (input.storeMode !== undefined) payload.store_mode = input.storeMode;
  if (input.businessHours !== undefined) payload.business_hours = input.businessHours;

  const { data, error } = await client
    .from("tenants")
    .update(payload)
    .eq("id", tenantId)
    .select(TENANT_SETTINGS_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}
