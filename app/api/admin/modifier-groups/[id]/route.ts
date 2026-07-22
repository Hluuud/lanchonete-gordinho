import { NextResponse } from "next/server";

import { modifierGroupInputSchema } from "@/features/admin/modifiers/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  ModifierGroupNotFoundError,
  TenantNotFoundError,
  deleteAdminModifierGroup,
  updateAdminModifierGroup,
} from "@/services/admin/modifiers.service";

/** Atualiza um grupo de adicionais e substitui suas opções. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = modifierGroupInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const group = await updateAdminModifierGroup(slug, id, parsed.data);
    return NextResponse.json(group);
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof ModifierGroupNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Exclui um grupo de adicionais (e desvincula produtos, via cascade). */
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
    await deleteAdminModifierGroup(slug, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof ModifierGroupNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
