import { ClipboardList } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Pedidos" };

export default function AdminPedidosPage() {
  return (
    <ComingSoon
      icon={ClipboardList}
      title="Pedidos"
      description="A lista de pedidos ativos chega na próxima etapa desta sprint."
    />
  );
}
