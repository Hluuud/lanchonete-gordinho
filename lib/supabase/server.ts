import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase para uso em Server Components, Route Handlers e Server Actions.
 * Usa cookies da request (via `@supabase/ssr`) para propagar a sessão de Auth.
 *
 * É a única forma de acessar o Supabase no servidor com o contexto do usuário —
 * a camada de repositórios consome este client, nunca os componentes de UI.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Chamado a partir de um Server Component: escrita de cookie é
            // ignorada com segurança — o middleware cuida do refresh da sessão.
          }
        },
      },
    },
  );
}
