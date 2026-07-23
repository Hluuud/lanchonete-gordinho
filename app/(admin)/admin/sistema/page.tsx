import { Database, ExternalLink, HardDrive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RealtimeStatusCard } from "@/features/admin/system-status/components/realtime-status-card";
import { StatusCard } from "@/features/admin/system-status/components/status-card";
import { env } from "@/lib/env";
import { getAdminSystemStatus } from "@/services/admin/system-status.service";

export const metadata = { title: "Sistema" };

function supabaseDashboardUrl(): string {
  const projectRef = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
  return `https://supabase.com/dashboard/project/${projectRef}`;
}

/**
 * Painel de Status (Sprint 5.5, Fase 5) — só sinais reais de
 * conectividade (banco, Storage, Realtime). Nenhum gráfico de CPU/memória
 * fabricado: não existe processo próprio para medir isso em serverless, e
 * os dashboards nativos da Vercel/Supabase já fazem isso melhor.
 */
export default async function AdminSistemaPage() {
  const status = await getAdminSystemStatus();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatusCard
          icon={Database}
          label="Banco de dados"
          ok={status.database.ok}
          detail={status.database.error}
        />
        <StatusCard
          icon={HardDrive}
          label="Armazenamento (Storage)"
          ok={status.storage.ok}
          detail={status.storage.error}
        />
        <RealtimeStatusCard />
      </div>

      <p className="text-xs text-muted-foreground">
        Última checagem: {new Date(status.checkedAt).toLocaleString("pt-BR")}
      </p>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold">Métricas de infraestrutura</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          CPU, memória e latência de execução ficam nos dashboards nativos — mais completos e em
          tempo real do que qualquer coisa reconstruída aqui.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">
              Vercel
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={supabaseDashboardUrl()} target="_blank" rel="noreferrer">
              Supabase
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
