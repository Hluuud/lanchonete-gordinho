import { logger } from "@/lib/observability/logger";
import { getRequestId } from "@/lib/observability/request-id";
import { NextResponse } from "next/server";

import { toCsv } from "@/lib/export/to-csv";
import { getAdminApiUser } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import {
  TenantNotFoundError,
  exportAuditLogs,
  exportOrders,
  exportProducts,
  exportStoreSettings,
} from "@/services/admin/export.service";

const RESOURCES = ["orders", "products", "settings", "audit-logs"] as const;
type Resource = (typeof RESOURCES)[number];

/** Pedidos sem `from` explícito exportam os últimos 30 dias (mesma janela do Dashboard, Sprint 5 Fase 7). */
const DEFAULT_WINDOW_DAYS = 30;

function isResource(value: string | null): value is Resource {
  return value !== null && (RESOURCES as readonly string[]).includes(value);
}

/** Exporta dados de negócio em JSON/CSV — backup do banco em si é responsabilidade do Supabase (ver docs/backup.md). */
export async function GET(request: Request) {
  const user = await getAdminApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource");
  const format = searchParams.get("format") === "csv" ? "csv" : "json";

  if (!isResource(resource)) {
    return NextResponse.json({ error: "Recurso inválido" }, { status: 400 });
  }

  const slug = await resolveTenantSlug();

  try {
    let data: unknown;
    switch (resource) {
      case "orders": {
        const to = searchParams.get("to") ?? new Date().toISOString();
        const from =
          searchParams.get("from") ??
          new Date(Date.parse(to) - DEFAULT_WINDOW_DAYS * 86_400_000).toISOString();
        data = await exportOrders(slug, { from, to });
        break;
      }
      case "products":
        data = await exportProducts(slug);
        break;
      case "settings":
        data = await exportStoreSettings(slug);
        break;
      case "audit-logs":
        data = await exportAuditLogs(slug);
        break;
    }

    const filename = `${resource}-${new Date().toISOString().slice(0, 10)}.${format}`;
    const body =
      format === "csv"
        ? toCsv(Array.isArray(data) ? (data as object[]) : [data as object])
        : JSON.stringify(data, null, 2);
    const contentType = format === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8";

    return new NextResponse(body, {
      headers: {
        "content-type": contentType,
        "content-disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    logger.error("Erro não tratado em rota de API", {
      error,
      requestId: await getRequestId(),
    });
    throw error;
  }
}
