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

/**
 * Formata o tempo decorrido desde `since` em rótulo curto pt-BR
 * (ex.: "agora", "8 min", "1h 12min"). Usado pelos timers do Painel da
 * Cozinha — puro (recebe `now` para ser testável sem mockar relógio global).
 */
export function formatElapsedTime(
  since: string | Date,
  now = new Date(),
): string {
  const sinceMs =
    typeof since === "string" ? new Date(since).getTime() : since.getTime();
  const elapsedMs = Math.max(0, now.getTime() - sinceMs);
  const totalMinutes = Math.floor(elapsedMs / 60_000);

  if (totalMinutes < 1) return "agora";
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}min`;
}
