import type { ReactNode } from "react";

import type { StoreNavTone } from "@/features/menu/components/store-nav-link";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<StoreNavTone, string> = {
  dark: "text-surface-dark-muted hover:bg-white/10 hover:text-surface-dark-foreground",
  light: "text-muted-foreground hover:bg-primary/10 hover:text-primary-text",
};

/**
 * Botão redondo de rede social. Existe para que sidebar, seção de contato e
 * footer não repitam a mesma string de classes três vezes — era exatamente
 * essa duplicação (`SOCIAL_LINK_CLASS`) registrada no BACKLOG.
 */
export function SocialLink({
  href,
  label,
  icon,
  tone = "light",
  className,
}: {
  href: string;
  /** Rótulo acessível — o ícone é puramente decorativo. */
  label: string;
  icon: ReactNode;
  tone?: StoreNavTone;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-colors",
        TONE_CLASS[tone],
        className,
      )}
    >
      {icon}
    </a>
  );
}
