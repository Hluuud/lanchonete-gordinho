import { describe, expect, it } from "vitest";

import { brandAsset, resolveBrandAsset } from "@/lib/brand";

describe("resolveBrandAsset", () => {
  it("resolve o caminho público quando a fonte está configurada", () => {
    expect(
      resolveBrandAsset(
        {
          logo: "public/brand/logo.png",
          logoHorizontal: "public/brand/source-horizontal.png",
        },
        "horizontal",
      ),
    ).toBe("/brand/logo-horizontal.png");
  });

  it("volta null quando a fonte não foi configurada", () => {
    expect(
      resolveBrandAsset(
        { logo: "public/brand/logo.png", logoMono: null },
        "mono",
      ),
    ).toBeNull();
  });

  it("volta null quando a chave da fonte nem existe no objeto", () => {
    expect(
      resolveBrandAsset({ logo: "public/brand/logo.png" }, "watermark"),
    ).toBeNull();
  });
});

describe("brandAsset", () => {
  it("volta null para todas as variantes enquanto tokens.json não configurar fontes extras", () => {
    expect(brandAsset("horizontal")).toBeNull();
    expect(brandAsset("mono")).toBeNull();
    expect(brandAsset("watermark")).toBeNull();
  });
});
