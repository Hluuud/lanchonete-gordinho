import { OfflineBanner } from "@/components/offline-banner";
import { CartButton } from "@/features/cart/components/cart-button";
import { CartPanel } from "@/features/cart/components/cart-panel";
import { CartProvider } from "@/features/cart/cart-context";

/**
 * Layout da loja pública. O carrinho é escopado aqui — não existe em
 * `(admin)`/`(kitchen)`, que não têm relação com o pedido do cliente.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <OfflineBanner />
      {children}
      <CartButton />
      <CartPanel />
    </CartProvider>
  );
}
