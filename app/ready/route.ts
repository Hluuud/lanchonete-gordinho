import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Readiness: confirma que o processo consegue de fato servir tráfego (o
 * banco responde). Diferente de `/live` — um processo pode estar "vivo" e
 * ainda assim incapaz de atender requisições reais (ex. banco fora do ar).
 * Pensada para orquestradores decidirem se mandam tráfego para esta
 * instância. Pública, sem autenticação.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tenants").select("id").limit(1);
    if (error) throw error;

    return NextResponse.json({ ready: true });
  } catch {
    return NextResponse.json({ ready: false }, { status: 503 });
  }
}
