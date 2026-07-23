import { NextResponse } from "next/server";

import { comboInputSchema } from "@/features/admin/combos/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  ComboNotFoundError,
  TenantNotFoundError,
  deleteAdminCombo,
  updateAdminCombo,
} from "@/services/admin/combos.service";

/** Atualiza um combo e substitui seus slots. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = comboInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const combo = await updateAdminCombo(slug, id, parsed.data);
    return NextResponse.json(combo);
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof ComboNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Exclui um combo (e seus slots, via cascade). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    await deleteAdminCombo(slug, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof ComboNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
