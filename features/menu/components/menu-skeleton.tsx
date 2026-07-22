import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton loading da loja, exibido pelo Suspense enquanto o cardápio carrega. */
export function MenuSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden>
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 px-4 py-12 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3">
          <Skeleton className="h-4 w-32 bg-foreground/10" />
          <Skeleton className="h-11 w-72 bg-foreground/10" />
          <Skeleton className="h-5 w-56 bg-foreground/10" />
          <Skeleton className="mt-2 h-10 w-36 rounded-full bg-foreground/10" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-16">
        <Skeleton className="h-12 w-full rounded-full" />

        <div className="mt-4 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>

        <div className="mt-8 flex gap-2 py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-transparent shadow-none">
              <Skeleton className="aspect-5/4 w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="mt-2 flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="size-11 rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
