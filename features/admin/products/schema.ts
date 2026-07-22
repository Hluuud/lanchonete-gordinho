import { z } from "zod";

/**
 * Validação de produto (Painel Administrativo).
 *
 * Dividida em duas partes por razão prática: os campos "core" (escalares)
 * são os únicos ligados ao `react-hook-form` via `zodResolver` — imagem
 * (upload assíncrono) e listas (ingredientes/alérgenos/tags, editadas como
 * texto separado por vírgula) vivem como estado do componente e só se
 * juntam ao payload no submit. Isso evita a fricção de tipos entre
 * `z.default()`/`z.coerce` e o generic único de `useForm`.
 */

const productCoreFields = {
  categoryId: z.string().uuid("Selecione uma categoria"),
  name: z.string().trim().min(1, "Informe o nome").max(120),
  description: z.string().trim().max(500).optional().nullable(),
  priceCents: z.number().int().min(0, "Preço inválido"),
  promoPriceCents: z.number().int().min(0).optional().nullable(),
  sku: z.string().trim().max(60).optional().nullable(),
  prepTimeMinutes: z.number().int().min(0),
  sortOrder: z.number().int().min(0),
  isAvailable: z.boolean(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isBestseller: z.boolean(),
};

const PROMO_PRICE_RULE = {
  message: "O preço promocional deve ser menor que o preço normal.",
  path: ["promoPriceCents"],
};

function isValidPromoPrice(data: {
  priceCents: number;
  promoPriceCents?: number | null;
}): boolean {
  return data.promoPriceCents == null || data.promoPriceCents < data.priceCents;
}

/** Schema ligado ao formulário (React Hook Form) — só os campos escalares. */
export const productCoreSchema = z
  .object(productCoreFields)
  .refine(isValidPromoPrice, PROMO_PRICE_RULE);
export type ProductCoreInput = z.infer<typeof productCoreSchema>;

const productExtrasFields = {
  imageUrl: z.string().trim().url().optional().nullable(),
  ingredients: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  allergens: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  tags: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
};

/** Schema completo — usado pelas route handlers (`/api/admin/products`) para revalidar o payload inteiro. */
export const productInputSchema = z
  .object({ ...productCoreFields, ...productExtrasFields })
  .refine(isValidPromoPrice, PROMO_PRICE_RULE);
export type ProductInput = z.infer<typeof productInputSchema>;

export const productUpdateSchema = z
  .object({ ...productCoreFields, ...productExtrasFields })
  .partial();
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
