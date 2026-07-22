import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/admin/roles";
import { resolveTenantSlug } from "@/lib/tenant/get-tenant-context";
import { getTenantBySlug } from "@/services/tenant.service";

/**
 * Shell do Painel Administrativo: guarda de acesso único para todas as
 * subpáginas (antes vivia em `admin/page.tsx`), identidade visual própria
 * (`.theme-admin`, ver ADR 0007) e navegação (sidebar desktop / pills mobile).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(ADMIN_ROLES);
  const slug = await resolveTenantSlug();
  const tenant = await getTenantBySlug(slug);

  return (
    <div className="theme-admin flex min-h-dvh bg-background text-foreground">
      <AdminSidebar tenantName={tenant?.name ?? "Painel Administrativo"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          userName={user.fullName ?? user.email ?? "Gestor"}
          userRole={user.role}
        />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
