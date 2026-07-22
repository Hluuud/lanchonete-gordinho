"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CartPanelContent } from "@/features/cart/components/cart-panel-content";
import { useCart } from "@/features/cart/use-cart";
import { useMediaQuery } from "@/hooks/use-media-query";

const CART_TITLE = "Seu carrinho";
const CART_DESCRIPTION = "Itens adicionados ao seu pedido.";

/**
 * Painel do carrinho, adaptativo por breakpoint: Bottom Sheet (vaul) no
 * celular, Drawer lateral (Radix Dialog) no desktop — mesmo conteúdo.
 */
export function CartPanel() {
  const { isOpen, setOpen } = useCart();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent
          title={CART_TITLE}
          description={CART_DESCRIPTION}
          className="p-0 pt-6 sm:max-w-md"
        >
          <CartPanelContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent
        title={CART_TITLE}
        description={CART_DESCRIPTION}
        className="max-h-[92dvh]"
      >
        <div className="min-h-0 flex-1 pt-2 pb-[env(safe-area-inset-bottom)]">
          <CartPanelContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
