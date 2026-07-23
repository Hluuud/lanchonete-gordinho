import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getPageRange } from "@/features/admin/pagination";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

// -----------------------------------------------------------------------------
// Admin — Usuários (Sprint 5, Fase 6)
//
// `profiles` já existe desde a Fase 0 do produto (auth/RBAC); as funções
// abaixo servem a tela de gestão de usuários do tenant — não estendem
// `menu.repository.ts`/`tenant.repository.ts` porque `profiles` não é dona
// de nenhum dos dois, justifica arquivo próprio (mesmo critério usado para
// `modifiers.repository.ts`/`combos.repository.ts`).
// -----------------------------------------------------------------------------

const ADMIN_USER_SELECT = "id, email, full_name, role, is_active, created_at";

export type AdminUserRow = Awaited<
  ReturnType<typeof findAllUsersByTenant>
>["rows"][number];

export type AdminUserListParams = {
  page: number;
  pageSize: number;
  q: string;
  /** Validado contra uma allowlist em `features/admin/pagination.ts` antes de chegar aqui. */
  sort: string;
  order: "asc" | "desc";
};

/** Todos os perfis do tenant, paginados/buscáveis por nome ou email. */
export async function findAllUsersByTenant(
  client: Client,
  tenantId: string,
  { page, pageSize, q, sort, order }: AdminUserListParams,
) {
  const [from, to] = getPageRange(page, pageSize);

  let query = client
    .from("profiles")
    .select(ADMIN_USER_SELECT, { count: "exact" })
    .eq("tenant_id", tenantId);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function findUserById(client: Client, tenantId: string, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select(ADMIN_USER_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function findUserByEmail(client: Client, tenantId: string, email: string) {
  const { data, error } = await client
    .from("profiles")
    .select(ADMIN_USER_SELECT)
    .eq("tenant_id", tenantId)
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type CreateProfileInput = {
  id: string;
  tenantId: string;
  email: string;
  fullName: string | null;
  role: Database["public"]["Enums"]["user_role"];
};

/**
 * Cria a linha de `profiles` para um usuário já criado em `auth.users` pelo
 * convite (`auth.admin.inviteUserByEmail`, ver `services/admin/users.service.ts`).
 * `id` é o mesmo id do usuário de auth — não gerado aqui.
 */
export async function createProfile(client: Client, input: CreateProfileInput) {
  const { data, error } = await client
    .from("profiles")
    .insert({
      id: input.id,
      tenant_id: input.tenantId,
      email: input.email,
      full_name: input.fullName,
      role: input.role,
    })
    .select(ADMIN_USER_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export type UpdateProfileInput = Partial<{
  fullName: string | null;
  role: Database["public"]["Enums"]["user_role"];
  isActive: boolean;
}>;

export async function updateProfile(
  client: Client,
  tenantId: string,
  userId: string,
  input: UpdateProfileInput,
) {
  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (input.fullName !== undefined) payload.full_name = input.fullName;
  if (input.role !== undefined) payload.role = input.role;
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  const { data, error } = await client
    .from("profiles")
    .update(payload)
    .eq("tenant_id", tenantId)
    .eq("id", userId)
    .select(ADMIN_USER_SELECT)
    .maybeSingle();

  if (error) throw error;
  return data;
}
