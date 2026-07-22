// Marcas de acentuação combinantes (U+0300–U+036F) — remove acentos após NFD.
// Mesma técnica de `features/search/search-utils.ts`.
const DIACRITICS_PATTERN = /[̀-ͯ]/g;
const NON_SLUG_CHARS = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;

/**
 * Deriva um slug (`meu-produto`) a partir de um nome livre — usado por
 * Categorias/Produtos ao criar (o usuário nunca digita o slug diretamente).
 * Unicidade por tenant é garantida por constraint no banco; o service só dá
 * a mensagem amigável em caso de conflito.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(NON_SLUG_CHARS, "-")
    .replace(EDGE_HYPHENS, "");
}
