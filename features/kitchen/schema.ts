import { z } from "zod";

/**
 * Validação do domínio de pedidos (Painel da Cozinha).
 *
 * Fonte única de verdade — usada pelas route handlers antes de chamar o
 * serviço. O backend sempre revalida (a máquina de estados em
 * `lib/kitchen/order-status.ts` é a segunda camada, para a regra de
 * transição em si).
 */

export const orderStatusSchema = z.enum([
  "new",
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "completed",
  "cancelled",
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  cancelledReason: z.string().trim().max(280).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const updateOrderPrioritySchema = z.object({
  isPriority: z.boolean(),
});

export type UpdateOrderPriorityInput = z.infer<
  typeof updateOrderPrioritySchema
>;
