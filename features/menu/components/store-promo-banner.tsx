"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/features/menu/scroll-to-section";

const PROMO_TITLE = "Fique de olho nas nossas promoções";
const PROMO_SUBTITLE =
  "Sempre tem novidade por aqui — dá uma olhada no cardápio e aproveite.";

/**
 * Faixa full-width entre a Home e o Cardápio (âncora `#promocoes`, sem
 * item de navegação próprio — ver spec da Fase 5). Conteúdo é rascunho
 * editável enquanto não há uma promoção real cadastrada.
 */
export function StorePromoBanner() {
  return (
    <section
      id="promocoes"
      className="bg-gradient-to-r from-primary via-primary/80 to-foreground px-4 py-10 lg:scroll-mt-20 lg:px-8"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
        <Sparkles
          className="size-10 text-background/80"
          strokeWidth={1.5}
          aria-hidden
        />
        <h2 className="text-2xl font-black text-background lg:text-3xl">
          {PROMO_TITLE}
        </h2>
        <p className="text-base text-background/80 lg:text-lg">
          {PROMO_SUBTITLE}
        </p>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="mt-2 rounded-full"
          onClick={() => scrollToSection("cardapio")}
        >
          Ver Cardápio
        </Button>
      </div>
    </section>
  );
}
