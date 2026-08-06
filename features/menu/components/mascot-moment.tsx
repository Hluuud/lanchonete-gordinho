import Image from "next/image";

import { MASCOT_POSES, type MascotPoseName } from "@/features/menu/mascot-poses";
import { cn } from "@/lib/utils";

/**
 * Momento do mascote: uma pose do Gordinho + uma mensagem curta, para os
 * pontos da área do cliente listados na Sprint 8.1 (carrinho vazio, loja
 * fechada, banner de promoções, Sobre Nós). Todos fora do fluxo de
 * checkout, que está fora de escopo desta sprint.
 */
const MESSAGE_TONE = {
  light: "text-muted-foreground",
  dark: "text-surface-dark-muted",
} as const;

export function MascotMoment({
  pose,
  message,
  className,
  tone = "light",
}: {
  pose: MascotPoseName;
  message: string;
  className?: string;
  /** Superfície onde o momento está montado: `"light"` (creme, padrão — carrinho
   * vazio, promoções, Sobre Nós) ou `"dark"` (hero sobre `bg-surface-dark`). */
  tone?: "light" | "dark";
}) {
  const { src, alt } = MASCOT_POSES[pose];

  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <Image src={src} alt={alt} width={160} height={200} className="h-auto w-32 object-contain" />
      <p className={cn("max-w-xs text-sm font-medium", MESSAGE_TONE[tone])}>{message}</p>
    </div>
  );
}
