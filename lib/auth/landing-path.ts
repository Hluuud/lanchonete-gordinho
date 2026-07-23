import type { UserRole } from "@/types/database.types";

/**
 * Rota para onde levar o usuário depois do login, a partir do papel.
 * Sem `"server-only"` de propósito — usado tanto pela página de login
 * (Server Component, decide se redireciona quem já está logado) quanto
 * pelo formulário (Client Component, decide para onde ir após autenticar).
 * Duplica a lista de papéis de `lib/admin/roles.ts`/`lib/kitchen/roles.ts`
 * (que são `server-only`) — aceitável para uma constante estável de 2 linhas.
 */
export function resolveLandingPath(role: UserRole): string {
  if (role === "super_admin" || role === "owner" || role === "manager") return "/admin";
  if (role === "kitchen") return "/cozinha";
  return "/";
}
