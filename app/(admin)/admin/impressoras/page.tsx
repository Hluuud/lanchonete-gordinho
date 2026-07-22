import { Printer } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Impressoras" };

export default function AdminImpressorasPage() {
  return (
    <ComingSoon
      icon={Printer}
      title="Impressoras"
      description="Gestão de impressoras e impressão automática chega na Fase 3 do roadmap."
    />
  );
}
