import { Skeleton } from "@/components/ui/skeleton";
import { KITCHEN_BOARD_COLUMNS } from "@/lib/kitchen/order-status";

/** Skeleton do board — usado no `Suspense` da página enquanto o Server Component busca os pedidos. */
export function KitchenBoardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="size-11 rounded-md" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
        {KITCHEN_BOARD_COLUMNS.map((status) => (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col gap-3 sm:w-80"
          >
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
