import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  findTenantBySlug,
  findTenantSettingsById,
  updateTenantSettings,
  type TenantSettingsRow,
} from "@/repositories/tenant.repository";
import type { AdminStoreSettings, StoreMode } from "@/types/domain";
import type { StoreSettingsInput } from "@/features/admin/store-settings/schema";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

function toAdminStoreSettings(row: NonNullable<TenantSettingsRow>): AdminStoreSettings {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    facebook: row.facebook,
    address: row.address,
    logoUrl: row.logo_url,
    bannerUrl: row.banner_url,
    promoBannerUrl: row.promo_banner_url,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    welcomeMessage: row.welcome_message,
    closingMessage: row.closing_message,
    avgPrepTimeMinutes: row.avg_prep_time_minutes,
    storeMode: row.store_mode as StoreMode,
    businessHours:
      (row.business_hours as AdminStoreSettings["businessHours"] | null) ?? null,
  };
}

async function resolveTenantOrThrow(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();
  return { supabase, tenant };
}

export async function getAdminStoreSettings(
  tenantSlug: string,
): Promise<AdminStoreSettings> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const row = await findTenantSettingsById(supabase, tenant.id);
  if (!row) throw new TenantNotFoundError();
  return toAdminStoreSettings(row);
}

export async function updateAdminStoreSettings(
  tenantSlug: string,
  input: StoreSettingsInput,
): Promise<AdminStoreSettings> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const row = await updateTenantSettings(supabase, tenant.id, {
    name: input.name,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    instagram: input.instagram ?? null,
    facebook: input.facebook ?? null,
    address: input.address ?? null,
    logoUrl: input.logoUrl ?? null,
    bannerUrl: input.bannerUrl ?? null,
    promoBannerUrl: input.promoBannerUrl ?? null,
    primaryColor: input.primaryColor ?? null,
    secondaryColor: input.secondaryColor ?? null,
    welcomeMessage: input.welcomeMessage ?? null,
    closingMessage: input.closingMessage ?? null,
    avgPrepTimeMinutes: input.avgPrepTimeMinutes ?? null,
    storeMode: input.storeMode,
    businessHours: input.businessHours,
  });
  if (!row) throw new TenantNotFoundError();
  return toAdminStoreSettings(row);
}
