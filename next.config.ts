import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos de produtos serão servidas pelo Supabase Storage (Fase 1).
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
    // Default do Next é só WebP; AVIF primeiro porque é menor pra mesma
    // qualidade. O otimizador serve o primeiro que o `Accept` do browser
    // aceitar (Sprint 8, Fase 2 — galeria e pôster do Hero em mídia real).
    formats: ["image/avif", "image/webp"],
  },
};

// Sem `org`/`project`/`authToken`: build local não sobe source maps ao
// Sentry (exigiria um auth token novo) — os eventos continuam chegando
// normalmente, só sem stack trace desminificado. Suficiente para esta fase.
export default withSentryConfig(nextConfig, {
  silent: true,
});
