import { Heart, Sandwich, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const VALUE_PROPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Sandwich,
    title: "Lanches de verdade",
    text: "Feitos na hora, com ingredientes selecionados.",
  },
  {
    icon: Sparkles,
    title: "Qualidade sempre",
    text: "O mesmo capricho no primeiro e no milésimo pedido.",
  },
  {
    icon: Heart,
    title: "Feito para você",
    text: "Do lanche rápido ao jantar em família, do seu jeito.",
  },
];

/**
 * Faixa de três promessas logo abaixo do Hero — o que a casa entrega, antes
 * do cliente rolar até o primeiro preço. Conteúdo fixo: é discurso de marca,
 * não dado de banco.
 */
export function StoreValueProps() {
  return (
    <section
      aria-label="Nossos diferenciais"
      className="border-b border-surface-dark-border bg-surface-dark px-4 pb-10 text-surface-dark-foreground lg:px-8 lg:pb-14"
    >
      <ul className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-3">
        {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-bold">{title}</p>
              <p className="text-sm text-surface-dark-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
