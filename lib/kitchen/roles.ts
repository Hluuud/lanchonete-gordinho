import "server-only";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import type { UserRole } from "@/types/database.types";

/** Papéis com acesso ao Painel da Cozinha (guarda tanto a página quanto a API). */
export const KITCHEN_STAFF_ROLES: UserRole[] = [
  "super_admin",
  "owner",
  "manager",
  "kitchen",
];

/**
 * Guard de autorização para route handlers da cozinha. Diferente de
 * `requireRole` (que redireciona, pensado para páginas), retorna `null` para
 * o caller decidir o status HTTP (401/403) — route handlers não navegam.
 */
export async function getKitchenApiUser(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || !KITCHEN_STAFF_ROLES.includes(user.role)) return null;
  return user;
}
