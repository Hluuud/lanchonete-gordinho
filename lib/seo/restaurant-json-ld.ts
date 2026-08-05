import {
  ADDRESS_PARTS,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  PHONE_DISPLAY,
} from "@/features/menu/contact-info";
import { BUSINESS_HOURS, type DayHours } from "@/features/menu/store-info";
import { brand, siteUrl } from "@/lib/brand";

/** Índice = `Date#getDay()`, na nomenclatura em inglês que o schema.org exige. */
const SCHEMA_DAY_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function buildOpeningHours(hours: Record<number, DayHours>) {
  return Object.entries(hours)
    .filter(
      (entry): entry is [string, NonNullable<DayHours>] => entry[1] !== null,
    )
    .map(([day, window]) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: SCHEMA_DAY_OF_WEEK[Number(day)],
      opens: window.open,
      closes: window.close,
    }));
}

/**
 * Schema.org `Restaurant`, montado a partir das mesmas fontes que já
 * alimentam a página (`lib/brand`, `contact-info.ts`, `store-info.ts`) —
 * nenhum dado novo, só a forma que o Google espera. Injetado como
 * `<script type="application/ld+json">` na home (`app/(store)/page.tsx`).
 */
export function buildRestaurantJsonLd(): Record<string, unknown> {
  const url = siteUrl().toString();

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: brand.name,
    url,
    image: new URL("/brand/og-default.png", url).toString(),
    telephone: PHONE_DISPLAY,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${ADDRESS_PARTS.street}, ${ADDRESS_PARTS.number}`,
      addressLocality: ADDRESS_PARTS.city,
      addressRegion: ADDRESS_PARTS.state,
      addressCountry: "BR",
    },
    openingHoursSpecification: buildOpeningHours(BUSINESS_HOURS),
    servesCuisine: "Hamburgueria",
    priceRange: "$$",
    sameAs: [INSTAGRAM_LINK, FACEBOOK_LINK],
    hasMenu: url,
  };
}
