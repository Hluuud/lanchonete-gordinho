import Image from "next/image";

import { brandAsset } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LOGO_SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
} as const;

type BrandLogoSize = keyof typeof LOGO_SIZES;

/**
 * `"seal"` é o selo circular de sempre (`public/brand/logo.png`). `"horizontal"`
 * e `"mono"` pedem a variante gerada por `pnpm brand:assets` a partir de
 * `tokens.source` — enquanto essa fonte não existir (`brandAsset()` volta
 * `null`), o componente degrada para o selo, nunca quebra.
 */
type BrandLogoVariant = "seal" | "horizontal" | "mono" | "mascote";

/**
 * Logo oficial da marca. Fonte única para exibir a logo em sidebar, topbar e
 * telas de acompanhamento — nunca referenciar o arquivo diretamente fora
 * daqui.
 */
export function BrandLogo({
  size = "md",
  className,
  priority = false,
  variant = "seal",
}: {
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
  variant?: BrandLogoVariant;
}) {
  const px = LOGO_SIZES[size];

  if (variant === "mascote") {
    return (
      <Image
        src="/brand/mascote-avatar.png"
        alt="Gordinho, o mascote da Lanchonete do Gordinho"
        width={px}
        height={px}
        priority={priority}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  if (variant !== "seal") {
    const src = brandAsset(variant);
    if (src) {
      const width = variant === "horizontal" ? px * 3 : px;
      return (
        <Image
          src={src}
          alt="Logo da Lanchonete do Gordinho"
          width={width}
          height={px}
          priority={priority}
          className={cn("object-contain", className)}
        />
      );
    }
  }

  return (
    <Image
      src="/brand/logo.png"
      alt="Logo da Lanchonete do Gordinho"
      width={px}
      height={px}
      priority={priority}
      className={cn("rounded-full", className)}
    />
  );
}
