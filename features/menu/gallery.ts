/**
 * Galeria institucional (`#galeria`): fachada, ambiente, cozinha, equipe,
 * clientes e os produtos em foto. Constante, não dado de banco — mesmo
 * raciocínio de `contact-info.ts`/`media.ts`: é conteúdo de marca, não algo
 * que o lojista edita hoje.
 *
 * `GALLERY_ITEMS` nasce vazia: publicar fotos de exemplo violaria a mesma
 * regra de honestidade da UI que já rege o Hero e o Sobre (nenhum conteúdo
 * inventado no ar). `StoreGallery` não renderiza — e o item "Galeria" nem
 * aparece na navegação (`nav.ts`) — enquanto isto seguir vazio.
 */

export type GalleryCategory =
  | "fachada"
  | "ambiente"
  | "cozinha"
  | "equipe"
  | "clientes"
  | "hamburgueres"
  | "batatas"
  | "pasteis"
  | "bebidas";

export type GalleryItem = {
  id: string;
  src: string;
  /** Texto alternativo — obrigatório, nunca vazio, mesmo em foto decorativa. */
  alt: string;
  caption?: string;
  category: GalleryCategory;
};

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  fachada: "Fachada",
  ambiente: "Ambiente",
  cozinha: "Cozinha",
  equipe: "Equipe",
  clientes: "Clientes",
  hamburgueres: "Hambúrgueres",
  batatas: "Batatas",
  pasteis: "Pastéis",
  bebidas: "Bebidas",
};

/** Ordem de exibição das categorias — a mesma em toda foto do lojista. */
const GALLERY_CATEGORY_ORDER: GalleryCategory[] = [
  "fachada",
  "ambiente",
  "cozinha",
  "equipe",
  "clientes",
  "hamburgueres",
  "batatas",
  "pasteis",
  "bebidas",
];

export const GALLERY_ITEMS: GalleryItem[] = [];

export function hasGallery(items: GalleryItem[] = GALLERY_ITEMS): boolean {
  return items.length > 0;
}

export type GalleryGroup = {
  category: GalleryCategory;
  label: string;
  items: GalleryItem[];
};

/** Agrupa por categoria, na ordem fixa de `GALLERY_CATEGORY_ORDER`, omitindo
 *  categorias sem nenhuma foto. */
export function groupGalleryByCategory(items: GalleryItem[]): GalleryGroup[] {
  return GALLERY_CATEGORY_ORDER.map((category) => ({
    category,
    label: GALLERY_CATEGORY_LABELS[category],
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
