// features/menu/components/store-open-badge.tsx
"use client";

import { useStoreOpenState } from "@/features/menu/use-store-open-state";
import { cn } from "@/lib/utils";

/** Badge Aberto/Fechado da barra superior. */
export function StoreOpenBadge() {
  const state = useStoreOpenState();

  if (state === null) {
    return (
      <span
        className="h-7 w-28 animate-pulse rounded-full bg-secondary"
        aria-hidden
      />
    );
  }

  const { isOpen, label } = state;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
        isOpen ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isOpen ? "bg-success" : "bg-muted-foreground",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
