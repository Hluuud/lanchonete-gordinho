"use client";

import { useState } from "react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { GalleryLightbox } from "@/features/menu/components/gallery-lightbox";
import { Reveal } from "@/features/menu/components/reveal";
import {
  GALLERY_ITEMS,
  groupGalleryByCategory,
  hasGallery,
} from "@/features/menu/gallery";

/**
 * Galeria institucional (`#galeria`): fachada, ambiente, cozinha, equipe,
 * clientes e os produtos em foto, agrupados por categoria. Some da página —
 * e o item "Galeria" nem aparece na navegação (`nav.ts`) — enquanto
 * `GALLERY_ITEMS` estiver vazia: sem fotos reais, não há o que mostrar.
 */
export function StoreGallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!hasGallery(GALLERY_ITEMS)) return null;

  const groups = groupGalleryByCategory(GALLERY_ITEMS);

  return (
    <section
      id="galeria"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <span className="block h-1.5 w-16 rounded-full bg-primary" aria-hidden />
      <h2 className="mt-4 font-display text-3xl leading-none tracking-tight text-balance uppercase lg:text-5xl">
        Nossa Casa
      </h2>

      <div className="mt-10 flex flex-col gap-10">
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="mb-4 text-sm font-bold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((item) => {
                const flatIndex = GALLERY_ITEMS.indexOf(item);

                return (
                  <Reveal key={item.id} className="aspect-square">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(flatIndex)}
                      aria-label={`Ampliar foto: ${item.alt}`}
                      className="group relative block size-full overflow-hidden rounded-2xl"
                    >
                      <Skeleton className="absolute inset-0 rounded-2xl" />
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        loading="lazy"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="relative object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <GalleryLightbox
          items={GALLERY_ITEMS}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
