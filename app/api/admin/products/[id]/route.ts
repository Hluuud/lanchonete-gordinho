import { NextResponse } from "next/server";

import { productUpdateSchema } from "@/features/admin/products/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  DuplicateSkuError,
  InvalidPromoPriceError,
  ProductNotFoundError,
  TenantNotFoundError,
  deleteAdminProduct,
  updateAdminProduct,
} from "@/services/admin/products.service";

/** Atualiza um produto (edição parcial). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = productUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const product = await updateAdminProduct(slug, id, parsed.data);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof DuplicateSkuError || error instanceof InvalidPromoPriceError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

/** Exclui um produto. */
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
    await deleteAdminProduct(slug, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
