import { NextResponse } from "next/server";

import { getKitchenApiUser } from "@/lib/kitchen/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getKitchenOrderById } from "@/services/kitchen-orders.service";

/**
 * Detalhe de um pedido — usado pelo client quando o realtime sinaliza um
 * pedido ainda não conhecido localmente (ver `use-kitchen-realtime.ts`).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getKitchenApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();
  const order = await getKitchenOrderById(slug, id);

  if (!order) {
    return NextResponse.json(
      { error: "Pedido não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(order);
}
