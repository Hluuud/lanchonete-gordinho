import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Administração" };

/**
 * Stub do Painel Administrativo (Fase 5). Estabelece o route group protegido:
 * `requireRole` bloqueia acesso sem sessão/papel adequado. As telas reais
 * (dashboards, relatórios) entram na Fase 5.
 */
export default async function AdminHomePage() {
  const user = await requireRole(["super_admin", "owner", "manager"]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>
      <p className="mt-2 text-muted-foreground">
        Bem-vindo, {user.fullName ?? "gestor"}. Área protegida — dashboards e
        relatórios chegam na Fase 5.
      </p>
    </main>
  );
}
