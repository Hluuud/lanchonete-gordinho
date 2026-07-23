import { NextResponse } from "next/server";

import { printerInputSchema } from "@/features/admin/printers/schema";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  PrinterNotFoundError,
  TenantNotFoundError,
  deleteAdminPrinter,
  updateAdminPrinter,
} from "@/services/admin/printers.service";

/** Atualiza uma impressora (o formulário sempre envia o objeto inteiro). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const printer = await updateAdminPrinter(slug, id, parsed.data);
    return NextResponse.json(printer);
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof PrinterNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

/** Exclui uma impressora. */
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
    await deleteAdminPrinter(slug, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof TenantNotFoundError || error instanceof PrinterNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
