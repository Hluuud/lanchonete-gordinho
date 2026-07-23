import "server-only";

import { headers } from "next/headers";

export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Lê o request id gerado por `proxy.ts` para a requisição atual — mesmo
 * valor usado para correlacionar logs estruturados e eventos do Sentry
 * dessa requisição (ver `docs/observability.md`).
 */
export async function getRequestId(): Promise<string | null> {
  const headerList = await headers();
  return headerList.get(REQUEST_ID_HEADER);
}
