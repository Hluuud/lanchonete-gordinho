import { Flame, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * `promo` fica de fora enquanto o checkout não honrar `promo_price_cents`
 * (ver aviso em `features/menu/virtual-sections.ts`): anunciar promoção sem
 * desconto real na conta é pior do que não anunciar nada.
 */
export type ProductBadgeKind = "featured" | "new" | "bestseller";

const CONFIG: Record<
  ProductBadgeKind,
  {
    label: string;
    variant: "primary" | "accent" | "success";
    Icon: LucideIcon;
  }
> = {
  bestseller: { label: "Mais vendido", variant: "primary", Icon: TrendingUp },
  featured: { label: "Destaque", variant: "accent", Icon: Flame },
  new: { label: "Novidade", variant: "success", Icon: Sparkles },
};

/** Badge de produto reutilizável (mais vendido, destaque, novidade). */
export function ProductBadge({ kind }: { kind: ProductBadgeKind }) {
  const { label, variant, Icon } = CONFIG[kind];

  return (
    <Badge variant={variant}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
