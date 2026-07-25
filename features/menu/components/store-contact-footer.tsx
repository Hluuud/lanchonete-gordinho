"use client";

import { useSyncExternalStore } from "react";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";

import {
  ADDRESS,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import { FacebookIcon, InstagramIcon } from "@/features/menu/social-icons";
import { getStoreOpenState } from "@/features/menu/store-info";
import { cn } from "@/lib/utils";

const MINUTE_MS = 60_000;

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, MINUTE_MS);
  return () => window.clearInterval(id);
}

function getMinuteSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS);
}

function getServerSnapshot(): number | null {
  return null;
}

const SOCIAL_LINK_CLASS =
  "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary";

/**
 * Rodapé de contato reaproveitado pela sidebar desktop (`StoreSidebar`) e
 * pelo drawer mobile (`StoreMobileNav`): WhatsApp/Instagram/Facebook,
 * telefone, endereço (link "Como chegar") e status de horário. Relógio via
 * `useSyncExternalStore` com snapshot por minuto — mesmo padrão de
 * `StoreOpenBadge`, evita hydration mismatch (servidor renderiza
 * placeholder neutro).
 */
export function StoreContactFooter({
  className,
}: {
  className?: string;
} = {}) {
  const minute = useSyncExternalStore(
    subscribe,
    getMinuteSnapshot,
    getServerSnapshot,
  );

  return (
    <div className={cn("flex shrink-0 flex-col gap-3 border-t px-5 py-4", className)}>
      <div className="flex items-center gap-1">
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

      <a
        href={PHONE_TEL_LINK}
        className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <Phone className="size-3.5 shrink-0" aria-hidden />
        {PHONE_DISPLAY}
      </a>

      <a
        href={MAPS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{ADDRESS}</span>
      </a>

      {minute === null ? (
        <span className="h-4 w-32 animate-pulse rounded bg-secondary" aria-hidden />
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          {getStoreOpenState(new Date()).label}
        </div>
      )}
    </div>
  );
}
