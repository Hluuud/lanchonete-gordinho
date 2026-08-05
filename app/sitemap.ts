import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/brand";

/**
 * A vitrine é single-page: `#sobre`, `#galeria`, `#contato` etc. são âncoras
 * da mesma URL, não rotas próprias — por isso a única entrada indexável é a
 * home. `/checkout` e `/pedido/[id]` ficam de fora por design: o primeiro
 * não tem conteúdo sem um carrinho ativo, o segundo é `noindex` (ver
 * `app/pedido/[id]/page.tsx`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl().toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
