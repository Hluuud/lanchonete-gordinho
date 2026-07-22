import { NextResponse } from "next/server";

import { productInputSchema } from "@/features/admin/products/schema";
import { parseListParams } from "@/features/admin/pagination";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  DuplicateSkuError,
  InvalidPromoPriceError,
  TenantNotFoundError,
  createAdminProduct,
  listAdminProducts,
} from "@/services/admin/products.service";

const ALLOWED_SORT = ["name", "price_cents", "sort_order", "created_at"] as const;

/** Lista produtos (paginada/buscável/filtrável) — visão de gestão, inclui não publicados/indisponíveis. */
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

  const categoryId = searchParams.get("categoryId") ?? undefined;
  const isAvailableParam = searchParams.get("isAvailable");
  const isFeaturedParam = searchParams.get("isFeatured");

  const slug = await resolveTenantSlug();

  try {
    const result = await listAdminProducts(slug, {
      ...params,
      categoryId,
      isAvailable: isAvailableParam === null ? undefined : isAvailableParam === "true",
      isFeatured: isFeaturedParam === null ? undefined : isFeaturedParam === "true",
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Cria um produto. */
export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = productInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slug = await resolveTenantSlug();

  try {
    const product = await createAdminProduct(slug, parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof DuplicateSkuError || error instanceof InvalidPromoPriceError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
