import { NextResponse } from "next/server";

import { checkDatabase } from "@/lib/observability/health-checks";

/**
 * Readiness: confirma que o processo consegue de fato servir tráfego (o
 * banco responde). Diferente de `/live` — um processo pode estar "vivo" e
 * ainda assim incapaz de atender requisições reais (ex. banco fora do ar).
 * Pensada para orquestradores decidirem se mandam tráfego para esta
 * instância. Pública, sem autenticação.
 */
export async function GET() {
  const database = await checkDatabase();
  return NextResponse.json({ ready: database.ok }, { status: database.ok ? 200 : 503 });
}
