"use client";

import { usePathname, useSearchParams } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/** Paginação server-side reutilizada por toda listagem administrativa — preserva `q`/`sort`/`order` da URL. */
export function AdminListPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  function hrefForPage(target: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(target));
    return `${pathname}?${params.toString()}`;
  }

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hasPrevious ? hrefForPage(page - 1) : undefined}
            aria-disabled={!hasPrevious}
            className={!hasPrevious ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-3 text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={hasNext ? hrefForPage(page + 1) : undefined}
            aria-disabled={!hasNext}
            className={!hasNext ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
