"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/features/menu/components/reveal";
import { WhatsAppIcon } from "@/features/menu/social-icons";
import { WHATSAPP_LINK } from "@/features/menu/contact-info";
import { scrollToSection } from "@/features/menu/scroll-to-section";

const PROMO_TITLE = "As promoções da semana são combinadas na hora";
const PROMO_SUBTITLE =
  "Chame a gente no WhatsApp para saber o que está saindo mais barato hoje — e dê uma olhada no cardápio enquanto isso.";

/**
 * Faixa full-width da seção `#promocoes`.
 *
 * Deliberadamente não lista produtos com preço promocional: a função
 * `create_order` (migration 0009) cobra `products.price_cents` e ignora
 * `promo_price_cents`, então anunciar desconto aqui cobraria o valor cheio no
 * checkout. Enquanto a RPC não honrar a promoção (registrado no BACKLOG), a
 * seção convida ao contato em vez de prometer um preço que não se cumpre.
 */
export function StorePromoBanner() {
  return (
    <section
      id="promocoes"
      aria-labelledby="titulo-promocoes"
      className="scroll-mt-32 bg-surface-dark px-4 py-12 text-surface-dark-foreground lg:scroll-mt-20 lg:px-8 lg:py-16"
    >
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <Image
          src="/brand/mascote-pose-pointing-up.png"
          alt="Gordinho apontando para as promoções"
          width={140}
          height={175}
          className="h-auto w-28 object-contain"
        />
        <h2
          id="titulo-promocoes"
          className="font-display text-3xl leading-none tracking-tight text-balance uppercase sm:text-4xl"
        >
          {PROMO_TITLE}
        </h2>
        <p className="text-base text-surface-dark-muted lg:text-lg">
          {PROMO_SUBTITLE}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full font-semibold">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-4" />
              Falar no WhatsApp
            </a>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="rounded-full border-white/25 bg-transparent font-semibold text-surface-dark-foreground hover:bg-white/10 hover:text-surface-dark-foreground"
            onClick={() => scrollToSection("cardapio")}
          >
            Ver Cardápio
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
