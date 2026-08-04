/**
 * Mídia de marca da loja (vídeo e imagens do Hero).
 *
 * Constantes, e não dados de banco, pelo mesmo motivo de `contact-info.ts`:
 * são assets da identidade, não conteúdo editável pelo lojista. Quando o
 * vídeo definitivo existir — arquivo em `public/` ou URL de CDN — basta
 * preencher aqui; o `HeroMedia` já sabe o que fazer com cada combinação
 * (vídeo, só pôster, ou nenhum dos dois).
 */

/** Vídeo do Hero em autoplay mudo. `null` enquanto não houver material real. */
export const HERO_VIDEO_URL: string | null = null;

/**
 * Primeiro quadro do vídeo — também é o que aparece sozinho para quem pediu
 * `prefers-reduced-motion: reduce`.
 */
export const HERO_POSTER_URL: string | null = null;
