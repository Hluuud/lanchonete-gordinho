import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading da loja, exibido pelo Suspense enquanto o cardápio
 * carrega. Espelha o shell de autoatendimento (sidebar + topbar + banner +
 * grade de cards grandes) para minimizar layout shift.
 */
export function MenuSkeleton() {
  return (
    <div
      className="flex flex-1 flex-col lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
      aria-hidden
    >
      {/* Sidebar (desktop/totem) */}
      <div className="sticky top-0 hidden h-dvh flex-col gap-4 border-r bg-card px-5 pt-6 lg:flex">
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="mt-2 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
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

        <div className="mx-auto w-full max-w-6xl px-4 py-4 pb-24">
          <Skeleton className="h-12 w-full rounded-full lg:hidden" />

          <div className="mt-4 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>

          {/* Banner */}
          <Skeleton className="mt-6 aspect-16/9 w-full rounded-3xl sm:aspect-21/9 xl:aspect-3/1" />

          {/* Grade de cards grandes */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="gap-0 border-transparent py-0 shadow-none">
                <Skeleton className="aspect-5/4 w-full rounded-none" />
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
