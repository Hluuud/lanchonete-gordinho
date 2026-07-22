import { BarChart3 } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Relatórios" };

export default function AdminRelatoriosPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Relatórios"
      description="Relatórios operacionais e financeiros chegam em uma próxima etapa."
    />
  );
}
