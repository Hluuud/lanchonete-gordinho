/**
 * Paginação/busca/ordenação server-side, compartilhada por toda listagem
 * administrativa (Categorias, Produtos, Adicionais, Combos...). As páginas
 * (Server Components) leem `searchParams`, chamam `parseListParams` (puro,
 * testável) e repassam o resultado para o service — nenhuma lista usa
 * paginação client-side.
 */

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export type SortOrder = "asc" | "desc";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ListParams = {
  page: number;
  pageSize: number;
  /** Termo de busca livre (nome/SKU/etc. — cada service decide os campos). */
  q: string;
  sort: string;
  order: SortOrder;
};

export type ListParamsOptions = {
  /** Colunas de ordenação aceitas — protege contra `sort` arbitrário virar SQL. */
  allowedSort: readonly string[];
  defaultSort: string;
  defaultOrder?: SortOrder;
  pageSize?: number;
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Extrai e valida page/pageSize/busca/ordenação de `searchParams` — nunca lança, sempre cai num valor seguro. */
export function parseListParams(
  searchParams: RawSearchParams,
  { allowedSort, defaultSort, defaultOrder = "asc", pageSize = DEFAULT_PAGE_SIZE }: ListParamsOptions,
): ListParams {
  const rawPage = Number.parseInt(firstValue(searchParams.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawPageSize = Number.parseInt(firstValue(searchParams.pageSize), 10);
  const resolvedPageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, MAX_PAGE_SIZE)
      : pageSize;

  const q = firstValue(searchParams.q).trim();

  const rawSort = firstValue(searchParams.sort);
  const sort = allowedSort.includes(rawSort) ? rawSort : defaultSort;

  const rawOrder = firstValue(searchParams.order);
  const order: SortOrder = rawOrder === "asc" || rawOrder === "desc" ? rawOrder : defaultOrder;

  return { page, pageSize: resolvedPageSize, q, sort, order };
}

/** Intervalo `[from, to]` (inclusivo) para `SupabaseQuery#range()`. */
export function getPageRange(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return [from, to];
}

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function buildPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
