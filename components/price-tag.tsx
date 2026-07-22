import { cn } from "@/lib/utils";
import { formatCentsToBRL } from "@/utils/format";

type PriceTagProps = {
  /** Preço em centavos (inteiro). */
  cents: number;
  className?: string;
};

/** Exibe um preço a partir de centavos, formatado em BRL. Reutilizável. */
export function PriceTag({ cents, className }: PriceTagProps) {
  return (
    <span className={cn("font-bold text-foreground tabular-nums", className)}>
      {formatCentsToBRL(cents)}
    </span>
  );
}
