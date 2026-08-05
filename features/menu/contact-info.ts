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

/**
 * Partes estruturadas do endereço — fonte única para `ADDRESS` (texto livre,
 * exibição) e para o `PostalAddress` do JSON-LD (Sprint 8, Fase 8). Sem CEP:
 * não temos o dado, e inventar quebraria a mesma regra de honestidade da UI
 * que já rege o resto da loja.
 */
export const ADDRESS_PARTS = {
  street: "Avenida 1",
  number: "548",
  neighborhood: "Centro",
  city: "Analândia",
  state: "SP",
} as const;

export const ADDRESS = `${ADDRESS_PARTS.street}, ${ADDRESS_PARTS.number}, ${ADDRESS_PARTS.neighborhood}, ${ADDRESS_PARTS.city} - ${ADDRESS_PARTS.state}`;
export const PHONE_DISPLAY = "(19) 99727-3897";
export const EMAIL = "edvaldolanchonete@hotmail.com";
export const CNPJ = "09.068.710/0001-28";
/** Instagram/Facebook pessoais do proprietário — únicos disponíveis hoje. */
export const INSTAGRAM_LINK = "https://www.instagram.com/andre_edvaldo/";
export const FACEBOOK_LINK = "https://www.facebook.com/edvaldo.andre";
/**
 * Sem perfil informado pelo lojista nem coluna em `tenants` (BACKLOG.md) —
 * `null` até existir. Consumidores (`store-contact-section.tsx`,
 * `store-footer.tsx`) só renderizam o ícone quando isto não for `null`.
 */
export const TIKTOK_LINK: string | null = null;

export const PHONE_TEL_LINK = `tel:+55${digitsOnly(PHONE_DISPLAY)}`;
export const WHATSAPP_LINK = `https://wa.me/55${digitsOnly(PHONE_DISPLAY)}`;
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
/** Embed público do Google Maps — sem chave de API, só o endereço na URL. */
export const MAPS_EMBED_LINK = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
