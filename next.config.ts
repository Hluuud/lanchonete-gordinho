import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos de produtos serão servidas pelo Supabase Storage (Fase 1).
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

// Sem `org`/`project`/`authToken`: build local não sobe source maps ao
// Sentry (exigiria um auth token novo) — os eventos continuam chegando
// normalmente, só sem stack trace desminificado. Suficiente para esta fase.
export default withSentryConfig(nextConfig, {
  silent: true,
});
