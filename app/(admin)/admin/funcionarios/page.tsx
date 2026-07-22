import { UserCog } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Funcionários" };

export default function AdminFuncionariosPage() {
  return (
    <ComingSoon
      icon={UserCog}
      title="Funcionários"
      description="Gestão de equipe e permissões chega em uma próxima etapa."
    />
  );
}
