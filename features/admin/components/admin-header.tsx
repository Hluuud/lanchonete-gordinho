"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_ITEMS } from "@/features/admin/nav";
import { ADMIN_ROLE_LABELS } from "@/features/admin/role-labels";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database.types";

/**
 * Cabeçalho do Painel Administrativo: título da página atual + usuário
 * logado. No mobile, também assume a navegação (pills horizontais) já que a
 * `AdminSidebar` fica oculta abaixo de `md`.
 */
export function AdminHeader({
  userName,
  userRole,
}: {
  userName: string;
  userRole: UserRole;
}) {
  const pathname = usePathname();
  const current = ADMIN_NAV_ITEMS.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-20 border-b bg-card">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <h1 className="truncate text-lg font-bold">
          {current?.label ?? "Painel Administrativo"}
        </h1>
        <div className="text-right">
          <p className="truncate text-sm font-semibold">{userName}</p>
          <p className="text-xs text-muted-foreground">
            {ADMIN_ROLE_LABELS[userRole]}
          </p>
        </div>
      </div>

      <nav
        aria-label="Navegação administrativa"
        className="flex gap-2 overflow-x-auto border-t px-4 py-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-foreground",
              )}
            >
              <item.icon className="size-3.5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
