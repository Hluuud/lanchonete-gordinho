import { Flame, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export type ProductBadgeKind = "featured" | "new";

const CONFIG: Record<
  ProductBadgeKind,
  { label: string; variant: "primary" | "accent"; Icon: typeof Flame }
> = {
  featured: { label: "Destaque", variant: "primary", Icon: Flame },
  new: { label: "Novidade", variant: "accent", Icon: Sparkles },
};

/** Badge de produto reutilizável (destaque, novidade, ...). */
export function ProductBadge({ kind }: { kind: ProductBadgeKind }) {
  const { label, variant, Icon } = CONFIG[kind];

  return (
    <Badge variant={variant}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
