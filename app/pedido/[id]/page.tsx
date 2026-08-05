import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderTrackingView } from "@/features/checkout/components/order-tracking-view";
import { generateTrackingQrCodeDataUrl } from "@/lib/checkout/qr-code";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { getPublicOrderTracking } from "@/services/checkout.service";

/**
 * `noindex`, não bloqueio em `robots.txt` (ver `app/robots.ts`): o id é a
 * credencial de acesso do pedido — impedir o crawler de sequer ver a página
 * arriscaria o Google indexar a URL nua (sem `noindex`) se alguém linkar
 * externamente; com `noindex` explícito ele nunca entra no índice.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return buildPageMetadata({
    title: "Acompanhar pedido",
    path: `/pedido/${id}`,
    index: false,
  });
}

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
