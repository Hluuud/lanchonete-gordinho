/**
 * Mapeia o `errcode` levantado por `create_order` (Postgres) para uma
 * mensagem de negócio em PT-BR. Extraído de `checkout.service.ts` para ser
 * puro e sem dependência do client Supabase/env — o service em si não é
 * unit-testável isoladamente hoje (ver `docs/conventions.md`), mas essa
 * função é, e é aqui que a lógica de negócio real desse mapeamento mora.
 */
export function mapOrderCreationErrorMessage(code: string): string {
  switch (code) {
    case "P0001":
      return "O pedido precisa ter pelo menos um item.";
    case "P0002":
      return "Um dos produtos do pedido não está mais disponível.";
    case "P0003":
      return "Quantidade inválida para um dos itens.";
    default:
      return "Não foi possível criar o pedido. Tente novamente.";
  }
}
