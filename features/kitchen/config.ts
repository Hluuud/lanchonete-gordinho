/**
 * Configuração visual do Painel da Cozinha (client).
 */

/**
 * Pedidos "Finalizado" (delivered) somem do board depois desse tempo —
 * puramente visual, para não acumular cartões de pedidos já entregues numa
 * tela pensada para operação contínua em pico. A ação real de completar o
 * pedido (`delivered` -> `completed`) continua manual, via botão "Finalizar".
 */
export const KITCHEN_DONE_AUTOHIDE_MS = 5 * 60_000;

/** Faixas de urgência do tempo de espera (minutos), usadas para colorir o cartão. */
export const KITCHEN_URGENCY_THRESHOLDS_MIN = {
  warning: 10,
  critical: 20,
} as const;
