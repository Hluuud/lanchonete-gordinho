import { BrandLogo } from "@/components/brand-logo";
import { SocialLink } from "@/features/menu/components/social-link";
import {
  ADDRESS,
  CNPJ,
  EMAIL,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  SLOGAN,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import { STORE_NAV_ITEMS } from "@/features/menu/nav";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/features/menu/social-icons";

const LINK_CLASS =
  "text-sm text-surface-dark-muted transition-colors hover:text-surface-dark-foreground";

/**
 * Rodapé institucional da página — aparece uma única vez, ao final do
 * scroll, sobre o preto da marca. Os links úteis vêm de `STORE_NAV_ITEMS`,
 * a mesma fonte da sidebar. Sem `onClick`/`scrollToSection`: as âncoras usam
 * salto direto do navegador (`<a href="#id">` puro), já que é o fim da
 * página.
 */
export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-dark-border bg-surface-dark text-surface-dark-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <p className="font-display text-lg tracking-wide uppercase">
              Lanchonete do Gordinho
            </p>
          </div>
          <p className="text-sm text-surface-dark-muted">{SLOGAN}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Contato</p>
          <a href={PHONE_TEL_LINK} className={LINK_CLASS}>
            {PHONE_DISPLAY}
          </a>
          <a href={`mailto:${EMAIL}`} className={LINK_CLASS}>
            {EMAIL}
          </a>
          <p className="text-sm text-surface-dark-muted">{ADDRESS}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Links úteis</p>
          {STORE_NAV_ITEMS.map((item) => (
            <a
              key={item.anchor}
              href={`#${item.anchor}`}
              className={LINK_CLASS}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Redes sociais</p>
          <div className="flex items-center gap-2">
            <SocialLink
              href={WHATSAPP_LINK}
              label="WhatsApp"
              tone="dark"
              className="size-10 border border-surface-dark-border"
              icon={<WhatsAppIcon className="size-4" />}
            />
            <SocialLink
              href={INSTAGRAM_LINK}
              label="Instagram"
              tone="dark"
              className="size-10 border border-surface-dark-border"
              icon={<InstagramIcon className="size-4" />}
            />
            <SocialLink
              href={FACEBOOK_LINK}
              label="Facebook"
              tone="dark"
              className="size-10 border border-surface-dark-border"
              icon={<FacebookIcon className="size-4" />}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-surface-dark-border px-4 py-4 text-center text-xs text-surface-dark-muted lg:px-8">
        © {year} Lanchonete do Gordinho — CNPJ {CNPJ}. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
