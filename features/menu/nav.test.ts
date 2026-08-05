import { describe, expect, it } from "vitest";

import {
  buildStoreNavItems,
  STORE_NAV_ANCHORS,
  STORE_NAV_ITEMS,
} from "@/features/menu/nav";
import { sectionAnchorId } from "@/features/menu/virtual-sections";

describe("STORE_NAV_ITEMS", () => {
  it("não repete âncoras — duas iguais quebrariam o ScrollSpy e o scroll suave", () => {
    expect(new Set(STORE_NAV_ANCHORS).size).toBe(STORE_NAV_ANCHORS.length);
  });

  it("todo item tem rótulo e ícone", () => {
    for (const item of STORE_NAV_ITEMS) {
      expect(item.label.trim()).not.toBe("");
      // Ícones do lucide são objetos (`forwardRef`), não funções simples.
      expect(item.icon).toBeTruthy();
    }
  });

  it("nenhuma âncora colide com as das seções de categoria", () => {
    // As seções do cardápio usam o prefixo `categoria-`; um item de menu com
    // esse prefixo apontaria para o mesmo elemento que uma categoria.
    for (const anchor of STORE_NAV_ANCHORS) {
      expect(anchor).not.toBe(sectionAnchorId(anchor));
      expect(anchor.startsWith("categoria-")).toBe(false);
    }
  });

  it("começa na Home e termina no Contato", () => {
    expect(STORE_NAV_ANCHORS.at(0)).toBe("home");
    expect(STORE_NAV_ANCHORS.at(-1)).toBe("contato");
  });

  it("tem exatamente um item-cabeçalho (Cardápio), sob o qual as categorias são indentadas", () => {
    const headings = STORE_NAV_ITEMS.filter((item) => item.isHeading);

    expect(headings).toHaveLength(1);
    expect(headings[0].anchor).toBe("cardapio");
  });
});

describe("buildStoreNavItems", () => {
  it("omite galeria e depoimentos por padrão — não prometer âncora sem seção", () => {
    const anchors = buildStoreNavItems().map((item) => item.anchor);

    expect(anchors).not.toContain("galeria");
    expect(anchors).not.toContain("depoimentos");
  });

  it("inclui galeria, na posição certa, quando hasGallery é true", () => {
    const anchors = buildStoreNavItems({ hasGallery: true }).map(
      (item) => item.anchor,
    );

    expect(anchors).toContain("galeria");
    expect(anchors.indexOf("galeria")).toBeLessThan(anchors.indexOf("sobre"));
  });

  it("inclui depoimentos, depois de sobre e antes de contato, quando hasTestimonials é true", () => {
    const anchors = buildStoreNavItems({ hasTestimonials: true }).map(
      (item) => item.anchor,
    );

    expect(anchors).toContain("depoimentos");
    expect(anchors.indexOf("sobre")).toBeLessThan(
      anchors.indexOf("depoimentos"),
    );
    expect(anchors.indexOf("depoimentos")).toBeLessThan(
      anchors.indexOf("contato"),
    );
  });

  it("com as duas flags ligadas, ainda não repete âncora nenhuma", () => {
    const anchors = buildStoreNavItems({
      hasGallery: true,
      hasTestimonials: true,
    }).map((item) => item.anchor);

    expect(new Set(anchors).size).toBe(anchors.length);
  });
});
