import { notFound } from "next/navigation";

import { UsersManager } from "@/features/admin/users/components/users-manager";
import { parseListParams, type RawSearchParams } from "@/features/admin/pagination";
import { ADMIN_ROLES } from "@/lib/admin/roles";
import { requireRole } from "@/lib/auth/session";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { TenantNotFoundError, listAdminUsers } from "@/services/admin/users.service";

export const metadata = { title: "Funcionários" };

const ALLOWED_SORT = ["full_name", "email", "role", "created_at"] as const;

/**
 * Gestão de usuários do tenant (Sprint 5, Fase 6): convite via Supabase
 * Admin API (ADR 0009), troca de papel e ativação/desativação inline.
 */
export default async function AdminFuncionariosPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const params = parseListParams(rawParams, {
    allowedSort: ALLOWED_SORT,
    defaultSort: "created_at",
    defaultOrder: "desc",
  });

  const actor = await requireRole(ADMIN_ROLES);
  const slug = await resolveTenantSlug();

  const result = await listAdminUsers(slug, params).catch((error: unknown) => {
    if (error instanceof TenantNotFoundError) notFound();
    throw error;
  });

  return <UsersManager result={result} currentUserId={actor.id} />;
}
