import { z } from "zod";

/**
 * Validação de combo + seus slots/produtos elegíveis (Painel Administrativo).
 * Mesma forma de `features/admin/modifiers/schema.ts` — uma única árvore
 * (combo + slots via `useFieldArray`), sem split core/extras.
 */

const comboSlotProductSchema = z.object({
  productId: z.string().uuid("Selecione um produto"),
  priceOverrideCents: z.number().int().min(0).optional().nullable(),
  sortOrder: z.number().int().min(0),
});

const comboSlotSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome").max(80),
    isRequired: z.boolean(),
    minSelections: z.number().int().min(0),
    maxSelections: z.number().int().min(1),
    sortOrder: z.number().int().min(0),
    products: z.array(comboSlotProductSchema).max(50),
  })
  .refine((data) => data.minSelections <= data.maxSelections, {
    message: "O mínimo não pode ser maior que o máximo.",
    path: ["minSelections"],
  });

export const comboInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  description: z.string().trim().max(500).optional().nullable(),
  imageUrl: z.string().trim().url().optional().nullable(),
  priceCents: z.number().int().min(0).optional().nullable(),
  mainProductId: z.string().uuid().optional().nullable(),
  isAvailable: z.boolean(),
  sortOrder: z.number().int().min(0),
  slots: z.array(comboSlotSchema).max(20),
});

export type ComboInput = z.infer<typeof comboInputSchema>;
