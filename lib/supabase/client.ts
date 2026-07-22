import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase para uso no browser (Client Components).
 * Usa apenas a chave pública (anon); toda autorização é feita por RLS no banco.
 *
 * Consumido por hooks (ex.: TanStack Query / Realtime) — nunca importado
 * diretamente por componentes visuais de apresentação.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
