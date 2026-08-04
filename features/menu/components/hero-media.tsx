"use client";

import Image from "next/image";
import { Sandwich } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Painel de mídia do Hero, em três estados degradando com elegância:
 *
 * 1. vídeo em autoplay mudo (o material real da loja);
 * 2. só o pôster — é o que recebe quem pediu `prefers-reduced-motion`, e
 *    também o caso de existir foto mas ainda não vídeo;
 * 3. placeholder gráfico, enquanto nenhum dos dois existir.
 *
 * O vídeo é sempre `muted` + `playsInline`: sem isso o autoplay é bloqueado
 * pelos navegadores (e no iOS ele abriria em tela cheia).
 */
export function HeroMedia({
  videoUrl,
  posterUrl,
  className,
}: {
  videoUrl?: string | null;
  posterUrl?: string | null;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const showVideo = Boolean(videoUrl) && !prefersReducedMotion;

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary/80 via-surface-dark to-surface-dark ring-1 ring-white/10",
        className,
      )}
    >
      {showVideo ? (
        <video
          src={videoUrl ?? undefined}
          poster={posterUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
      ) : posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Sandwich
            className="size-24 text-white/25 lg:size-32"
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
