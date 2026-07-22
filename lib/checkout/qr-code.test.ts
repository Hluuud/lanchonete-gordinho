import { describe, expect, it } from "vitest";

import { generateTrackingQrCodeDataUrl } from "@/lib/checkout/qr-code";

describe("generateTrackingQrCodeDataUrl", () => {
  it("gera uma data URL de imagem PNG válida", async () => {
    const dataUrl = await generateTrackingQrCodeDataUrl(
      "https://gordinho.example/pedido/123",
    );
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});
