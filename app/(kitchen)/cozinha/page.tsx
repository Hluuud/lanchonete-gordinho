import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Cozinha" };

/**
 * Stub do Painel da Cozinha (Fase 2). Estabelece o route group protegido.
 * O Kanban de pedidos em tempo real (Supabase Realtime) entra na Fase 2.
 */
export default async function KitchenHomePage() {
  const user = await requireRole([
    "super_admin",
    "owner",
    "manager",
    "kitchen",
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">Painel da Cozinha</h1>
      <p className="mt-2 text-muted-foreground">
        Olá, {user.fullName ?? "equipe"}. Área protegida — o painel de pedidos
        em tempo real chega na Fase 2.
      </p>
    </main>
  );
}
