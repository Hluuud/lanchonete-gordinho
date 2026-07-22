import { NextResponse } from "next/server";

import { categoryInputSchema } from "@/features/admin/categories/schema";
import { parseListParams } from "@/features/admin/pagination";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  DuplicateCategoryNameError,
  TenantNotFoundError,
  createAdminCategory,
  listAdminCategories,
} from "@/services/admin/categories.service";

const ALLOWED_SORT = ["name", "sort_order", "created_at"] as const;

/** Lista categorias (paginada/buscável) — visão de gestão, inclui inativas. */
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
    const result = await listAdminCategories(slug, params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Cria uma categoria. */
export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = categoryInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slug = await resolveTenantSlug();

  try {
    const category = await createAdminCategory(slug, parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof DuplicateCategoryNameError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
