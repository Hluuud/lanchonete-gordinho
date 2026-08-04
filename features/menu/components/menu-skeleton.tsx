import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading da loja, exibido pelo Suspense enquanto o cardápio
 * carrega. Espelha o shell de autoatendimento (sidebar escura + topbar +
 * hero + grade de cards grandes) para minimizar layout shift.
 */
export function MenuSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
      aria-hidden
    >
      {/* Sidebar (desktop/totem) */}
      <div className="sticky top-0 hidden h-dvh flex-col gap-4 border-r border-surface-dark-border bg-surface-dark px-5 pt-6 lg:flex">
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 rounded-full bg-white/10" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-3 w-20 bg-white/10" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-full bg-white/10" />
        <div className="mt-2 flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <div className="sticky top-0 z-30 border-b bg-background">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
            <Skeleton className="size-10 rounded-full lg:hidden" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="hidden h-3 w-28 sm:block" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="size-11 rounded-full" />
          </div>
        </div>

        {/* Hero */}
        <div className="bg-surface-dark px-4 py-10 lg:px-8 lg:py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-7 w-28 rounded-full bg-white/10" />
              <Skeleton className="h-12 w-full bg-white/10" />
              <Skeleton className="h-12 w-2/3 bg-white/10" />
              <Skeleton className="h-5 w-3/4 bg-white/10" />
              <Skeleton className="mt-2 h-12 w-48 rounded-full bg-white/10" />
            </div>
            <Skeleton className="aspect-4/5 w-full rounded-3xl bg-white/10 sm:aspect-video lg:aspect-square" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <Skeleton className="h-12 w-full rounded-full lg:hidden" />

          <div className="mt-4 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>

          {/* Grade de cards grandes */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="gap-0 border-transparent py-0 shadow-none">
                <Skeleton className="aspect-4/3 w-full rounded-none" />
                <div className="flex flex-col gap-2 p-4 sm:p-5">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="mt-2 flex items-center justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-11 w-32 rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
