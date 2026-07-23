import "server-only";

import { checkDatabase, checkStorage, type HealthCheckResult } from "@/lib/observability/health-checks";

export type AdminSystemStatus = {
  database: HealthCheckResult;
  storage: HealthCheckResult;
  checkedAt: string;
};

/** Status real de conectividade (Sprint 5.5, Fase 5) — sem CPU/memória fabricados, ver docs/observability.md. */
export async function getAdminSystemStatus(): Promise<AdminSystemStatus> {
  const [database, storage] = await Promise.all([checkDatabase(), checkStorage()]);
  return { database, storage, checkedAt: new Date().toISOString() };
}
