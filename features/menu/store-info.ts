import type { Menu } from "@/types/domain";

/**
 * Horário de funcionamento e informações operacionais da loja.
 *
 * Configuração real do estabelecimento mantida no client por ora — o banco
 * ainda não tem tabela de horários por tenant (ver BACKLOG.md). Quando
 * existir, `getStoreOpenState` permanece e só a fonte muda.
 */

/** Janela de um dia em "HH:MM" locais. `close` menor que `open` cruza a meia-noite. */
export type DayHours = { open: string; close: string } | null;

/** Índice = `Date#getDay()` (0 = domingo). `null` = fechado o dia todo. */
export const BUSINESS_HOURS: Record<number, DayHours> = {
  0: { open: "18:00", close: "23:00" },
  1: null,
  2: { open: "18:00", close: "23:00" },
  3: { open: "18:00", close: "23:00" },
  4: { open: "18:00", close: "23:00" },
  5: { open: "18:00", close: "23:30" },
  6: { open: "18:00", close: "23:30" },
};

export type StoreOpenState = {
  isOpen: boolean;
  /** Texto pronto para a UI: "Aberto até 23:00" / "Abre às 18:00" / "Fechado hoje". */
  label: string;
};

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getStoreOpenState(
  now: Date,
  hours: Record<number, DayHours> = BUSINESS_HOURS,
): StoreOpenState {
  const day = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const today = hours[day];
  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    const crossesMidnight = close <= open;

    const isOpenNow = crossesMidnight
      ? nowMinutes >= open || nowMinutes < close
      : nowMinutes >= open && nowMinutes < close;

    if (isOpenNow) return { isOpen: true, label: `Aberto até ${today.close}` };
    if (nowMinutes < open) {
      return { isOpen: false, label: `Abre às ${today.open}` };
    }
  }

  // Madrugada de um dia cujo horário da véspera cruza a meia-noite.
  const yesterday = hours[(day + 6) % 7];
  if (yesterday && toMinutes(yesterday.close) <= toMinutes(yesterday.open)) {
    if (nowMinutes < toMinutes(yesterday.close)) {
      return { isOpen: true, label: `Aberto até ${yesterday.close}` };
    }
  }

  return { isOpen: false, label: "Fechado hoje" };
}

/**
 * Tempo médio de preparo do cardápio (produtos disponíveis), arredondado ao
 * múltiplo de 5 mais próximo — exibido na barra superior como expectativa
 * geral, não promessa por pedido.
 */
export function getAverageMenuPrepTimeMinutes(menu: Menu): number | null {
  const prepTimes = menu.categories
    .flatMap((category) => category.products)
    .filter((product) => product.isAvailable && product.prepTimeMinutes > 0)
    .map((product) => product.prepTimeMinutes);

  if (prepTimes.length === 0) return null;

  const average = prepTimes.reduce((sum, t) => sum + t, 0) / prepTimes.length;
  return Math.max(5, Math.round(average / 5) * 5);
}
