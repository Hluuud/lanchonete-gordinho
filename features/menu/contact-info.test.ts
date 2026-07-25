import { describe, expect, it } from "vitest";

import {
  ADDRESS,
  CNPJ,
  EMAIL,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";

describe("contact-info", () => {
  it("expõe os dados estáticos de contato sem alteração", () => {
    expect(ADDRESS).toBe("Calçadão Ricardo Gregório, 548, Analândia - SP");
    expect(PHONE_DISPLAY).toBe("(19) 99727-3897");
    expect(EMAIL).toBe("edvaldolanchonete@hotmail.com");
    expect(CNPJ).toBe("09.068.710/0001-28");
    expect(INSTAGRAM_LINK).toBe("https://www.instagram.com/andre_edvaldo/");
    expect(FACEBOOK_LINK).toBe("https://www.facebook.com/edvaldo.andre");
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
});
