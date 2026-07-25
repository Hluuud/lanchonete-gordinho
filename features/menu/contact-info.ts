/**
 * Dados reais de contato/redes da loja (fornecidos pelo lojista em
 * 2026-07-24), mantidos como constante no client até existir wiring de
 * `tenants.phone/whatsapp/instagram/facebook/address` no service/repository
 * público do cardápio (hoje `findTenantBySlug` só busca `id, slug, name` —
 * ver BACKLOG.md). Mesmo padrão já usado em `BUSINESS_HOURS`
 * (`store-info.ts`): quando o wiring existir, só a fonte muda, a forma de
 * consumo (estas constantes) permanece.
 */

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export const SLOGAN = "Sabor que aquece, feito com carinho";

export const ADDRESS = "Avenida 1, 548, Centro, Analândia - SP";
export const PHONE_DISPLAY = "(19) 99727-3897";
export const EMAIL = "edvaldolanchonete@hotmail.com";
export const CNPJ = "09.068.710/0001-28";
/** Instagram/Facebook pessoais do proprietário — únicos disponíveis hoje. */
export const INSTAGRAM_LINK = "https://www.instagram.com/andre_edvaldo/";
export const FACEBOOK_LINK = "https://www.facebook.com/edvaldo.andre";

export const PHONE_TEL_LINK = `tel:+55${digitsOnly(PHONE_DISPLAY)}`;
export const WHATSAPP_LINK = `https://wa.me/55${digitsOnly(PHONE_DISPLAY)}`;
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
/** Embed público do Google Maps — sem chave de API, só o endereço na URL. */
export const MAPS_EMBED_LINK = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
