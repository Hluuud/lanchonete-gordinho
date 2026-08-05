import { Clock, MapPin, Navigation, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SocialLink } from "@/features/menu/components/social-link";
import { StoreOpenBadge } from "@/features/menu/components/store-open-badge";
import {
  ADDRESS,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_EMBED_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  TIKTOK_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/features/menu/social-icons";
import { getWeeklyHours } from "@/features/menu/store-info";
import { cn } from "@/lib/utils";

/** Botão de rede social maior que o padrão da sidebar, com borda. */
const SOCIAL_LINK_CLASS = "size-11 border";

/**
 * Seção de contato (`#contato`): mapa embutido (Google Maps, sem chave de
 * API) + cards de endereço/telefone/horário/redes + CTAs de WhatsApp e
 * "Como chegar". Layout próprio (não reaproveita o `StoreContactFooter`
 * compacto da sidebar) — mesmas constantes de dado, visual maior/mais rico.
 * O card de horário mostra a semana inteira (`getWeeklyHours`), com
 * `StoreOpenBadge` no topo pro "aberto agora" — não chama
 * `getStoreOpenState(new Date())` direto, pra não reintroduzir o problema
 * de hydration mismatch que aquele componente já resolve.
 */
export function StoreContactSection() {
  const week = getWeeklyHours();

  return (
    <section
      id="contato"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <span className="block h-1.5 w-16 rounded-full bg-primary" aria-hidden />
      <h2 className="mt-4 font-display text-3xl leading-none tracking-tight text-balance uppercase lg:text-5xl">
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
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Horário</p>
              <div className="mt-1">
                <StoreOpenBadge />
              </div>
              <dl className="mt-3 flex flex-col gap-1">
                {week.map((entry) => (
                  <div
                    key={entry.day}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <dt className="text-muted-foreground">{entry.label}</dt>
                    <dd
                      className={cn(
                        "font-medium",
                        !entry.hours && "text-muted-foreground",
                      )}
                    >
                      {entry.hours
                        ? `${entry.hours.open} – ${entry.hours.close}`
                        : "Fechado"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SocialLink
              href={WHATSAPP_LINK}
              label="WhatsApp"
              className={SOCIAL_LINK_CLASS}
              icon={<WhatsAppIcon className="size-5" />}
            />
            <SocialLink
              href={INSTAGRAM_LINK}
              label="Instagram"
              className={SOCIAL_LINK_CLASS}
              icon={<InstagramIcon className="size-5" />}
            />
            <SocialLink
              href={FACEBOOK_LINK}
              label="Facebook"
              className={SOCIAL_LINK_CLASS}
              icon={<FacebookIcon className="size-5" />}
            />
            {TIKTOK_LINK && (
              <SocialLink
                href={TIKTOK_LINK}
                label="TikTok"
                className={SOCIAL_LINK_CLASS}
                icon={<TikTokIcon className="size-5" />}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Chamar no WhatsApp
                <WhatsAppIcon className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                Como chegar
                <Navigation className="size-4" aria-hidden />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
