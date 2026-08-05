import { env } from "@/lib/env";
import splashTargetsJson from "@/lib/brand/splash-targets.json";
import tokens from "@/lib/brand/tokens.json";

/**
 * Fonte única da identidade de marca usada por metadata, manifest PWA e pelo
 * gerador de assets (`scripts/generate-brand-assets.mjs`, que lê os mesmos
 * JSONs via `fs`). Trocar a logo ou uma cor aqui e rodar `pnpm brand:assets`
 * regenera favicon, ícones, splash e imagem Open Graph.
 */
export const brand = tokens;

/** Alvos de splash screen do iOS (Android monta a sua a partir do manifest). */
export const splashTargets = splashTargetsJson;

export type BrandAssetVariant = "horizontal" | "mono" | "watermark";

const BRAND_ASSET_PATHS: Record<BrandAssetVariant, string> = {
  horizontal: "/brand/logo-horizontal.png",
  mono: "/brand/logo-mono.png",
  watermark: "/brand/watermark.png",
};

const BRAND_ASSET_SOURCE_KEYS: Record<BrandAssetVariant, string> = {
  horizontal: "logoHorizontal",
  mono: "logoMono",
  watermark: "watermark",
};

/**
 * Resolve o caminho público de uma variante de marca a partir de um
 * `tokens.source` arbitrário. Extraído de `brandAsset()` só para ser
 * testável sem depender do singleton `tokens.json` — a decisão em si
 * (`fonte configurada?`) é o que importa, não o JSON real.
 */
export function resolveBrandAsset(
  source: Record<string, string | null | undefined>,
  variant: BrandAssetVariant,
): string | null {
  const sourceKey = BRAND_ASSET_SOURCE_KEYS[variant];
  return source[sourceKey] ? BRAND_ASSET_PATHS[variant] : null;
}

/**
 * Caminho público de uma variante de marca gerada por `pnpm brand:assets`
 * (`scripts/generate-brand-assets.mjs`), ou `null` se a fonte daquela
 * variante nunca foi configurada em `tokens.source` — quem consome deve
 * degradar para o selo (ver `components/brand-logo.tsx`).
 */
export function brandAsset(variant: BrandAssetVariant): string | null {
  return resolveBrandAsset(tokens.source, variant);
}

/**
 * Caminho do PNG de splash de um alvo. Mesmo cálculo do gerador — se mudar
 * aqui, mudar lá.
 */
export function splashImagePath(
  target: (typeof splashTargets)[number],
): string {
  return `/splash/apple-splash-${target.cssWidth * target.dpr}x${target.cssHeight * target.dpr}.png`;
}

/** Media query que o iOS usa para escolher o splash correto. */
export function splashMediaQuery(
  target: (typeof splashTargets)[number],
): string {
  return [
    `(device-width: ${target.cssWidth}px)`,
    `(device-height: ${target.cssHeight}px)`,
    `(-webkit-device-pixel-ratio: ${target.dpr})`,
    "(orientation: portrait)",
  ].join(" and ");
}

/**
 * URL pública canônica. Serve de `metadataBase` para o Next resolver imagens
 * Open Graph em URL absoluta — sem isso, redes sociais não conseguem buscar o
 * preview. Em deploy de preview cai no domínio efêmero da Vercel; em dev,
 * localhost.
 */
export function siteUrl(): URL {
  if (env.NEXT_PUBLIC_SITE_URL) return new URL(env.NEXT_PUBLIC_SITE_URL);

  const vercel = process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}
