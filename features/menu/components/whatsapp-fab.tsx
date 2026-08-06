"use client";

import { usePathname } from "next/navigation";

import { WHATSAPP_LINK } from "@/features/menu/contact-info";
import { WhatsAppIcon } from "@/features/menu/social-icons";

/**
 * Botão flutuante do WhatsApp, empilhado acima do `CartButton`
 * (`features/cart/components/cart-button.tsx`) no canto inferior direito —
 * mesmos breakpoints (pílula do carrinho ocupa a largura toda no mobile,
 * compacta a partir de `sm`). Sem pulso constante — nunca deve competir
 * visualmente com o carrinho, que é a ação primária. Cor sólida do
 * WhatsApp (`#25D366`) em vez do token `--success` do projeto: aquele
 * token só é usado como fundo suave (`/15`) para badges de status, não
 * pensado para preencher um botão inteiro. Oculto no checkout — mesma regra
 * do `CartButton`, um CTA de saída não deve competir com a finalização.
 */
export function WhatsappFab() {
  const pathname = usePathname();

  if (pathname.startsWith("/checkout")) return null;

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed right-4 bottom-20 z-40 flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform active:scale-95 sm:right-6 sm:bottom-24"
    >
      <WhatsAppIcon className="size-6" />
    </a>
  );
}
