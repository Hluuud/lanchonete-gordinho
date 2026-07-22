import {
  CupSoda,
  IceCreamCone,
  Sandwich,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * Ícone por categoria (puramente cosmético). Mapeado por slug, com fallback
 * seguro — categorias futuras de outros tenants não têm ícone dedicado ainda,
 * mas nunca quebram (caem no ícone genérico).
 */
const ICONS_BY_SLUG: Record<string, LucideIcon> = {
  lanches: Sandwich,
  porcoes: UtensilsCrossed,
  bebidas: CupSoda,
  sobremesas: IceCreamCone,
};

export function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = ICONS_BY_SLUG[slug] ?? UtensilsCrossed;
  return <Icon className={className} aria-hidden />;
}
