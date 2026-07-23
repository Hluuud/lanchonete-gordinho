import { z } from "zod";

/**
 * Papéis atribuíveis via este painel. `super_admin` é papel de plataforma
 * (multi-tenant) — provisionar um super_admin continua uma operação manual
 * fora do painel de um tenant, o mesmo tratamento que `tenants.slug`/
 * `is_active` já recebem (ver `0019_tenant_config_rls.sql`).
 */
export const ASSIGNABLE_ROLES = [
  "owner",
  "manager",
  "kitchen",
  "cashier",
  "waiter",
] as const;

export const userInviteSchema = z.object({
  email: z.string().trim().min(1, "Informe o email").email("Email inválido").max(255),
  fullName: z.string().trim().max(120).optional().nullable(),
  role: z.enum(ASSIGNABLE_ROLES),
});

export type UserInviteInput = z.infer<typeof userInviteSchema>;

/** Edição de um usuário existente — nome, papel e ativação (todos opcionais). */
export const userUpdateSchema = z.object({
  fullName: z.string().trim().max(120).optional().nullable(),
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
