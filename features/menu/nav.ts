import { Home, Info, Phone, UtensilsCrossed, type LucideIcon } from "lucide-react";

export type StoreNavItem = {
  /** Âncora DOM da seção, sem `#` — também serve de chave no React. */
  anchor: string;
  label: string;
  icon: LucideIcon;
  /**
   * Item-cabeçalho: renderiza menor e em caixa alta, e as categorias reais
   * do cardápio aparecem indentadas logo abaixo dele.
   */
  isHeading?: boolean;
};

/**
 * Navegação da loja, na mesma ordem em que as seções aparecem na página — o
 * ScrollSpy depende dessa correspondência para destacar a seção certa.
 *
 * A lista cresce junto com as seções: um item só entra aqui quando a âncora
 * correspondente existe de fato no DOM, senão o menu promete um destino que
 * não leva a lugar nenhum. Promoções, Combos e Mais Vendidos entram na fase
 * que constrói cada uma dessas seções.
 */
export const STORE_NAV_ITEMS: StoreNavItem[] = [
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

/** Âncoras observadas pelo ScrollSpy, na ordem da página. */
export const STORE_NAV_ANCHORS: string[] = STORE_NAV_ITEMS.map(
  (item) => item.anchor,
);
