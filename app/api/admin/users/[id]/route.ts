import { NextResponse } from "next/server";

import { userUpdateSchema } from "@/features/admin/users/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  CannotModifySelfError,
  TenantNotFoundError,
  UserNotFoundError,
  updateAdminUser,
} from "@/services/admin/users.service";

/** Atualiza nome/papel/ativação de um usuário — "desativar" em vez de excluir. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = userUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const updated = await updateAdminUser(slug, user.id, id, parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof CannotModifySelfError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
