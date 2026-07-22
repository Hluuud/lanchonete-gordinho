import {
  CupSoda,
  Flame,
  IceCreamCone,
  Sandwich,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * Ícone por categoria/seção (puramente cosmético). Mapeado por slug, com
 * fallback seguro — categorias futuras de outros tenants não têm ícone
 * dedicado ainda, mas nunca quebram (caem no ícone genérico). Inclui os
 * slugs das seções virtuais (`virtual-sections.ts`).
 */
const ICONS_BY_SLUG: Record<string, LucideIcon> = {
  lanches: Sandwich,
  porcoes: UtensilsCrossed,
  bebidas: CupSoda,
  sobremesas: IceCreamCone,
  destaques: Flame,
  novidades: Sparkles,
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
