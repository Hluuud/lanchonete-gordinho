import { Skeleton } from "@/components/ui/skeleton";
import { KITCHEN_VISUAL_COLUMNS } from "@/lib/kitchen/board-columns";

/** Skeleton do board — usado no `Suspense` da página enquanto o Server Component busca os pedidos. */
export function KitchenBoardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      {/* Já dentro do escopo `.dark` de app/(kitchen)/layout.tsx. */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="size-11 rounded-md" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="flex flex-1 gap-4">
        {KITCHEN_VISUAL_COLUMNS.map((column) => (
          <div key={column.id} className="flex min-w-0 flex-1 flex-col gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
