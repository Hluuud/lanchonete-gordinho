import "server-only";

import { headers } from "next/headers";

import { env } from "@/lib/env";

/**
 * Resolução de tenant (restaurante) — ponto ÚNICO de verdade.
 *
 * Toda a stack consome o tenant atual por aqui. Hoje (Fase 0, um único
 * restaurante) resolvemos por um header opcional `x-tenant-slug` (útil para
 * testes/preview) com fallback para o slug padrão. Quando o SaaS evoluir para
 * múltiplos restaurantes, trocar a estratégia para subdomínio/host ou path
 * será uma mudança localizada aqui — nenhum `tenant_id` fica espalhado no código.
 */
export async function resolveTenantSlug(): Promise<string> {
  const headerList = await headers();
  const fromHeader = headerList.get("x-tenant-slug")?.trim();

  return fromHeader && fromHeader.length > 0
    ? fromHeader
    : env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG;
}
