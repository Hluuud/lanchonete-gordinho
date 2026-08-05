"use client";

import { useRef } from "react";
import { ArrowRight, Clock } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";
import { HeroMedia } from "@/features/menu/components/hero-media";
import { StoreOpenBadge } from "@/features/menu/components/store-open-badge";
import { HERO_MEDIA, hasHeroMedia } from "@/features/menu/media";
import { scrollToSection } from "@/features/menu/scroll-to-section";

/** Deslocamento máximo do parallax, em px — sutil, não uma cortina se abrindo. */
const PARALLAX_RANGE_PX = 40;

/** Título quebrado em três para destacar o verbo em vermelho, como na fachada. */
const HERO_TITLE_PRE = "O hambúrguer que vai";
const HERO_TITLE_ACCENT = "conquistar";
const HERO_TITLE_POST = "o seu dia";
const HERO_SUBTITLE =
  "Feito na hora, com ingredientes de verdade — no capricho que só a Lanchonete do Gordinho tem.";

/**
 * Hero da Home (âncora `#home`, primeiro item de navegação), com dois
 * layouts conforme `HERO_MEDIA` tenha ou não material real:
 *
 * - **sem mídia** (hoje): split de sempre — texto à esquerda, `HeroMedia`
 *   num cartão à direita, mostrando o placeholder gráfico;
 * - **com mídia**: full-bleed cinematográfico — vídeo/pôster ocupa a seção
 *   inteira, texto sobreposto na base sobre um gradiente escuro, como um
 *   anúncio de hamburgueria.
 *
 * `hasHeroMedia()` decide o layout uma vez; `HeroMedia` decide, dentro
 * dele, se mostra vídeo ou pôster (`prefers-reduced-motion`).
 */
export function StoreHero({
  avgPrepMinutes,
}: {
  /** Tempo médio de preparo do cardápio, em minutos. `null` sem produtos. */
  avgPrepMinutes?: number | null;
} = {}) {
  const { setOpen } = useCart();
  const cinematic = hasHeroMedia(HERO_MEDIA);

  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReducedMotion ? 0 : PARALLAX_RANGE_PX],
  );

  const content = (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <StoreOpenBadge />
        {avgPrepMinutes != null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-surface-dark-foreground">
            <Clock className="size-3.5" aria-hidden />
            Tempo médio: {avgPrepMinutes} min
          </span>
        )}
      </div>

      <h1 className="font-display text-4xl leading-[0.95] tracking-tight text-balance uppercase sm:text-5xl lg:text-6xl">
        {HERO_TITLE_PRE}{" "}
        <span className="text-primary">{HERO_TITLE_ACCENT}</span>{" "}
        {HERO_TITLE_POST}
      </h1>

      <p className="max-w-md text-base text-surface-dark-muted lg:text-lg">
        {HERO_SUBTITLE}
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          className="rounded-full font-semibold"
          onClick={() => scrollToSection("cardapio")}
        >
          Ver Cardápio
          <ArrowRight className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-full border-white/25 bg-transparent font-semibold text-surface-dark-foreground hover:bg-white/10 hover:text-surface-dark-foreground"
          onClick={() => setOpen(true)}
        >
          Fazer Pedido
        </Button>
      </div>
    </div>
  );

  if (cinematic) {
    return (
      <section
        ref={sectionRef}
        id="home"
        className="relative isolate overflow-hidden bg-surface-dark text-surface-dark-foreground lg:scroll-mt-20"
      >
        {/* `-inset-y-10` dá respiro pro deslocamento do parallax não expor a
            borda da mídia — `PARALLAX_RANGE_PX` (40) cabe folgado nos 2.5rem. */}
        <motion.div
          className="absolute inset-x-0 -inset-y-10"
          style={{ y: mediaY }}
        >
          <HeroMedia
            media={HERO_MEDIA}
            className="absolute inset-0 rounded-none"
          />
        </motion.div>
        {/* Gradiente de legibilidade: o véu de `HeroMedia` é uniforme, este
            concentra o escurecimento na base, onde o texto fica. */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/50 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex min-h-[34rem] w-full max-w-6xl flex-col justify-end px-4 py-10 lg:min-h-[38rem] lg:px-8 lg:py-16">
          {content}
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-surface-dark text-surface-dark-foreground lg:scroll-mt-20"
    >
      {/* Brilho quente atrás do texto — dá profundidade sem competir com a foto. */}
      <div
        className="pointer-events-none absolute -top-1/3 -left-1/4 -z-10 size-[36rem] rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-16">
        {content}

        <HeroMedia
          media={HERO_MEDIA}
          className="aspect-4/5 w-full sm:aspect-video lg:aspect-square"
        />
      </div>
    </section>
  );
}
