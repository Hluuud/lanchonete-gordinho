/**
 * Configuração de comportamento do carrinho (client).
 *
 * Constantes por ora; candidatas a configuração por tenant quando existir a
 * tabela de settings (ver BACKLOG.md).
 */

export type AddToCartFeedback = "toast" | "open-panel";

/**
 * Feedback ao adicionar um produto:
 * - "toast": notificação + pulso no contador do carrinho. Menos intrusivo —
 *   quem monta um pedido grande num totem não é interrompido a cada item.
 * - "open-panel": abre o painel do carrinho imediatamente (estilo drive-thru).
 */
export const ADD_TO_CART_FEEDBACK: AddToCartFeedback = "toast";
