import { describe, expect, it } from "vitest";

import {
  GALLERY_ITEMS,
  groupGalleryByCategory,
  hasGallery,
  type GalleryItem,
} from "@/features/menu/gallery";

function item(overrides: Partial<GalleryItem> = {}): GalleryItem {
  return {
    id: "1",
    src: "/gallery/1.jpg",
    alt: "Foto",
    category: "fachada",
    ...overrides,
  };
}

describe("hasGallery", () => {
  it("é false enquanto GALLERY_ITEMS estiver vazia (estado atual do repo)", () => {
    expect(hasGallery(GALLERY_ITEMS)).toBe(false);
    expect(hasGallery()).toBe(false);
  });

  it("é true com pelo menos um item", () => {
    expect(hasGallery([item()])).toBe(true);
  });
});

describe("groupGalleryByCategory", () => {
  it("agrupa por categoria na ordem fixa, omitindo categorias vazias", () => {
    const groups = groupGalleryByCategory([
      item({ id: "1", category: "bebidas" }),
      item({ id: "2", category: "fachada" }),
      item({ id: "3", category: "fachada" }),
    ]);

    expect(groups.map((group) => group.category)).toEqual([
      "fachada",
      "bebidas",
    ]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].items).toHaveLength(1);
  });

  it("volta lista vazia sem itens", () => {
    expect(groupGalleryByCategory([])).toEqual([]);
  });
});
