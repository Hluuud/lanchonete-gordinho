import { NextResponse } from "next/server";

import { updateOrderStatusSchema } from "@/features/kitchen/schema";
import { getKitchenApiUser } from "@/lib/kitchen/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  InvalidOrderTransitionError,
  OrderNotFoundError,
  changeOrderStatus,
} from "@/services/kitchen-orders.service";

/**
 * Muda o status de um pedido (drag-and-drop ou botão de ação no card). A
 * transição é revalidada pelo serviço contra a máquina de estados — o corpo
 * da requisição nunca é confiável só porque veio de uma opção de UI.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getKitchenApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const order = await changeOrderStatus(slug, id, parsed.data.status, {
      cancelledReason: parsed.data.cancelledReason,
    });
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof InvalidOrderTransitionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
