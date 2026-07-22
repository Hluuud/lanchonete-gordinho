import { UtensilsCrossed } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Produtos" };

export default function AdminProdutosPage() {
  return (
    <ComingSoon
      icon={UtensilsCrossed}
      title="Produtos"
      description="A listagem do cardápio chega na próxima etapa desta sprint."
    />
  );
}
