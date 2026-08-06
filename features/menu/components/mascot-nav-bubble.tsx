"use client";

import { useState } from "react";
import Image from "next/image";

import { StoreMobileNav } from "@/features/menu/components/store-mobile-nav";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import type { StoreSection } from "@/features/menu/virtual-sections";

/**
 * Identidade + gatilho de navegação do mobile: bolha fixa do Gordinho no
 * canto superior esquerdo. Substitui a `StoreTopbar` removida — no desktop
 * (`lg:+`) a sidebar fixa já cobre identidade e navegação, então esta bolha
 * só renderiza abaixo de `lg` (ver classe `lg:hidden`).
 *
 * Um toque curto abre o Drawer de navegação (`StoreMobileNav`, o mesmo que
 * a topbar abria); nenhuma ação de toque leva para `#home` diretamente,
 * porque o próprio Drawer já lista "Home" como primeiro item — duplicar o
 * destino do toque só confundiria qual ação o mascote executa.
 */
export function MascotNavBubble({
  tenantName,
  sections,
  query,
  onQueryChange,
}: {
  tenantName: string;
  sections: StoreSection[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu de navegação"
        className="fixed top-4 left-4 z-40 flex size-14 items-center justify-center rounded-full bg-surface-dark shadow-lg ring-2 ring-primary transition-transform active:scale-95 lg:hidden"
      >
        <Image
          src="/brand/mascote-avatar.png"
          alt="Gordinho"
          width={56}
          height={56}
          className="size-full rounded-full object-cover"
        />
      </button>

      <StoreMobileNav
        open={open}
        onOpenChange={setOpen}
        tenantName={tenantName}
        sections={sections}
        query={query}
        onQueryChange={onQueryChange}
      />
    </>
  );
}
