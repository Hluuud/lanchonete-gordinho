"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";
import { OrderTypeSelector } from "@/features/checkout/components/order-type-selector";
import {
  checkoutFormSchema,
  type CheckoutFormInput,
} from "@/features/checkout/schema";
import { useCheckout } from "@/features/checkout/use-checkout";
import { useCart } from "@/features/cart/use-cart";

/**
 * Orquestra o checkout: carrinho (já existente, `useCart`) → formulário
 * (tipo de pedido, nome opcional, observação) → confirmação. Sem fetch de
 * servidor aqui — o tenant é resolvido pela própria API de checkout a
 * partir do header, mesmo padrão de `/api/menu`.
 */
export function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const checkout = useCheckout();
  const [orderType, setOrderType] =
    useState<CheckoutFormInput["orderType"]>("pickup");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { orderType: "pickup" },
  });

  useEffect(() => {
    if (cart.items.length === 0 && !checkout.isSuccess) {
      router.replace("/");
    }
  }, [cart.items.length, checkout.isSuccess, router]);

  function onSubmit(values: CheckoutFormInput) {
    checkout.mutate(
      {
        orderType,
        customerName: values.customerName,
        notes: values.notes,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.note.trim() === "" ? undefined : item.note.trim(),
        })),
      },
      {
        onSuccess: (order) => {
          cart.clear();
          router.push(`/pedido/${order.id}`);
        },
      },
    );
  }

  if (cart.items.length === 0) return null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Confirmar pedido</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <OrderTypeSelector value={orderType} onChange={setOrderType} />

        <div>
          <label
            htmlFor="customerName"
            className="mb-1.5 block text-sm font-medium"
          >
            Nome (opcional)
          </label>
          <Input
            id="customerName"
            placeholder="Para chamarmos na retirada"
            {...register("customerName")}
          />
          {errors.customerName && (
            <p className="mt-1 text-xs text-destructive">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
            Observação do pedido (opcional)
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="Ex.: embrulhar para viagem, sem talheres"
            maxLength={280}
            {...register("notes")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
          />
        </div>

        <CheckoutSummary
          items={cart.items}
          subtotalCents={cart.subtotalCents}
        />

        {checkout.isError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="flex-1">
              <p>{checkout.error.message}</p>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="mt-1 font-medium underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        <Button type="submit" size="lg" disabled={checkout.isPending}>
          {checkout.isPending ? "Enviando pedido..." : "Confirmar pedido"}
        </Button>
      </form>
    </main>
  );
}
