import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/** `ok: null` = ainda verificando (ex. Realtime conectando). */
export function StatusCard({
  icon: Icon,
  label,
  ok,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  ok: boolean | null;
  detail?: string;
}) {
  const variant = ok === null ? "outline" : ok ? "success" : "warning";
  const text = ok === null ? "Verificando..." : ok ? "Operacional" : "Indisponível";

  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-1">
          <Badge variant={variant}>{text}</Badge>
        </div>
        {detail && <p className="mt-1.5 truncate text-xs text-muted-foreground" title={detail}>{detail}</p>}
      </div>
    </div>
  );
}
