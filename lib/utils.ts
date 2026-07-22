import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionais (clsx) resolvendo conflitos do Tailwind (twMerge).
 * Base do design system — usado por todos os componentes de UI.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
