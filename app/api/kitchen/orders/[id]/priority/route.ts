import { NextResponse } from "next/server";

import { updateOrderPrioritySchema } from "@/features/kitchen/schema";
import { getKitchenApiUser } from "@/lib/kitchen/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  OrderNotFoundError,
  setOrderPriority,
} from "@/services/kitchen-orders.service";

/** Marca/desmarca um pedido como prioritário. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getKitchenApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const parsed = updateOrderPrioritySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { id } = await params;
  const slug = await resolveTenantSlug();

  try {
    const order = await setOrderPriority(slug, id, parsed.data.isPriority);
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}
