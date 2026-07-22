import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fotos de produtos serão servidas pelo Supabase Storage (Fase 1).
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
