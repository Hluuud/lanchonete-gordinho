import { NextResponse } from "next/server";

import { getKitchenApiUser } from "@/lib/kitchen/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getActiveKitchenOrders } from "@/services/kitchen-orders.service";

/**
 * Lista os pedidos ativos do Painel da Cozinha (todo o board, exceto
 * arquivados). Restrito a staff autenticado — sem visão pública, diferente
 * do cardápio.
 */
export async function GET() {
  const user = await getKitchenApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const slug = await resolveTenantSlug();
  const result = await getActiveKitchenOrders(slug);

  if (!result) {
    return NextResponse.json(
      { error: "Restaurante não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(result.orders);
}
