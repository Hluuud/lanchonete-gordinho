import type { AdminHourlyOrderCount } from "@/types/domain";

/**
 * Distribuição de pedidos por hora do dia — barras em CSS puro (sem lib de
 * gráfico: 24 barras não justificam uma dependência nova para o projeto).
 */
export function HourlyOrdersChart({
  hourlyCounts,
  peakHour,
  ordersPerHour,
  windowDays,
}: {
  hourlyCounts: AdminHourlyOrderCount[];
  peakHour: number | null;
  ordersPerHour: number;
  windowDays: number;
}) {
  const maxCount = Math.max(1, ...hourlyCounts.map((h) => h.count));

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Pedidos por horário</h2>
          <p className="text-xs text-muted-foreground">
            Últimos {windowDays} dias
            {peakHour !== null && ` — pico às ${String(peakHour).padStart(2, "0")}h`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold tabular-nums">{ordersPerHour}</p>
          <p className="text-[11px] text-muted-foreground">pedidos/hora ativa</p>
        </div>
      </div>

      {hourlyCounts.every((h) => h.count === 0) ? (
        <p className="text-sm text-muted-foreground">Sem pedidos no período.</p>
      ) : (
        <div className="flex h-32 items-end gap-1" role="img" aria-label="Distribuição de pedidos por hora do dia">
          {hourlyCounts.map((entry) => (
            <div
              key={entry.hour}
              className="group relative flex flex-1 flex-col items-center justify-end"
            >
              <div
                className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
                style={{ height: `${(entry.count / maxCount) * 100}%`, minHeight: entry.count > 0 ? 2 : 0 }}
                title={`${String(entry.hour).padStart(2, "0")}h — ${entry.count} pedido(s)`}
              />
              {entry.hour % 6 === 0 && (
                <span className="mt-1 text-[10px] text-muted-foreground">
                  {String(entry.hour).padStart(2, "0")}h
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
