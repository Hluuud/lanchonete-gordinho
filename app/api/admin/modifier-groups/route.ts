import { NextResponse } from "next/server";

import { modifierGroupInputSchema } from "@/features/admin/modifiers/schema";
import { parseListParams } from "@/features/admin/pagination";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  TenantNotFoundError,
  createAdminModifierGroup,
  listAdminModifierGroups,
} from "@/services/admin/modifiers.service";

const ALLOWED_SORT = ["name", "sort_order", "created_at"] as const;

/** Lista grupos de adicionais (paginado/buscável), com opções e contagem de produtos vinculados. */
export async function GET(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseListParams(Object.fromEntries(searchParams), {
    allowedSort: ALLOWED_SORT,
    defaultSort: "sort_order",
  });

  const slug = await resolveTenantSlug();

  try {
    const result = await listAdminModifierGroups(slug, params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Cria um grupo de adicionais com suas opções. */
export async function POST(request: Request) {
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

  const slug = await resolveTenantSlug();

  try {
    const group = await createAdminModifierGroup(slug, parsed.data);
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
