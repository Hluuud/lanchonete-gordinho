import { NextResponse } from "next/server";

import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getMenuByTenantSlug } from "@/services/menu.service";

/**
 * Endpoint JSON do cardápio do tenant atual.
 * Fonte para consumo no client (hook `useMenu` + TanStack Query). A autorização
 * de leitura é garantida por RLS; nenhum dado sensível trafega aqui.
 */
export async function GET() {
  const slug = await resolveTenantSlug();
  const menu = await getMenuByTenantSlug(slug);

  if (!menu) {
    return NextResponse.json(
      { error: "Restaurante não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(menu);
}
