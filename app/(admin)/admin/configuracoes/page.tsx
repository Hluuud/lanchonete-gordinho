import { notFound } from "next/navigation";

import { StoreSettingsForm } from "@/features/admin/store-settings/components/store-settings-form";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  TenantNotFoundError,
  getAdminStoreSettings,
} from "@/services/admin/store-settings.service";

export const metadata = { title: "Configurações" };

/**
 * Configuração operacional da loja (Sprint 5, Fase 5): identidade, contato,
 * horário de funcionamento, aparência e modo da loja. Fecha uma dívida
 * técnica da Sprint 4 (horário/tempo médio deixam de ser constante client).
 */
export default async function AdminConfiguracoesPage() {
  const slug = await resolveTenantSlug();

  const settings = await getAdminStoreSettings(slug).catch((error: unknown) => {
    if (error instanceof TenantNotFoundError) notFound();
    throw error;
  });

  return <StoreSettingsForm settings={settings} tenantId={settings.id} />;
}
