import Image from "next/image";
import { Star } from "lucide-react";

import { Reveal } from "@/features/menu/components/reveal";
import {
  hasTestimonials,
  TESTIMONIALS,
  type Testimonial,
} from "@/features/menu/testimonials";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} de 5 estrelas`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < rating
              ? "fill-primary text-primary"
              : "text-muted-foreground/30",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

/**
 * Depoimentos de clientes (`#depoimentos`). Some da página — e da
 * navegação (`nav.ts`) — enquanto `TESTIMONIALS` estiver vazia: nenhuma
 * avaliação fictícia vai ao ar (ver `testimonials.ts`).
 */
export function StoreTestimonials() {
  if (!hasTestimonials(TESTIMONIALS)) return null;

  return (
    <section
      id="depoimentos"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <span className="block h-1.5 w-16 rounded-full bg-primary" aria-hidden />
      <h2 className="mt-4 font-display text-3xl leading-none tracking-tight text-balance uppercase lg:text-5xl">
        Quem já provou, aprova
      </h2>

      <div
        role="list"
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {TESTIMONIALS.map((testimonial: Testimonial, index) => (
          <Reveal
            key={testimonial.id}
            role="listitem"
            delay={index * 0.07}
            className="flex h-full flex-col gap-4 rounded-2xl border bg-card p-6"
          >
            <StarRating rating={testimonial.rating} />
            <p className="text-sm text-muted-foreground">
              &ldquo;{testimonial.comment}&rdquo;
            </p>
            <div className="mt-auto flex items-center gap-3">
              {testimonial.photoUrl ? (
                <Image
                  src={testimonial.photoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {initials(testimonial.name)}
                </span>
              )}
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                {testimonial.date && (
                  <p className="text-xs text-muted-foreground">
                    {testimonial.date}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
