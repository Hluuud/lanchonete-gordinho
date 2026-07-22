import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SIZES = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
} as const;

type BrandLogoSize = keyof typeof LOGO_SIZES;

/**
 * Logo oficial da marca (public/brand/logo.png). Fonte única para exibir a
 * logo em sidebar, topbar e telas de acompanhamento — nunca referenciar o
 * arquivo diretamente fora daqui.
 */
export function BrandLogo({
  size = "md",
  className,
  priority = false,
}: {
  size?: BrandLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const px = LOGO_SIZES[size];

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
