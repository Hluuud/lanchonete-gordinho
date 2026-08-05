import { z } from "zod";

/**
 * Validação de variáveis de ambiente na inicialização.
 * Falha rápido e explícito se algo obrigatório estiver faltando.
 *
 * - Variáveis `NEXT_PUBLIC_*` são expostas ao browser (apenas dados não sensíveis).
 * - `SUPABASE_SERVICE_ROLE_KEY` é secreta: só pode ser lida em código server.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_DEFAULT_TENANT_SLUG: z.string().min(1).default("gordinho"),
  // Opcional: Sentry funciona como no-op sem DSN (ex.: ambiente local sem
  // conta configurada). O DSN em si não é segredo — seguro no client.
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  // Domínio público da loja. Usado como `metadataBase` para gerar URL absoluta
  // de imagem Open Graph. Ausente = cai no domínio da Vercel ou em localhost.
  // O `preprocess` trata `NEXT_PUBLIC_SITE_URL=` (linha vazia copiada do
  // .env.example) como ausente, em vez de falhar na validação de URL.
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional(),
  ),
});

/**
 * Env pública (client + server). Referencia as chaves literalmente para o
 * bundler do Next inlinar os valores `NEXT_PUBLIC_*` no client.
 */
export const env = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_DEFAULT_TENANT_SLUG: process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

/**
 * Segredo server-only. Lançar se acessado no client evita vazamento acidental.
 */
export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente (uso server-only).");
  }
  return key;
}
