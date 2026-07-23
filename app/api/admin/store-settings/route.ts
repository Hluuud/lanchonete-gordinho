import { NextResponse } from "next/server";

import { storeSettingsInputSchema } from "@/features/admin/store-settings/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  TenantNotFoundError,
  getAdminStoreSettings,
  updateAdminStoreSettings,
} from "@/services/admin/store-settings.service";

/** Configuração operacional da loja — recurso singular (sem lista/paginação). */
export async function GET() {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const slug = await resolveTenantSlug();

  try {
    const settings = await getAdminStoreSettings(slug);
    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

export async function PATCH(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = storeSettingsInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slug = await resolveTenantSlug();

  try {
    const settings = await updateAdminStoreSettings(slug, parsed.data);
    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
