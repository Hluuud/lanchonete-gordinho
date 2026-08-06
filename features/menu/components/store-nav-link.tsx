"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Superfície onde o link está montado. A sidebar desktop vive sobre o preto
 * da marca; o drawer do celular, sobre o creme do `background`.
 */
export type StoreNavTone = "dark" | "light";

const TONE_IDLE: Record<StoreNavTone, string> = {
  dark: "text-surface-dark-muted hover:bg-white/8 hover:text-surface-dark-foreground",
  light: "text-foreground hover:bg-primary/10 hover:text-primary-text",
};

const TONE_HEADING: Record<StoreNavTone, string> = {
  dark: "text-surface-dark-muted hover:text-surface-dark-foreground",
  light: "text-muted-foreground hover:text-primary",
};

const TONE_COUNT: Record<StoreNavTone, string> = {
  dark: "text-surface-dark-muted/70",
  light: "text-muted-foreground",
};

const ACTIVE_CLASS = "bg-primary font-semibold text-primary-foreground";

/**
 * Item de navegação da loja — um único lugar com as regras de estado
 * (ativo/ocioso), altura de alvo de toque e tom da superfície, consumido
 * tanto pela `StoreSidebar` quanto pela `StoreMobileNav`.
 *
 * Renderiza sempre um `<a href="#ancora">`: o link continua funcionando (e
 * sendo copiável) sem JS, e o `onNavigate` só assume o scroll suave.
 */
export function StoreNavLink({
  anchor,
  label,
  icon,
  count,
  isActive = false,
  isHeading = false,
  isIndented = false,
  tone,
  onNavigate,
}: {
  anchor: string;
  label: string;
  /** Ícone já renderizado — permite tanto lucide quanto o `CategoryIcon`. */
  icon: ReactNode;
  count?: number;
  isActive?: boolean;
  isHeading?: boolean;
  isIndented?: boolean;
  tone: StoreNavTone;
  onNavigate: (anchor: string) => void;
}) {
  if (isHeading) {
    return (
      <a
        href={`#${anchor}`}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(anchor);
        }}
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors",
          TONE_HEADING[tone],
        )}
      >
        {icon}
        {label}
      </a>
    );
  }

  return (
    <a
      href={`#${anchor}`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(anchor);
      }}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isIndented && "ml-3",
        isActive ? ACTIVE_CLASS : TONE_IDLE[tone],
      )}
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "text-xs tabular-nums",
            isActive ? "text-primary-foreground/70" : TONE_COUNT[tone],
          )}
        >
          {count}
        </span>
      )}
    </a>
  );
}
