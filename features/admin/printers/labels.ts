import {
  PRINTER_CONNECTION_TYPES,
  PRINTER_ROLES,
} from "@/features/admin/printers/schema";

/** Rótulos pt-BR — compartilhados entre o formulário e a tabela. */
export const PRINTER_ROLE_LABELS: Record<(typeof PRINTER_ROLES)[number], string> = {
  kitchen: "Cozinha",
  cashier: "Caixa",
  counter: "Balcão",
};

export const PRINTER_CONNECTION_LABELS: Record<
  (typeof PRINTER_CONNECTION_TYPES)[number],
  string
> = {
  usb: "USB",
  network: "Rede (IP)",
  bluetooth: "Bluetooth",
};
