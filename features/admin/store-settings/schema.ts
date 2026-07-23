import { z } from "zod";

const dayHoursSchema = z
  .object({
    open: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
    close: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  })
  .nullable();

/** Chaves "0".."6" (domingo a sábado, `Date#getDay()`) — mesmo formato de `features/menu/store-info.ts`. */
const businessHoursSchema = z.record(z.string(), dayHoursSchema);

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const storeSettingsInputSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  phone: optionalText(30),
  whatsapp: optionalText(30),
  instagram: optionalText(60),
  facebook: optionalText(60),
  address: optionalText(300),
  logoUrl: z.string().trim().url().optional().nullable(),
  bannerUrl: z.string().trim().url().optional().nullable(),
  promoBannerUrl: z.string().trim().url().optional().nullable(),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use #rrggbb)")
    .optional()
    .nullable(),
  secondaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (use #rrggbb)")
    .optional()
    .nullable(),
  welcomeMessage: optionalText(200),
  closingMessage: optionalText(200),
  avgPrepTimeMinutes: z.number().int().min(0).optional().nullable(),
  storeMode: z.enum(["open", "closed", "vacation", "maintenance"]),
  businessHours: businessHoursSchema,
});

export type StoreSettingsInput = z.infer<typeof storeSettingsInputSchema>;
