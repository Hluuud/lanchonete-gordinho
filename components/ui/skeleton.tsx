import * as React from "react";

import { cn } from "@/lib/utils";

/** Placeholder animado para estados de carregamento (skeleton loading). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden
      {...props}
    />
  );
}

export { Skeleton };
