import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildPaginated, type ListParams, type Paginated } from "@/features/admin/pagination";
import { logger } from "@/lib/observability/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createAuditLog,
  findAllAuditLogs,
  type AuditLogRow,
} from "@/repositories/audit-logs.repository";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { AdminAuditLog, AuditAction } from "@/types/domain";
import type { Database, UserRole } from "@/types/database.types";

export class TenantNotFoundError extends Error {
  constructor() {
    super("Loja não encontrada.");
    this.name = "TenantNotFoundError";
  }
}

export type AuditActor = {
  id: string;
  email: string | null;
  role: UserRole;
};

export type RecordAuditLogInput = {
  tenantId: string;
  /** `null` só é aceitável para eventos sem sessão (nenhum previsto hoje — todo evento auditado tem um ator autenticado). */
  actor: AuditActor | null;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
};

/**
 * Grava uma entrada de auditoria — "best effort": se a escrita falhar
 * (ex. problema transitório no banco), loga o erro (`logger.error`, já
 * encaminha ao Sentry) e retorna normalmente em vez de lançar. A operação
 * de negócio que motivou o evento (ex. excluir uma categoria) já aconteceu
 * com sucesso quando este helper é chamado — falhar a requisição inteira
 * por causa só do registro de auditoria seria pior que perder uma linha de
 * log ocasional.
 */
export async function recordAuditLog(
  client: SupabaseClient<Database>,
  input: RecordAuditLogInput,
): Promise<void> {
  try {
    await createAuditLog(client, {
      tenantId: input.tenantId,
      actorId: input.actor?.id ?? null,
      actorEmail: input.actor?.email ?? null,
      actorRole: input.actor?.role ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: input.before ?? null,
      after: input.after ?? null,
      metadata: input.metadata ?? null,
    });
  } catch (error) {
    logger.error("Falha ao gravar log de auditoria", {
      error,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    });
  }
}

function toAdminAuditLog(row: AuditLogRow): AdminAuditLog {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorEmail: row.actor_email,
    actorRole: row.actor_role,
    action: row.action as AuditAction,
    entityType: row.entity_type,
    entityId: row.entity_id,
    before: row.before,
    after: row.after,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export async function listAdminAuditLogs(
  tenantSlug: string,
  params: ListParams & { action?: string; entityType?: string },
): Promise<Paginated<AdminAuditLog>> {
  const supabase = await createSupabaseServerClient();
  const tenant = await findTenantBySlug(supabase, tenantSlug);
  if (!tenant) throw new TenantNotFoundError();

  const { rows, total } = await findAllAuditLogs(supabase, tenant.id, params);
  return buildPaginated(rows.map(toAdminAuditLog), total, params.page, params.pageSize);
}
