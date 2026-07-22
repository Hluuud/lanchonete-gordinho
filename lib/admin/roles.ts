import "server-only";

import type { UserRole } from "@/types/database.types";

/** Papéis com acesso ao Painel Administrativo. */
export const ADMIN_ROLES: UserRole[] = ["super_admin", "owner", "manager"];
