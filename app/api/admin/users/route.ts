import { NextResponse } from "next/server";

import { parseListParams } from "@/features/admin/pagination";
import { userInviteSchema } from "@/features/admin/users/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  DuplicateUserEmailError,
  TenantNotFoundError,
  UserInviteError,
  inviteAdminUser,
  listAdminUsers,
} from "@/services/admin/users.service";

const ALLOWED_SORT = ["full_name", "email", "role", "created_at"] as const;

/** Lista usuários do tenant (paginado/buscável por nome ou email). */
export async function GET(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseListParams(Object.fromEntries(searchParams), {
    allowedSort: ALLOWED_SORT,
    defaultSort: "created_at",
    defaultOrder: "desc",
  });

  const slug = await resolveTenantSlug();

  try {
    const result = await listAdminUsers(slug, params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Convida um novo usuário para o tenant (ver ADR 0009). */
export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = userInviteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slug = await resolveTenantSlug();

  try {
    const invited = await inviteAdminUser(slug, parsed.data);
    return NextResponse.json(invited, { status: 201 });
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof DuplicateUserEmailError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof UserInviteError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }
}
