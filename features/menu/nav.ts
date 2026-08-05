import {
  Home,
  Images,
  Info,
  MessageSquareQuote,
  Package,
  Phone,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import {
  GALLERY_ITEMS,
  hasGallery as hasGalleryItems,
} from "@/features/menu/gallery";

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

type BuildStoreNavItemsOptions = {
  /** `#galeria` só entra quando há pelo menos uma foto (`gallery.ts`). */
  hasGallery?: boolean;
  /** `#depoimentos` só entra quando há pelo menos uma avaliação real
   *  (`testimonials.ts`, Sprint 8 Fase 6). */
  hasTestimonials?: boolean;
};

/**
 * Constrói a navegação da loja, na mesma ordem em que as seções aparecem na
 * página — o ScrollSpy depende dessa correspondência para destacar a seção
 * certa. `galeria`/`depoimentos` são condicionais: um item só entra aqui
 * quando a âncora correspondente existe de fato no DOM, senão o menu
 * promete um destino que não leva a lugar nenhum (mesma regra que já valia
 * para as categorias reais do cardápio).
 */
export function buildStoreNavItems({
  hasGallery = false,
  hasTestimonials = false,
}: BuildStoreNavItemsOptions = {}): StoreNavItem[] {
  return [
    { anchor: "home", label: "Home", icon: Home },
    {
      anchor: "cardapio",
      label: "Cardápio",
      icon: UtensilsCrossed,
      isHeading: true,
    },
    { anchor: "promocoes", label: "Promoções", icon: Sparkles },
    { anchor: "combos", label: "Combos", icon: Package },
    { anchor: "mais-vendidos", label: "Mais Vendidos", icon: TrendingUp },
    ...(hasGallery
      ? [{ anchor: "galeria", label: "Galeria", icon: Images }]
      : []),
    { anchor: "sobre", label: "Sobre Nós", icon: Info },
    ...(hasTestimonials
      ? [
          {
            anchor: "depoimentos",
            label: "Depoimentos",
            icon: MessageSquareQuote,
          },
        ]
      : []),
    { anchor: "contato", label: "Contato", icon: Phone },
  ];
}

/**
 * Navegação real da loja hoje, com o estado atual de cada seção opcional —
 * único ponto que sidebar, drawer e footer devem importar. `hasTestimonials`
 * ainda não é passado: `testimonials.ts` chega na Fase 6.
 */
export const STORE_NAV_ITEMS: StoreNavItem[] = buildStoreNavItems({
  hasGallery: hasGalleryItems(GALLERY_ITEMS),
});

/** Âncoras observadas pelo ScrollSpy, na ordem da página. */
export const STORE_NAV_ANCHORS: string[] = STORE_NAV_ITEMS.map(
  (item) => item.anchor,
);
