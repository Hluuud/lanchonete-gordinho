import type { Metadata } from "next";

import { brand, siteUrl } from "@/lib/brand";

const OG_IMAGE_PATH = "/brand/og-default.png";

/**
 * Metadata por rota, centralizando `alternates.canonical`, Open Graph e
 * Twitter sobre a imagem única de compartilhamento (`/brand/og-default.png`
 * — Sprint 8, Fase 0). Preview dinâmico por produto/promoção segue no
 * BACKLOG: exige `ImageResponse` com a Anton embutida como arquivo (ver
 * ADR 0011).
 */
export function buildPageMetadata({
  title,
  description = brand.description,
  path,
  image = OG_IMAGE_PATH,
  index = true,
}: {
  /** Omitir herda o título padrão do layout raiz (`brand.name`). */
  title?: string;
  description?: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const canonical = new URL(path, siteUrl()).toString();
  const ogTitle = title ?? brand.name;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
    ...(index ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [image],
    },
  };
}
