import { ComingSoon } from "@/features/admin/components/coming-soon";
import { LayoutDashboard } from "lucide-react";

export const metadata = { title: "Dashboard" };

/**
 * Placeholder do Dashboard — o guard de acesso (`requireRole`) já vive no
 * layout do grupo `(admin)`. Métricas reais entram na próxima etapa da
 * sprint (services já existentes, sem backend novo).
 */
export default function AdminHomePage() {
  return (
    <ComingSoon
      icon={LayoutDashboard}
      title="Dashboard"
      description="Métricas operacionais chegam na próxima etapa desta sprint."
    />
  );
}
