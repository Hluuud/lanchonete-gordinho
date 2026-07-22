import type { LucideIcon } from "lucide-react";

/** Placeholder elegante para páginas administrativas ainda não implementadas. */
export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-7" aria-hidden />
      </span>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <span className="mt-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        Em breve
      </span>
    </div>
  );
}
