import { describe, expect, it } from "vitest";

import {
  ADDRESS,
  ADDRESS_PARTS,
  CNPJ,
  EMAIL,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_EMBED_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  SLOGAN,
  TIKTOK_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";

describe("contact-info", () => {
  it("expõe os dados estáticos de contato sem alteração", () => {
    expect(ADDRESS).toBe("Avenida 1, 548, Centro, Analândia - SP");
    expect(PHONE_DISPLAY).toBe("(19) 99727-3897");
    expect(EMAIL).toBe("edvaldolanchonete@hotmail.com");
    expect(CNPJ).toBe("09.068.710/0001-28");
    expect(INSTAGRAM_LINK).toBe("https://www.instagram.com/andre_edvaldo/");
    expect(FACEBOOK_LINK).toBe("https://www.facebook.com/edvaldo.andre");
    expect(SLOGAN).toBe("Sabor que aquece, feito com carinho");
  });

  it("deriva o link de telefone a partir do número exibido", () => {
    expect(PHONE_TEL_LINK).toBe("tel:+5519997273897");
  });

  it("deriva o link do WhatsApp a partir do número exibido", () => {
    expect(WHATSAPP_LINK).toBe("https://wa.me/5519997273897");
  });

  it("codifica o endereço no link do Google Maps", () => {
    expect(MAPS_LINK).toBe(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(ADDRESS),
    );
  });

  it("codifica o endereço no link de embed do Google Maps", () => {
    expect(MAPS_EMBED_LINK).toBe(
      "https://www.google.com/maps?q=" +
        encodeURIComponent(ADDRESS) +
        "&output=embed",
    );
  });

  it("ADDRESS é derivado de ADDRESS_PARTS, sem divergir", () => {
    expect(ADDRESS).toBe(
      `${ADDRESS_PARTS.street}, ${ADDRESS_PARTS.number}, ${ADDRESS_PARTS.neighborhood}, ${ADDRESS_PARTS.city} - ${ADDRESS_PARTS.state}`,
    );
  });

  it("TikTok ainda não tem perfil informado — link null", () => {
    expect(TIKTOK_LINK).toBeNull();
  });
});
