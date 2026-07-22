"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Barra de busca + ação "Novo" reutilizada por toda listagem administrativa
 * paginada. A busca atualiza `?q=` na URL (server-side, via
 * `features/admin/pagination.ts`) — nunca filtra client-side.
 */
export function AdminListToolbar({
  searchPlaceholder = "Buscar...",
  onCreate,
  createLabel,
}: {
  searchPlaceholder?: string;
  onCreate?: () => void;
  createLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const updateQuery = useDebouncedCallback((q: string) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, SEARCH_DEBOUNCE_MS);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:w-72">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            updateQuery(event.target.value);
          }}
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label="Buscar"
        />
      </div>

      {onCreate && createLabel && (
        <Button type="button" onClick={onCreate}>
          <Plus className="size-4" aria-hidden />
          {createLabel}
        </Button>
      )}
    </div>
  );
}
