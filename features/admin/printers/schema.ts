import { z } from "zod";

/**
 * Validação de impressora (Painel Administrativo). O formulário sempre
 * envia o objeto inteiro (criar/editar) — mesmo padrão de `modifiers/schema.ts`
 * (sem schema `.partial()` separado para `PATCH`, o `refine` de IP condicional
 * não faria sentido numa edição parcial de qualquer forma).
 */

export const PRINTER_ROLES = ["kitchen", "cashier", "counter"] as const;
export const PRINTER_CONNECTION_TYPES = ["usb", "network", "bluetooth"] as const;
export const PRINTER_PAPER_WIDTHS = ["58mm", "80mm"] as const;

export const printerInputSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome").max(80),
    role: z.enum(PRINTER_ROLES),
    connectionType: z.enum(PRINTER_CONNECTION_TYPES),
    paperWidth: z.enum(PRINTER_PAPER_WIDTHS).default("80mm"),
    protocol: z.string().trim().min(1, "Informe o protocolo").max(40).default("escpos"),
    ipAddress: z.string().trim().max(45).optional().nullable(),
    port: z.number().int().min(1).max(65535).optional().nullable(),
    model: z.string().trim().max(80).optional().nullable(),
    autoPrint: z.boolean().default(false),
    allowReprint: z.boolean().default(true),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.connectionType !== "network" || Boolean(data.ipAddress?.trim()), {
    message: "Informe o IP para impressoras de rede",
    path: ["ipAddress"],
  });

/** Forma validada/com defaults aplicados — o que o service recebe. */
export type PrinterInput = z.output<typeof printerInputSchema>;
/** Forma pré-validação — o que o formulário (React Hook Form) mantém como estado. */
export type PrinterFormValues = z.input<typeof printerInputSchema>;
