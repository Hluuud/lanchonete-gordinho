import "server-only";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";
import type { UserRole } from "@/types/database.types";

/** Papéis com acesso ao Painel Administrativo. */
export const ADMIN_ROLES: UserRole[] = ["super_admin", "owner", "manager"];

/**
 * Guard de autorização para route handlers do admin. Diferente de
 * `requireRole` (que redireciona, pensado para páginas), retorna `null` para
 * o caller decidir o status HTTP (401/403) — route handlers não navegam.
 * Espelha `getKitchenApiUser` (`lib/kitchen/roles.ts`).
 */
export async function getAdminApiUser(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) return null;
  return user;
}
