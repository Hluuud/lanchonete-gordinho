import {
  Croissant,
  CupSoda,
  Flame,
  Leaf,
  Sandwich,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Highlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/**
 * Destaques da casa, logo abaixo do Hero — o que a Lanchonete do Gordinho
 * entrega, resumido em seis promessas curtas. Conteúdo fixo: é discurso de
 * marca, não dado de banco (mesmo raciocínio de `contact-info.ts`).
 */
export const HIGHLIGHTS: Highlight[] = [
  {
    icon: Sandwich,
    title: "Hambúrguer Artesanal",
    description: "Montado na hora, sem pressa e sem atalho.",
  },
  {
    icon: Flame,
    title: "Batata Crocante",
    description: "Sequinha por fora, macia por dentro, sempre quentinha.",
  },
  {
    icon: CupSoda,
    title: "Bebidas Geladas",
    description: "Geladas de verdade, prontas pra acompanhar o lanche.",
  },
  {
    icon: Croissant,
    title: "Pastéis",
    description: "Massa fina e recheio generoso, fritos na hora do pedido.",
  },
  {
    icon: Leaf,
    title: "Ingredientes Frescos",
    description: "Selecionados com cuidado, repostos todo dia.",
  },
  {
    icon: Zap,
    title: "Preparo Rápido",
    description: "Da cozinha pra sua mesa sem enrolação.",
  },
];
