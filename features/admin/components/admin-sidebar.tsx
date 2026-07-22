"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { ADMIN_NAV_ITEMS } from "@/features/admin/nav";
import { cn } from "@/lib/utils";

/** Menu lateral do Painel Administrativo (`md+`) — no mobile, `AdminHeader` assume a navegação. */
export function AdminSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <BrandLogo size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{tenantName}</p>
          <p className="text-xs text-muted-foreground">Painel administrativo</p>
        </div>
      </div>

      <nav
        aria-label="Navegação administrativa"
        className="flex-1 overflow-y-auto px-3 pb-6"
      >
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  <item.icon className="size-5" aria-hidden />
                  <span className="flex-1 truncate">{item.label}</span>
                  {!item.ready && (
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 rounded-full",
                        isActive ? "bg-primary-foreground/60" : "bg-muted-foreground/50",
                      )}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
