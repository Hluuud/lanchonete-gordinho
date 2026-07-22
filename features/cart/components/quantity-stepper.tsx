import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  label: string;
  className?: string;
};

/** Stepper de quantidade reutilizável (carrinho, futuramente cards com qtd. inline). */
export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  label,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-input bg-background",
        className,
      )}
      role="group"
      aria-label={`Quantidade de ${label}`}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Diminuir quantidade de ${label}`}
        className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span
        className="w-5 text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Aumentar quantidade de ${label}`}
        className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
