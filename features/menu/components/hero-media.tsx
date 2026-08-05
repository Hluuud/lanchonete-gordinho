"use client";

import Image from "next/image";
import { Sandwich } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { resolveHeroMedia, type HeroMediaConfig } from "@/features/menu/media";

/**
 * Painel de mídia do Hero, em três estados degradando com elegância:
 *
 * 1. vídeo em autoplay mudo, com todas as fontes de `media.sources` (o
 *    browser escolhe a primeira que sabe decodificar — WebM antes de MP4);
 * 2. só o pôster — é o que recebe quem pediu `prefers-reduced-motion`, e
 *    também o caso de existir foto mas ainda não vídeo. `posterMobile`, se
 *    houver, substitui o pôster em telas estreitas;
 * 3. placeholder gráfico, enquanto nenhum dos dois existir.
 *
 * O vídeo é sempre `muted` + `playsInline`: sem isso o autoplay é bloqueado
 * pelos navegadores (e no iOS ele abriria em tela cheia).
 */
export function HeroMedia({
  media,
  className,
}: {
  media: HeroMediaConfig;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const state = resolveHeroMedia(media, Boolean(prefersReducedMotion));

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary/80 via-surface-dark to-surface-dark ring-1 ring-white/10",
        className,
      )}
    >
      {state === "video" ? (
        <video
          poster={media.poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="size-full object-cover"
        >
          {media.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      ) : state === "poster" ? (
        <>
          <Image
            src={(media.posterMobile ?? media.poster) as string}
            alt=""
            fill
            sizes="100vw"
            className={cn("object-cover", media.posterMobile && "lg:hidden")}
            priority
          />
          {media.posterMobile && (
            <Image
              src={media.poster as string}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="hidden object-cover lg:block"
              priority
            />
          )}
        </>
      ) : (
        <div className="flex size-full items-center justify-center">
          <Sandwich
            className="size-24 text-white/25 lg:size-32"
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      )}

      {state !== "placeholder" && media.overlayOpacity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: media.overlayOpacity }}
          aria-hidden
        />
      )}
    </div>
  );
}
