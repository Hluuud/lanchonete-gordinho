import type { UserRole } from "@/types/database.types";

export const ADMIN_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super administrador",
  owner: "Proprietário",
  manager: "Gerente",
  kitchen: "Cozinha",
  cashier: "Caixa",
};
