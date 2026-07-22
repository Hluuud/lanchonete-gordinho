"use client";

import Image from "next/image";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/price-tag";
import { Button } from "@/components/ui/button";
import { useOrderTrackingRealtime } from "@/features/checkout/use-order-tracking-realtime";
import { cn } from "@/lib/utils";
import { ORDER_TYPE_LABELS } from "@/lib/kitchen/order-status";
import type { OrderStatus, PublicOrderTracking } from "@/types/domain";

type Step = {
  key: string;
  label: string;
  statuses: OrderStatus[];
};

const STEPS: Step[] = [
  { key: "received", label: "Recebido", statuses: ["new", "accepted"] },
  { key: "preparing", label: "Em preparo", statuses: ["preparing"] },
  { key: "ready", label: "Pronto", statuses: ["ready"] },
  { key: "delivered", label: "Entregue", statuses: ["delivered", "completed"] },
];

const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function OrderTrackingView({
  orderId,
  initial,
  qrCodeDataUrl,
  trackingUrl,
}: {
  orderId: string;
  initial: PublicOrderTracking;
  qrCodeDataUrl: string;
  trackingUrl: string;
}) {
  const order = useOrderTrackingRealtime(orderId, initial);
  const activeStepIndex = STEPS.findIndex((step) =>
    step.statuses.includes(order.status),
  );
  const isCancelled = order.status === "cancelled";

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ url: trackingUrl, title: "Acompanhar pedido" });
        return;
      } catch {
        // usuário cancelou o share nativo — cai para copiar o link.
      }
    }
    await navigator.clipboard.writeText(trackingUrl);
    toast.success("Link copiado.");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Pedido</p>
        <p className="text-4xl font-black tabular-nums">#{order.orderNumber}</p>
        <Badge variant="outline" className="mt-2">
          {ORDER_TYPE_LABELS[order.orderType]}
        </Badge>
      </div>

      {isCancelled ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-destructive">
          Este pedido foi cancelado.
        </div>
      ) : (
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isDone = index < activeStepIndex;
            const isActive = index === activeStepIndex;
            return (
              <li
                key={step.key}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isDone || isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input text-muted-foreground",
                  )}
                >
                  {isDone ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-center text-xs",
                    isActive
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {order.estimatedReadyAt && !isCancelled && (
        <p className="text-center text-sm text-muted-foreground">
          Previsto para {TIME_FORMAT.format(new Date(order.estimatedReadyAt))}
        </p>
      )}

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-semibold">Itens</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2"
            >
              <span>
                <span className="font-medium tabular-nums">
                  {item.quantity}x
                </span>{" "}
                {item.productName}
                {item.notes && (
                  <span className="block text-xs text-muted-foreground">
                    Obs.: {item.notes}
                  </span>
                )}
              </span>
              <PriceTag
                cents={item.unitPriceCents * item.quantity}
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <PriceTag cents={order.totalCents} className="text-lg" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Aponte a câmera para acompanhar em outro dispositivo
        </p>
        <Image
          src={qrCodeDataUrl}
          alt="QR Code de acompanhamento do pedido"
          width={160}
          height={160}
          unoptimized
        />
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="size-4" aria-hidden />
          Compartilhar link
        </Button>
      </div>
    </main>
  );
}
