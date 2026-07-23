import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CheckResult = { ok: boolean; error?: string };

async function checkDatabase(): Promise<CheckResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").select("id").limit(1);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

async function checkStorage(): Promise<CheckResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.storage.from("store-assets").list("", { limit: 1 });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

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
