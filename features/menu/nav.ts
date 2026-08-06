import { Home, Info, Phone, UtensilsCrossed, type LucideIcon } from "lucide-react";

export type StoreNavItem = {
  /** Âncora DOM da seção, sem `#` — também serve de chave no React. */
  anchor: string;
  label: string;
  icon: LucideIcon;
  /**
   * Item-cabeçalho: renderiza menor e em caixa alta, e as categorias reais
   * do cardápio (e as seções virtuais de Promoções/Destaques) aparecem
   * indentadas logo abaixo dele.
   */
  isHeading?: boolean;
};

/**
 * Constrói a navegação da loja: 4 itens de topo, na mesma ordem em que as
 * seções aparecem na página — o ScrollSpy depende dessa correspondência
 * para destacar a seção certa. Promoções, Destaques da Casa e as categorias
 * reais do cardápio não são itens de topo — aparecem indentadas sob
 * "Cardápio" via `sections` (ver `buildStoreSections` em
 * `virtual-sections.ts` e a Sidebar/Drawer, que renderizam essa lista sob o
 * item `isHeading`).
 */
export function buildStoreNavItems(): StoreNavItem[] {
  return [
    { anchor: "home", label: "Home", icon: Home },
    {
      anchor: "cardapio",
      label: "Cardápio",
      icon: UtensilsCrossed,
      isHeading: true,
    },
    { anchor: "sobre", label: "Sobre Nós", icon: Info },
    { anchor: "contato", label: "Contato", icon: Phone },
  ];
}

/**
 * Navegação real da loja hoje — único ponto que sidebar, drawer e footer
 * devem importar.
 */
export const STORE_NAV_ITEMS: StoreNavItem[] = buildStoreNavItems();

/** Âncoras observadas pelo ScrollSpy, na ordem da página. */
export const STORE_NAV_ANCHORS: string[] = STORE_NAV_ITEMS.map(
  (item) => item.anchor,
);
