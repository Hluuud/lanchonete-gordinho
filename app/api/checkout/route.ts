import { NextResponse } from "next/server";

import { checkoutInputSchema } from "@/features/checkout/schema";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  CheckoutValidationError,
  submitCheckout,
} from "@/services/checkout.service";

/**
 * Submete o checkout — público (sem `requireRole`, mesmo padrão de
 * `/api/menu`: qualquer cliente da loja pode fazer um pedido). Toda a
 * revalidação de negócio (produto existe/disponível, preço, quantidade)
 * acontece dentro de `create_order` (Postgres) — esta rota só valida a
 * forma dos dados antes de repassar.
 */
export async function POST(request: Request) {
  const parsed = checkoutInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slug = await resolveTenantSlug();

  try {
    const order = await submitCheckout(slug, {
      orderType: parsed.data.orderType,
      customerName: parsed.data.customerName ?? null,
      notes: parsed.data.notes ?? null,
      items: parsed.data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes ?? null,
      })),
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }
}
