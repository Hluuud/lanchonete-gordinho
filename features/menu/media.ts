/**
 * Mídia de marca da loja (vídeo e imagens do Hero).
 *
 * Constantes, e não dados de banco, pelo mesmo motivo de `contact-info.ts`:
 * são assets da identidade, não conteúdo editável pelo lojista. Quando o
 * material definitivo existir — arquivo em `public/` ou URL de CDN — basta
 * preencher `HERO_MEDIA` aqui; o `HeroMedia` já sabe o que fazer com cada
 * combinação (vídeo, só pôster, ou nenhum dos dois).
 */

/** Uma fonte de vídeo — o browser escolhe a primeira que sabe decodificar. */
export type HeroVideoSource = {
  src: string;
  /** MIME type, ex. `"video/webm"` / `"video/mp4"`. */
  type: string;
};

export type HeroMediaConfig = {
  /**
   * Em ordem de preferência (WebM antes de MP4: arquivo menor, mesma
   * qualidade). Vazio = sem vídeo, cai no pôster.
   */
  sources: HeroVideoSource[];
  /** Primeiro quadro do vídeo — usado como `poster` e como imagem sozinha. */
  poster: string | null;
  /** Pôster alternativo para telas estreitas, se o enquadramento mudar. */
  posterMobile?: string | null;
  /** Opacidade do véu escuro sobre a mídia (0 a 1), para o texto não sumir. */
  overlayOpacity: number;
};

/** Vídeo institucional — video_teste.mp4 fornecido pelo lojista. */
export const HERO_MEDIA: HeroMediaConfig = {
  sources: [{ src: "/brand/video_teste.mp4", type: "video/mp4" }],
  poster: null,
  posterMobile: null,
  overlayOpacity: 0.45,
};

export type HeroMediaState = "video" | "poster" | "placeholder";

/**
 * Decide o que `HeroMedia` deve renderizar. Pura (sem `matchMedia`) para ser
 * testável: o componente lê `prefers-reduced-motion` via
 * `useReducedMotion()` e passa o booleano aqui.
 */
export function resolveHeroMedia(
  media: Pick<HeroMediaConfig, "sources" | "poster">,
  prefersReducedMotion: boolean,
): HeroMediaState {
  if (media.sources.length > 0 && !prefersReducedMotion) return "video";
  if (media.poster) return "poster";
  return "placeholder";
}

/**
 * Existe material real (vídeo ou pôster)? Decide o layout do Hero
 * (`store-hero.tsx`): full-bleed cinematográfico com mídia real, ou o split
 * atual com o placeholder dentro de um cartão. Independe de
 * `prefers-reduced-motion` — isso só escolhe *qual* mídia real mostrar, não
 * se existe uma.
 */
export function hasHeroMedia(
  media: Pick<HeroMediaConfig, "sources" | "poster">,
): boolean {
  return media.sources.length > 0 || Boolean(media.poster);
}
