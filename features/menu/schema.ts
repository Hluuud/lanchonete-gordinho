import { z } from "zod";

/**
 * Schemas de validação do domínio de cardápio.
 *
 * Fonte única de verdade para validação — reutilizados no client (React Hook
 * Form) e no server (Server Actions / Route Handlers). Regra do projeto: o
 * backend sempre revalida; a validação nunca fica só na UI.
 */

/** Busca do cardápio (Fase 1). Normaliza e limita o termo pesquisado. */
export const menuSearchSchema = z.object({
  q: z.string().trim().max(80).optional().default(""),
});

export type MenuSearchInput = z.infer<typeof menuSearchSchema>;

/** Identificador de produto validado (uso em ações de carrinho na Fase 1). */
export const productIdSchema = z.uuid();
