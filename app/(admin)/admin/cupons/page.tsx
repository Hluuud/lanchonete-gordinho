import { TicketPercent } from "lucide-react";

import { ComingSoon } from "@/features/admin/components/coming-soon";

export const metadata = { title: "Cupons" };

export default function AdminCuponsPage() {
  return (
    <ComingSoon
      icon={TicketPercent}
      title="Cupons"
      description="Gestão de cupons e promoções chega em uma próxima etapa."
    />
  );
}
