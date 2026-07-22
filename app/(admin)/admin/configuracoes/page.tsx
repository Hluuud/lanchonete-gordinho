import { Settings } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Configurações" };

export default function AdminConfiguracoesPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Configurações"
      description="Configurações da loja (horário, taxas, identidade) chegam em uma próxima etapa."
    />
  );
}
