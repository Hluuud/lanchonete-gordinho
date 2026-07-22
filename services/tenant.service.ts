import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findTenantBySlug } from "@/repositories/tenant.repository";
import type { Tenant } from "@/types/domain";

/** Tenant resolvido pelo slug, ou `null` se não existir/estiver inativo. */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createSupabaseServerClient();
  return findTenantBySlug(supabase, slug);
}
