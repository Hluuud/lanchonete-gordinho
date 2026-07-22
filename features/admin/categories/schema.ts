import { z } from "zod";

/**
 * Validação de categoria (Painel Administrativo). Fonte única de verdade —
 * usada pelo formulário (React Hook Form) e revalidada pela route handler
 * antes de chamar o serviço.
 */
export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80),
  icon: z.string().trim().max(60).optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use #rrggbb)")
    .optional()
    .nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
});

/** Forma validada/com defaults aplicados — o que o service recebe. */
export type CategoryInput = z.output<typeof categoryInputSchema>;
/** Forma pré-validação — o que o formulário (React Hook Form) mantém como estado. */
export type CategoryFormValues = z.input<typeof categoryInputSchema>;

/** Mesmos campos, todos opcionais — usado no PATCH (edição parcial). */
export const categoryUpdateSchema = categoryInputSchema.partial();

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
