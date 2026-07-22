import { z } from "zod";

/**
 * Validação de grupo de adicionais + suas opções (Painel Administrativo).
 * Diferente de Categorias/Produtos, o formulário aqui é uma única árvore
 * (grupo + lista de opções via `useFieldArray`) — sem split entre schema
 * "core" e "extras", já que não há upload assíncrono nem nenhum campo fora
 * do resolver do React Hook Form.
 */

const modifierOptionSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80),
  priceCents: z.number().int().min(0, "Preço inválido"),
  isAvailable: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export const modifierGroupInputSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome").max(80),
    selectionType: z.enum(["single", "multiple"]),
    isRequired: z.boolean(),
    minSelections: z.number().int().min(0),
    maxSelections: z.number().int().min(1),
    sortOrder: z.number().int().min(0),
    options: z.array(modifierOptionSchema).max(50),
  })
  .refine((data) => data.minSelections <= data.maxSelections, {
    message: "O mínimo não pode ser maior que o máximo.",
    path: ["minSelections"],
  })
  .refine((data) => data.selectionType !== "single" || data.maxSelections <= 1, {
    message: "Seleção única permite no máximo 1 opção selecionável.",
    path: ["maxSelections"],
  });

export type ModifierGroupInput = z.infer<typeof modifierGroupInputSchema>;
