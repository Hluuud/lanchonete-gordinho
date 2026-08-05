import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/brand";

/**
 * `/robots.txt`. Bloqueia rotas de staff (`/admin`, `/cozinha`), auth
 * (`/login`) e as APIs (`/api`) — nenhuma delas tem valor de busca, e
 * `/pedido/[id]` já leva `noindex` própria (o id é a credencial de acesso,
 * ver `app/pedido/[id]/page.tsx`) em vez de um bloqueio geral aqui, pra não
 * impedir o próprio dono do link de encontrá-lo caso precise.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/admin", "/cozinha", "/login"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
