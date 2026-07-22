import { Users } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Clientes" };

export default function AdminClientesPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Clientes"
      description="Cadastro e histórico de clientes chegam em uma próxima etapa."
    />
  );
}
