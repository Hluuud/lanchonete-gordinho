import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Estado vazio genérico (carrinho vazio, sem resultados de busca, erro,
 * offline, produto indisponível...). Um único visual consistente para todos.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-xs text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
