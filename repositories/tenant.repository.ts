import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { Tenant } from "@/types/domain";

type Client = SupabaseClient<Database>;

/**
 * Acesso a dados de tenants. Única camada que conhece o Supabase para esta
 * entidade — recebe o client por injeção (testável/desacoplado).
 */
export async function findTenantBySlug(
  client: Client,
  slug: string,
): Promise<Tenant | null> {
  const { data, error } = await client
    .from("tenants")
    .select("id, slug, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
