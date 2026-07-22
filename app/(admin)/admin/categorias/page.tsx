import { Tags } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Categorias" };

export default function AdminCategoriasPage() {
  return (
    <ComingSoon
      icon={Tags}
      title="Categorias"
      description="Gestão de categorias do cardápio chega em uma próxima etapa."
    />
  );
}
