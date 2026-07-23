"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type DayHours = { open: string; close: string } | null;
type BusinessHoursValue = Record<string, DayHours>;

const DAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const DEFAULT_HOURS: DayHours = { open: "18:00", close: "23:00" };

/** Editor de horário de funcionamento por dia — chaves "0".."6" (`Date#getDay()`, 0 = domingo). */
export function BusinessHoursEditor({
  value,
  onChange,
}: {
  value: BusinessHoursValue;
  onChange: (value: BusinessHoursValue) => void;
}) {
  function setDay(day: number, hours: DayHours) {
    onChange({ ...value, [String(day)]: hours });
  }

  return (
    <div className="flex flex-col gap-2">
      {DAY_LABELS.map((label, day) => {
        const hours = value[String(day)] ?? null;
        const isOpen = hours !== null;

        return (
          <div key={day} className="flex items-center gap-3 rounded-lg border p-2.5">
            <Switch
              checked={isOpen}
              onCheckedChange={(checked) => setDay(day, checked ? DEFAULT_HOURS : null)}
              aria-label={`${label} — aberto`}
            />
            <span className="w-20 shrink-0 text-sm">{label}</span>
            {isOpen ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="time"
                  value={hours.open}
                  onChange={(event) => setDay(day, { ...hours, open: event.target.value })}
                  className="w-28"
                />
                <span className="text-xs text-muted-foreground">até</span>
                <Input
                  type="time"
                  value={hours.close}
                  onChange={(event) => setDay(day, { ...hours, close: event.target.value })}
                  className="w-28"
                />
              </div>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">Fechado</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
