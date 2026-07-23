import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getPageRange } from "@/features/admin/pagination";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

const AUDIT_LOG_SELECT = `
  id, actor_id, actor_email, actor_role, action, entity_type, entity_id,
  before, after, metadata, created_at
`;

export type AuditLogRow = Awaited<ReturnType<typeof findAllAuditLogs>>["rows"][number];

export type CreateAuditLogInput = {
  tenantId: string;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: Database["public"]["Enums"]["user_role"] | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  before: unknown;
  after: unknown;
  metadata: unknown;
};

/** Insere uma entrada de auditoria — tabela append-only, sem update/delete. */
export async function createAuditLog(client: Client, input: CreateAuditLogInput) {
  const { error } = await client.from("audit_logs").insert({
    tenant_id: input.tenantId,
    actor_id: input.actorId,
    actor_email: input.actorEmail,
    actor_role: input.actorRole,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    before: input.before as Database["public"]["Tables"]["audit_logs"]["Insert"]["before"],
    after: input.after as Database["public"]["Tables"]["audit_logs"]["Insert"]["after"],
    metadata: input.metadata as Database["public"]["Tables"]["audit_logs"]["Insert"]["metadata"],
  });

  if (error) throw error;
}

export type AuditLogListParams = {
  page: number;
  pageSize: number;
  q: string;
  sort: string;
  order: "asc" | "desc";
  action?: string;
  entityType?: string;
};

export async function findAllAuditLogs(
  client: Client,
  tenantId: string,
  { page, pageSize, sort, order, action, entityType }: AuditLogListParams,
) {
  const [from, to] = getPageRange(page, pageSize);

  let query = client
    .from("audit_logs")
    .select(AUDIT_LOG_SELECT, { count: "exact" })
    .eq("tenant_id", tenantId);

  if (action) query = query.eq("action", action);
  if (entityType) query = query.eq("entity_type", entityType);

  const { data, error, count } = await query
    .order(sort, { ascending: order === "asc" })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}
