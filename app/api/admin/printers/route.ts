import { NextResponse } from "next/server";

import { parseListParams } from "@/features/admin/pagination";
import { printerInputSchema } from "@/features/admin/printers/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  TenantNotFoundError,
  createAdminPrinter,
  listAdminPrinters,
} from "@/services/admin/printers.service";

const ALLOWED_SORT = ["name", "role", "created_at"] as const;

/** Lista impressoras (paginada/buscável). */
export async function GET(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseListParams(Object.fromEntries(searchParams), {
    allowedSort: ALLOWED_SORT,
    defaultSort: "name",
  });

  const slug = await resolveTenantSlug();

  try {
    const result = await listAdminPrinters(slug, params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Cria uma impressora. */
export async function POST(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = printerInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slug = await resolveTenantSlug();

  try {
    const printer = await createAdminPrinter(slug, parsed.data);
    return NextResponse.json(printer, { status: 201 });
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
