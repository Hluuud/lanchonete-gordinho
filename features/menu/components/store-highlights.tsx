"use client";

import { HIGHLIGHTS } from "@/features/menu/highlights";
import { Reveal } from "@/features/menu/components/reveal";

const STAGGER_STEP_S = 0.07;

/**
 * Faixa de destaques da casa logo abaixo do Hero — o que a casa entrega,
 * antes do cliente rolar até o primeiro preço. Conteúdo fixo: é discurso de
 * marca, não dado de banco. `role="list"`/`role="listitem"` porque `Reveal`
 * já é o `<div>` do item — aninhar `<li>` dentro dele quebraria o HTML.
 */
export function StoreHighlights() {
  return (
    <section
      aria-label="Destaques da casa"
      className="border-b border-surface-dark-border bg-surface-dark px-4 pb-10 text-surface-dark-foreground lg:px-8 lg:pb-14"
    >
      <div
        role="list"
        className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {HIGHLIGHTS.map(({ icon: Icon, title, description }, index) => (
          <Reveal
            key={title}
            role="listitem"
            delay={index * STAGGER_STEP_S}
            className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-bold">{title}</p>
              <p className="text-sm text-surface-dark-muted">{description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
