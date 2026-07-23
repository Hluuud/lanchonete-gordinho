import type { AuditAction } from "@/types/domain";

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login: "Login",
  logout: "Logout",
  create: "Criação",
  update: "Alteração",
  delete: "Exclusão",
  price_change: "Mudança de preço",
  cancel: "Cancelamento",
};

/** Cobre os `entity_type` gravados por todos os services administrativos até aqui. */
export const AUDIT_ENTITY_TYPE_LABELS: Record<string, string> = {
  category: "Categoria",
  product: "Produto",
  modifier_group: "Grupo de adicionais",
  combo: "Combo",
  store_settings: "Configuração da loja",
  user: "Usuário",
  printer: "Impressora",
  order: "Pedido",
};

export function auditEntityTypeLabel(entityType: string | null): string {
  if (!entityType) return "—";
  return AUDIT_ENTITY_TYPE_LABELS[entityType] ?? entityType;
}
