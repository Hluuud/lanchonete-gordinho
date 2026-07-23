import { NextResponse } from "next/server";

import { checkDatabase, checkStorage } from "@/lib/observability/health-checks";

/**
 * Health check detalhado — pensado para monitores externos (UptimeRobot,
 * Better Uptime) mais do que para orquestradores (esses usam `/ready`/
 * `/live`, respostas mais enxutas). Checa banco e Storage de verdade, não
 * finge sucesso. Pública, sem autenticação — é infraestrutura, não painel.
 */
export async function GET() {
  const [database, storage] = await Promise.all([checkDatabase(), checkStorage()]);
  const healthy = database.ok && storage.ok;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      checks: { database, storage },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
