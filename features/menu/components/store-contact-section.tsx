import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StoreOpenBadge } from "@/features/menu/components/store-open-badge";
import {
  ADDRESS,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_EMBED_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import { FacebookIcon, InstagramIcon } from "@/features/menu/social-icons";

const SOCIAL_LINK_CLASS =
  "flex size-11 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary";

/**
 * Seção de contato (`#contato`): mapa embutido (Google Maps, sem chave de
 * API) + cards de endereço/telefone/horário/redes + botão "Como chegar".
 * Layout próprio (não reaproveita o `StoreContactFooter` compacto da
 * sidebar) — mesmas constantes de dado, visual maior/mais rico. O card de
 * horário reaproveita `StoreOpenBadge` em vez de chamar
 * `getStoreOpenState(new Date())` direto, pra não reintroduzir o problema
 * de hydration mismatch que aquele componente já resolve.
 */
export function StoreContactSection() {
  return (
    <section
      id="contato"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <h2 className="text-3xl leading-tight font-black text-balance lg:text-4xl">
        Onde estamos
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border">
          <iframe
            src={MAPS_EMBED_LINK}
            loading="lazy"
            title={`Mapa de localização — ${ADDRESS}`}
            className="h-80 w-full lg:h-full"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <MapPin
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold">Endereço</p>
              <p className="text-sm text-muted-foreground">{ADDRESS}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <Phone
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold">Telefone</p>
              <a
                href={PHONE_TEL_LINK}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <Clock
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold">Horário</p>
              <div className="mt-1">
                <StoreOpenBadge />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={SOCIAL_LINK_CLASS}
            >
              <MessageCircle className="size-5" aria-hidden />
            </a>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={SOCIAL_LINK_CLASS}
            >
              <InstagramIcon className="size-5" />
            </a>
            <a
              href={FACEBOOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={SOCIAL_LINK_CLASS}
            >
              <FacebookIcon className="size-5" />
            </a>
          </div>

          <Button asChild size="lg" className="w-full rounded-full sm:w-fit">
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
              Como chegar
              <Navigation className="size-4" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
