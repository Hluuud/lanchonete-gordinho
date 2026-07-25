"use client";

import { Sandwich } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";
import { scrollToSection } from "@/features/menu/scroll-to-section";

const HERO_TITLE = "O Hambúrguer que vai conquistar seu dia.";
const HERO_SUBTITLE =
  "Feito na hora, com ingredientes de verdade — no capricho que só a Lanchonete do Gordinho tem.";

/**
 * Hero da Home (âncora `#home`, primeiro item de navegação da sidebar/
 * drawer): título/CTA à esquerda, placeholder de mídia à direita.
 * `videoUrl` ainda não é passada por ninguém — componente já preparado para
 * receber vídeo local ou CDN sem redesenho (troca só o lado direito).
 */
export function StoreHero({ videoUrl }: { videoUrl?: string } = {}) {
  const { setOpen } = useCart();

  return (
    <section
      id="home"
      className="grid gap-8 px-4 py-10 lg:scroll-mt-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-16"
    >
      <div className="flex flex-col items-start gap-5">
        <h1 className="text-4xl leading-tight font-black text-balance lg:text-5xl">
          {HERO_TITLE}
        </h1>
        <p className="max-w-md text-base text-muted-foreground lg:text-lg">
          {HERO_SUBTITLE}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size="lg"
            className="rounded-full"
            onClick={() => scrollToSection("cardapio")}
          >
            Ver Cardápio
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            Fazer Pedido
          </Button>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/70 to-foreground lg:aspect-square">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Sandwich
              className="size-24 text-background/30 lg:size-32"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        )}
      </div>
    </section>
  );
}
