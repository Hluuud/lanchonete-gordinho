import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

const EXPORTS: { resource: string; label: string; description: string }[] = [
  { resource: "orders", label: "Pedidos", description: "Últimos 30 dias, com itens." },
  { resource: "products", label: "Produtos", description: "Catálogo completo (todos, publicados ou não)." },
  { resource: "settings", label: "Configuração da loja", description: "Identidade, contato, horário, aparência." },
  { resource: "audit-logs", label: "Auditoria", description: "Histórico de ações administrativas." },
];

/**
 * Downloads simples via link com `download` — o navegador trata o
 * `Content-Disposition: attachment` da rota, sem precisar de JS/fetch para
 * disparar o arquivo. Ver `docs/backup.md` (o backup do banco em si é
 * responsabilidade do Supabase, isto aqui é exportação de dados de negócio).
 */
export function ExportDataSection() {
  return (
    <section className="flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">Exportar dados</h2>
        <p className="text-sm text-muted-foreground">
          Baixe seus dados para uso em planilhas ou contabilidade. O backup do banco em si é
          feito automaticamente pelo Supabase — isto aqui é para uso operacional, não recuperação
          de desastre.
        </p>
      </div>

      <div className="flex flex-col divide-y rounded-xl border bg-card">
        {EXPORTS.map((item) => (
          <div
            key={item.resource}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/admin/export?resource=${item.resource}&format=json`} download>
                  <Download className="size-3.5" aria-hidden />
                  JSON
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/admin/export?resource=${item.resource}&format=csv`} download>
                  <Download className="size-3.5" aria-hidden />
                  CSV
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
