import { Award, Flame, Store, Users } from "lucide-react";

const ABOUT_TEXT =
  "A Lanchonete do Gordinho nasceu da paixão por lanches de verdade e do carinho em atender bem. Há anos servimos a comunidade de Analândia com ingredientes selecionados, porções generosas e aquele atendimento que faz todo mundo se sentir em casa. Do clássico X-Burger às porções pra compartilhar, cada lanche sai na hora, feito com capricho — porque pra gente, mais que lanches, a ideia é criar momentos.";

const ABOUT_FEATURES = [
  {
    icon: Users,
    title: "Missão",
    description:
      "Servir com carinho — cada pedido preparado pra você se sentir em casa.",
  },
  {
    icon: Award,
    title: "Qualidade",
    description:
      "Ingredientes selecionados, sempre frescos, escolhidos com cuidado.",
  },
  {
    icon: Flame,
    title: "Especialidade",
    description:
      "Feito na hora — hambúrgueres e porções montados no pedido, sem pressa.",
  },
] as const;

/**
 * Seção institucional (`#sobre`): história, missão/qualidade/especialidade
 * e dois placeholders de imagem (ambiente/lanches — nenhuma foto real
 * cadastrada ainda, mesmo tratamento do placeholder do Hero).
 */
export function StoreAbout() {
  return (
    <section
      id="sobre"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl leading-tight font-black text-balance lg:text-4xl">
            Sobre a Lanchonete do Gordinho
          </h2>
          <p className="text-base text-muted-foreground lg:text-lg">
            {ABOUT_TEXT}
          </p>
          <p className="text-sm font-semibold text-primary">
            Há anos servindo Analândia com o mesmo capricho.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-secondary to-foreground/10">
            <Store
              className="size-16 text-primary/50"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary/70 to-foreground">
            <Flame
              className="size-16 text-background/30"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {ABOUT_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-6"
          >
            <feature.icon className="size-8 text-primary" aria-hidden />
            <h3 className="text-base font-bold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
