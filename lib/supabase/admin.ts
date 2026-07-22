import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env, getServiceRoleKey } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase com privilégio de service-role (ignora RLS).
 *
 * USO RESTRITO: apenas operações administrativas de backend que exigem
 * atravessar tenants ou bypassar RLS (ex.: seed, jobs, webhooks). NUNCA deve
 * ser importado por código que roda no client. O guard `server-only` garante
 * erro de build caso isso aconteça.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    getServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
