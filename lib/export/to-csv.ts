/**
 * Converte um array de objetos "achatados" em CSV — sem dependência nova
 * (os dados exportados são sempre simples/tabulares o suficiente). Campos
 * aninhados (objetos/arrays, ex. itens de um pedido) viram JSON dentro da
 * própria célula em vez de colunas separadas — mantém uma linha por
 * registro, mais previsível para abrir numa planilha.
 */
export function toCsv<T extends object>(rows: T[]): string {
  if (rows.length === 0) return "";

  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) headerSet.add(key);
  }
  const headers = Array.from(headerSet);

  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    const record = row as Record<string, unknown>;
    lines.push(headers.map((header) => escapeCsvCell(record[header])).join(","));
  }
  return lines.join("\n");
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}
