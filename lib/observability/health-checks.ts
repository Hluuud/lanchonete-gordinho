import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HealthCheckResult = { ok: boolean; error?: string };

/**
 * Checagens reais de conectividade — compartilhadas entre `/health` (Fase
 * 4) e o Painel de Status administrativo (Fase 5), para as duas fontes
 * nunca divergirem sobre o que significa "banco/Storage saudável".
 */
export async function checkDatabase(): Promise<HealthCheckResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").select("id").limit(1);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

export async function checkStorage(): Promise<HealthCheckResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.storage.from("store-assets").list("", { limit: 1 });
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
