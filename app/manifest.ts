import type { MetadataRoute } from "next";

import { brand } from "@/lib/brand";

/**
 * Manifest do PWA, servido em `/manifest.webmanifest`.
 *
 * O Android monta a splash screen sozinho a partir de `name`,
 * `background_color` e do ícone 512 — por isso o `background_color` é o marrom
 * escuro da marca e não branco. O iOS ignora isso e usa as
 * `apple-touch-startup-image` declaradas no layout raiz.
 *
 * `start_url` aponta para o cardápio (não para `/admin`): quem instala o app
 * na home screen é o cliente.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: brand.colors.surfaceDark,
    theme_color: brand.colors.themeColor,
    categories: ["food", "shopping"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
