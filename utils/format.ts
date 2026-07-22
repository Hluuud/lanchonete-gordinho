/**
 * Utilitários de formatação (puros, sem dependências de UI/dados).
 *
 * Regra do projeto: dinheiro é sempre armazenado e transportado como
 * inteiro em centavos. A conversão para exibição acontece só na borda de UI.
 */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Converte centavos (inteiro) para string em Reais (ex.: 1990 -> "R$ 19,90"). */
export function formatCentsToBRL(cents: number): string {
  return BRL.format(cents / 100);
}

/** Formata minutos em rótulo curto de tempo estimado (ex.: 20 -> "20 min"). */
export function formatMinutes(minutes: number): string {
  return `${minutes} min`;
}
