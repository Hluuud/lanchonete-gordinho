import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

export type CurrentUser = {
  id: string;
  email: string | null;
  tenantId: string;
  role: UserRole;
  fullName: string | null;
};

/**
 * Retorna o usuário autenticado com seu perfil (tenant + papel), ou null.
 * Usa `auth.getUser()` (valida o token no servidor) — nunca confia só no cookie.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    tenantId: profile.tenant_id,
    role: profile.role,
    fullName: profile.full_name,
  };
}

/**
 * Guard de autorização por papel para áreas restritas (admin, cozinha).
 * Redireciona quem não tem sessão ou papel adequado. A autorização real de
 * dados é reforçada por RLS no banco — este guard é a primeira barreira de UX.
 */
export async function requireRole(
  roles: UserRole[],
  redirectTo = "/",
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user || !roles.includes(user.role)) {
    redirect(redirectTo);
  }

  return user;
}
