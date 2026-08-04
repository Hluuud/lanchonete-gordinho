"use client";

import { useSyncExternalStore } from "react";
import { Clock, MapPin, Phone } from "lucide-react";

import { SocialLink } from "@/features/menu/components/social-link";
import type { StoreNavTone } from "@/features/menu/components/store-nav-link";
import {
  ADDRESS,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/features/menu/social-icons";
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

const TONE_BORDER: Record<StoreNavTone, string> = {
  dark: "border-surface-dark-border",
  light: "border-border",
};

const TONE_TEXT: Record<StoreNavTone, string> = {
  dark: "text-surface-dark-muted hover:text-surface-dark-foreground",
  light: "text-muted-foreground hover:text-primary",
};

const TONE_SKELETON: Record<StoreNavTone, string> = {
  dark: "bg-white/10",
  light: "bg-secondary",
};

/**
 * Rodapé de contato reaproveitado pela sidebar desktop (`StoreSidebar`, sobre
 * o preto da marca) e pelo drawer mobile (`StoreMobileNav`, sobre o creme):
 * WhatsApp/Instagram/Facebook, telefone, endereço (link "Como chegar") e
 * status de horário. Relógio via `useSyncExternalStore` com snapshot por
 * minuto — mesmo padrão de `StoreOpenBadge`, evita hydration mismatch
 * (servidor renderiza placeholder neutro).
 */
export function StoreContactFooter({
  tone = "light",
  className,
}: {
  tone?: StoreNavTone;
  className?: string;
} = {}) {
  const minute = useSyncExternalStore(
    subscribe,
    getMinuteSnapshot,
    getServerSnapshot,
  );

  const linkClass = cn(
    "flex items-center gap-2 text-xs transition-colors",
    TONE_TEXT[tone],
  );

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-3 border-t px-5 py-4",
        TONE_BORDER[tone],
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <SocialLink
          href={WHATSAPP_LINK}
          label="WhatsApp"
          tone={tone}
          icon={<WhatsAppIcon className="size-4" />}
        />
        <SocialLink
          href={INSTAGRAM_LINK}
          label="Instagram"
          tone={tone}
          icon={<InstagramIcon className="size-4" />}
        />
        <SocialLink
          href={FACEBOOK_LINK}
          label="Facebook"
          tone={tone}
          icon={<FacebookIcon className="size-4" />}
        />
      </div>

      <a href={PHONE_TEL_LINK} className={linkClass}>
        <Phone className="size-3.5 shrink-0" aria-hidden />
        {PHONE_DISPLAY}
      </a>

      <a
        href={MAPS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(linkClass, "items-start")}
      >
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{ADDRESS}</span>
      </a>

      {minute === null ? (
        <span
          className={cn("h-4 w-32 animate-pulse rounded", TONE_SKELETON[tone])}
          aria-hidden
        />
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 text-xs",
            tone === "dark" ? "text-surface-dark-muted" : "text-muted-foreground",
          )}
        >
          <Clock className="size-3.5 shrink-0" aria-hidden />
          {getStoreOpenState(new Date()).label}
        </div>
      )}
    </div>
  );
}
