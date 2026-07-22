import { KITCHEN_URGENCY_THRESHOLDS_MIN } from "@/features/kitchen/config";

export type KitchenUrgency = "normal" | "warning" | "critical";

/** Classifica a urgência pelo tempo de espera (minutos) — colore o cartão na tela da cozinha. */
export function getUrgencyFromMinutes(elapsedMinutes: number): KitchenUrgency {
  if (elapsedMinutes >= KITCHEN_URGENCY_THRESHOLDS_MIN.critical) return "critical";
  if (elapsedMinutes >= KITCHEN_URGENCY_THRESHOLDS_MIN.warning) return "warning";
  return "normal";
}
