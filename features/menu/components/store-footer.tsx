import { MessageCircle } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
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
import { FacebookIcon, InstagramIcon } from "@/features/menu/social-icons";

const USEFUL_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Cardápio", href: "#cardapio" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

const SOCIAL_LINK_CLASS =
  "flex size-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary";

/**
 * Rodapé institucional da página — aparece uma única vez, ao final do
 * scroll. Sem `onClick`/`scrollToSection`: os links de âncora usam salto
 * direto do navegador (`<a href="#id">` puro), já que é o fim da página.
 */
export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <p className="font-extrabold">Lanchonete do Gordinho</p>
          </div>
          <p className="text-sm text-muted-foreground">{SLOGAN}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Contato</p>
          <a
            href={PHONE_TEL_LINK}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {EMAIL}
          </a>
          <p className="text-sm text-muted-foreground">{ADDRESS}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Links úteis</p>
          {USEFUL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Redes sociais</p>
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={SOCIAL_LINK_CLASS}
            >
              <MessageCircle className="size-4" aria-hidden />
            </a>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={SOCIAL_LINK_CLASS}
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={FACEBOOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={SOCIAL_LINK_CLASS}
            >
              <FacebookIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground lg:px-8">
        © {year} Lanchonete do Gordinho — CNPJ {CNPJ}. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
