import "server-only";

import { buildPaginated, type ListParams, type Paginated } from "@/features/admin/pagination";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createProfile,
  findAllUsersByTenant,
  findUserByEmail,
  findUserById,
  updateProfile,
  type AdminUserRow,
} from "@/repositories/users.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { AdminUser } from "@/types/domain";
import type { UserInviteInput, UserUpdateInput } from "@/features/admin/users/schema";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("Usuário não encontrado.");
    this.name = "UserNotFoundError";
  }
}

export class DuplicateUserEmailError extends Error {
  constructor(email: string) {
    super(`Já existe um usuário com o email "${email}".`);
    this.name = "DuplicateUserEmailError";
  }
}

/** Ninguém edita o próprio papel/ativação via esta tela (ver ADR 0009). */
export class CannotModifySelfError extends Error {
  constructor() {
    super("Você não pode alterar seu próprio papel ou ativação por aqui.");
    this.name = "CannotModifySelfError";
  }
}

/** Repassa a mensagem da Supabase Admin API (ex. "email já cadastrado no Auth"). */
export class UserInviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserInviteError";
  }
}

function toAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

async function resolveTenantOrThrow(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();
  return { supabase, tenant };
}

export async function listAdminUsers(
  tenantSlug: string,
  params: ListParams,
): Promise<Paginated<AdminUser>> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const { rows, total } = await findAllUsersByTenant(supabase, tenant.id, params);
  return buildPaginated(rows.map(toAdminUser), total, params.page, params.pageSize);
}

/**
 * Convida um novo usuário: cria a conta em `auth.users` via Admin API
 * (dispara o email de definição de senha do próprio Supabase Auth) e, com o
 * id retornado, cria a linha de `profiles` no tenant atual. Ver ADR 0009.
 */
export async function inviteAdminUser(
  tenantSlug: string,
  input: UserInviteInput,
): Promise<AdminUser> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  const existing = await findUserByEmail(supabase, tenant.id, input.email);
  if (existing) throw new DuplicateUserEmailError(input.email);

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(input.email);
  if (error || !data.user) {
    throw new UserInviteError(error?.message ?? "Falha ao convidar usuário.");
  }

  const row = await createProfile(supabase, {
    id: data.user.id,
    tenantId: tenant.id,
    email: input.email,
    fullName: input.fullName ?? null,
    role: input.role,
  });
  return toAdminUser(row);
}

export async function updateAdminUser(
  tenantSlug: string,
  actorId: string,
  userId: string,
  input: UserUpdateInput,
): Promise<AdminUser> {
  const { supabase, tenant } = await resolveTenantOrThrow(tenantSlug);

  if (userId === actorId && (input.role !== undefined || input.isActive !== undefined)) {
    throw new CannotModifySelfError();
  }

  const existing = await findUserById(supabase, tenant.id, userId);
  if (!existing) throw new UserNotFoundError();

  const row = await updateProfile(supabase, tenant.id, userId, {
    fullName: input.fullName,
    role: input.role,
    isActive: input.isActive,
  });
  if (!row) throw new UserNotFoundError();
  return toAdminUser(row);
}
