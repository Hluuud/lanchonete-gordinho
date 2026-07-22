import { NextResponse } from "next/server";

import { categoryUpdateSchema } from "@/features/admin/categories/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  CategoryHasProductsError,
  CategoryNotFoundError,
  DuplicateCategoryNameError,
  TenantNotFoundError,
  deleteAdminCategory,
  updateAdminCategory,
} from "@/services/admin/categories.service";

/** Atualiza uma categoria (edição parcial). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = categoryUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const category = await updateAdminCategory(slug, id, parsed.data);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof CategoryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof DuplicateCategoryNameError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

/** Exclui uma categoria — bloqueado se ainda houver produtos vinculados. */
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
    await deleteAdminCategory(slug, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof CategoryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof CategoryHasProductsError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
