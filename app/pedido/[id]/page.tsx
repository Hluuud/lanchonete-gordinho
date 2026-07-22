import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { OrderTrackingView } from "@/features/checkout/components/order-tracking-view";
import { generateTrackingQrCodeDataUrl } from "@/lib/checkout/qr-code";
import { getPublicOrderTracking } from "@/services/checkout.service";

export const metadata = { title: "Acompanhar pedido" };

/**
 * Página pública de acompanhamento — fora de `(store)` (sem chrome de
 * carrinho). Serve tanto de confirmação (destino imediato pós-checkout)
 * quanto de alvo do QR Code (decisão registrada em `docs/checkout.md`).
 * `id` é a própria credencial de acesso — sem PII no que é exibido aqui
 * (ver ADR 0006).
 */
export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tracking = await getPublicOrderTracking(id);

  if (!tracking) {
    notFound();
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const trackingUrl = `${protocol}://${host}/pedido/${id}`;
  const qrCodeDataUrl = await generateTrackingQrCodeDataUrl(trackingUrl);

  return (
    <OrderTrackingView
      orderId={id}
      initial={tracking}
      qrCodeDataUrl={qrCodeDataUrl}
      trackingUrl={trackingUrl}
    />
  );
}
