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
