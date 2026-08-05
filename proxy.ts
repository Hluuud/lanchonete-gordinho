import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { REQUEST_ID_HEADER } from "@/lib/observability/request-id";

/**
 * Proxy de sessão (convenção do Next 16, ex-"middleware"): mantém o cookie de
 * Auth do Supabase atualizado a cada request (refresh de token) e garante um
 * `x-request-id` por requisição — respeita um valor de upstream se já vier
 * setado (ex. um futuro load balancer), gera um novo caso contrário.
 * Correlaciona logs estruturados, Sentry e auditoria da mesma requisição
 * (ver `docs/observability.md`). Não decide autorização — isso fica nos
 * guards de rota (`requireRole`) e na RLS. Roda em todas as rotas exceto
 * assets estáticos.
 */
export async function proxy(request: NextRequest) {
  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.headers.set(REQUEST_ID_HEADER, requestId);
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Revalida a sessão (dispara refresh do token quando necessário).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Exclui também /health, /ready, /live (Sprint 5.5, Fase 4) — monitores
    // externos podem pingar essas rotas com alta frequência, e elas não
    // usam sessão nenhuma; revalidar cookie de auth a cada ping seria
    // trabalho descartado.
    // A lista de extensões cobre também os assets de marca (ícones, splash,
    // manifest, vídeo do hero): são públicos e sem sessão — revalidar cookie
    // neles é round-trip jogado fora.
    "/((?!_next/static|_next/image|favicon.ico|health$|ready$|live$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|webmanifest|mp4|webm)$).*)",
  ],
};
