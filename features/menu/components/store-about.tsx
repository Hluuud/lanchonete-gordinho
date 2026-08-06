import Image from "next/image";
import { Flame, Quote, Store } from "lucide-react";

import {
  ABOUT_MISSION,
  ABOUT_STORY,
  ABOUT_VALUES,
  ABOUT_TIMELINE,
  hasTimeline,
  sortAboutTimeline,
  WHY_US,
} from "@/features/menu/about-content";
import { Reveal } from "@/features/menu/components/reveal";
import { MascotMoment } from "@/features/menu/components/mascot-moment";
import { GALLERY_ITEMS } from "@/features/menu/gallery";

/** Primeira foto de cada categoria na galeria, se houver — senão o placeholder gráfico de sempre. */
const facadePhoto = GALLERY_ITEMS.find((item) => item.category === "fachada");
const ambiencePhoto = GALLERY_ITEMS.find(
  (item) => item.category === "ambiente",
);

/**
 * Seção institucional (`#sobre`): história, missão, valores, "por que
 * escolher" e — só quando houver marcos reais registrados
 * (`about-content.ts`) — uma linha do tempo. Duas fotos (fachada/ambiente)
 * vêm da galeria quando existirem; sem elas, os mesmos placeholders
 * gráficos de sempre.
 */
export function StoreAbout() {
  const timeline = sortAboutTimeline(ABOUT_TIMELINE);

  return (
    <section
      id="sobre"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col gap-6">
          <div>
            <span
              className="block h-1.5 w-16 rounded-full bg-primary"
              aria-hidden
            />
            <h2 className="mt-4 font-display text-3xl leading-none tracking-tight text-balance uppercase lg:text-5xl">
              Sobre a Lanchonete do Gordinho
            </h2>
          </div>
          <MascotMoment
            pose="welcoming"
            message="Quem conta a nossa história é o Gordinho."
            className="items-start text-left"
          />
          <p className="text-base text-muted-foreground lg:text-lg">
            {ABOUT_STORY}
          </p>
          <p className="text-sm font-semibold text-primary">
            Há anos servindo Analândia com o mesmo capricho.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {facadePhoto ? (
            <div className="relative aspect-square overflow-hidden rounded-3xl">
              <Image
                src={facadePhoto.src}
                alt={facadePhoto.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-accent/40 via-secondary to-surface-dark/10">
              <Store
                className="size-16 text-primary/50"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          )}

          {ambiencePhoto ? (
            <div className="relative aspect-square overflow-hidden rounded-3xl">
              <Image
                src={ambiencePhoto.src}
                alt={ambiencePhoto.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-surface-dark">
              <Flame
                className="size-16 text-white/35"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          )}
        </div>
      </div>

      <Reveal className="mt-12">
        <div className="flex gap-4 rounded-2xl border bg-card p-6">
          <Quote
            className="size-8 shrink-0 text-primary/60"
            strokeWidth={1.5}
            aria-hidden
          />
          <div>
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Nossa missão
            </p>
            <p className="mt-1 text-base font-medium text-balance lg:text-lg">
              {ABOUT_MISSION}
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-12">
        <h3 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          Nossos valores
        </h3>
        <div role="list" className="mt-4 grid gap-6 sm:grid-cols-3">
          {ABOUT_VALUES.map(({ icon: Icon, title, description }, index) => (
            <Reveal
              key={title}
              role="listitem"
              delay={index * 0.07}
              className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <h4 className="text-base font-bold">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
          Por que escolher a Lanchonete do Gordinho
        </h3>
        <div role="list" className="mt-4 grid gap-6 sm:grid-cols-3">
          {WHY_US.map(({ icon: Icon, title, description }, index) => (
            <Reveal
              key={title}
              role="listitem"
              delay={index * 0.07}
              className="flex items-start gap-3 rounded-2xl bg-secondary p-5 transition-colors hover:bg-secondary/70"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {hasTimeline(timeline) && (
        <div className="mt-12">
          <h3 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
            Nossa linha do tempo
          </h3>
          <div
            role="list"
            className="mt-6 flex flex-col gap-6 border-l-2 border-primary/30 pl-6"
          >
            {timeline.map((entry, index) => (
              <Reveal
                key={entry.year}
                role="listitem"
                delay={index * 0.07}
                className="relative"
              >
                <span
                  className="absolute top-1.5 -left-[1.75rem] size-3 rounded-full bg-primary"
                  aria-hidden
                />
                <p className="text-sm font-bold text-primary">{entry.year}</p>
                <p className="font-semibold">{entry.title}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
