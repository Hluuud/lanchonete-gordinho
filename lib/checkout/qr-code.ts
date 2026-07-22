import "server-only";

import QRCode from "qrcode";

/**
 * Gera o QR Code do link de acompanhamento como data URL (PNG), no servidor.
 * Desacoplado da UI de propósito: a mesma função pode futuramente alimentar
 * impressão térmica (trocando `toDataURL` por `toBuffer`), sem tocar nos
 * componentes que a consomem.
 */
export async function generateTrackingQrCodeDataUrl(
  url: string,
): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 240 });
}
