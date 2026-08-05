"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryItem } from "@/features/menu/gallery";

/**
 * Visualização em tela cheia de uma foto da galeria, sobre o `Dialog` radix
 * já usado no admin — foco preso e Esc de graça, sem dependência nova.
 * `DialogTitle` fica `sr-only`: a legenda visível é o `caption` da foto, não
 * um título de diálogo genérico (Radix exige o título por acessibilidade).
 */
export function GalleryLightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: GalleryItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const goTo = useCallback(
    (next: number) => onIndexChange((next + items.length) % items.length),
    [items.length, onIndexChange],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo, index]);

  const item = items[index];
  if (!item) return null;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="max-w-3xl gap-3 border-none bg-transparent p-0 shadow-none sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">{item.alt}</DialogTitle>

        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface-dark sm:aspect-16/9">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-contain"
            priority
          />

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Foto anterior"
                className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur transition-colors hover:bg-background"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Próxima foto"
                className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur transition-colors hover:bg-background"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-1 text-sm text-surface-dark-muted">
          {item.caption ? <p>{item.caption}</p> : <span />}
          <span aria-live="polite">
            {index + 1} de {items.length}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
