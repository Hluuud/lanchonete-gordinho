import { describe, expect, it } from "vitest";

import { buildRestaurantJsonLd } from "@/lib/seo/restaurant-json-ld";

describe("buildRestaurantJsonLd", () => {
  it("monta o schema.org Restaurant com os campos essenciais", () => {
    const jsonLd = buildRestaurantJsonLd();

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Restaurant");
    expect(jsonLd.name).toBe("Lanchonete do Gordinho");
    expect(jsonLd.telephone).toBe("(19) 99727-3897");
    expect(jsonLd.servesCuisine).toBe("Hamburgueria");
    expect(jsonLd.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Avenida 1, 548",
      addressLocality: "Analândia",
      addressRegion: "SP",
      addressCountry: "BR",
    });
    expect(jsonLd.sameAs).toEqual([
      "https://www.instagram.com/andre_edvaldo/",
      "https://www.facebook.com/edvaldo.andre",
    ]);
  });

  it("lista só os dias com horário definido, no formato em inglês do schema.org", () => {
    const jsonLd = buildRestaurantJsonLd();
    const hours = jsonLd.openingHoursSpecification as {
      "@type": string;
      dayOfWeek: string;
      opens: string;
      closes: string;
    }[];

    // BUSINESS_HOURS: segunda (dia 1) fechada, os outros 6 dias abertos.
    expect(hours).toHaveLength(6);
    expect(hours.map((entry) => entry.dayOfWeek)).not.toContain("Monday");
    expect(
      hours.every((entry) => entry["@type"] === "OpeningHoursSpecification"),
    ).toBe(true);
  });

  it("url e hasMenu apontam pra mesma URL do site", () => {
    const jsonLd = buildRestaurantJsonLd();
    expect(jsonLd.hasMenu).toBe(jsonLd.url);
  });

  it("é serializável em JSON sem lançar", () => {
    expect(() => JSON.stringify(buildRestaurantJsonLd())).not.toThrow();
  });
});
