import { z } from "zod";

/**
 * Validação do checkout. Fonte única de verdade — usada pelo form (React
 * Hook Form) e revalidada pela route handler antes de chamar o serviço. O
 * preço **nunca** é campo de entrada — estruturalmente impossível manipular
 * (o backend sempre lê `products.price_cents`, ver `create_order`).
 */

export const checkoutItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().trim().max(200).optional(),
});

export const checkoutInputSchema = z.object({
  orderType: z.enum(["pickup", "delivery", "dine_in"]),
  customerName: z.string().trim().min(1).max(80).optional(),
  notes: z.string().trim().max(280).optional(),
  items: z
    .array(checkoutItemSchema)
    .min(1, "O pedido precisa ter pelo menos um item."),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;

/** Só os campos do formulário (itens vêm do carrinho, não de um input de UI). */
export const checkoutFormSchema = checkoutInputSchema.omit({ items: true });

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
