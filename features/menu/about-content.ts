import {
  Award,
  Flame,
  Heart,
  Sandwich,
  Smile,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AboutFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** Parágrafo de abertura da seção `#sobre` — a história da casa. */
export const ABOUT_STORY =
  "A Lanchonete do Gordinho nasceu da paixão por lanches de verdade e do carinho em atender bem. Há anos servimos a comunidade de Analândia com ingredientes selecionados, porções generosas e aquele atendimento que faz todo mundo se sentir em casa. Do clássico X-Burger às porções pra compartilhar, cada lanche sai na hora, feito com capricho — porque pra gente, mais que lanches, a ideia é criar momentos.";

export const ABOUT_MISSION =
  "Servir cada pedido com o mesmo carinho de quem cozinha pra alguém que ama — rápido, sem abrir mão da qualidade.";

export const ABOUT_VALUES: AboutFeature[] = [
  {
    icon: Heart,
    title: "Carinho",
    description: "Cada pedido preparado pensando em quem vai comer.",
  },
  {
    icon: Award,
    title: "Qualidade",
    description:
      "Ingredientes selecionados, sempre frescos, escolhidos com cuidado.",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Parte do dia a dia de Analândia há anos.",
  },
];

/** "Por que escolher a Lanchonete do Gordinho" — razões concretas, não slogans. */
export const WHY_US: AboutFeature[] = [
  {
    icon: Flame,
    title: "Feito na hora",
    description: "Nada fica pronto esperando — o lanche sai quando você pede.",
  },
  {
    icon: Sandwich,
    title: "Porções generosas",
    description:
      "Sem economizar no recheio, do jeito que lanche de verdade tem que ser.",
  },
  {
    icon: Smile,
    title: "Atendimento de verdade",
    description: "O tipo de lugar onde te chamam pelo nome.",
  },
];

export type AboutTimelineEntry = {
  /** Ano como string ("2019") — texto de exibição, `sortAboutTimeline` que
   *  converte pra ordenar. */
  year: string;
  title: string;
  description: string;
};

/**
 * Vazia: não há datas reais da casa registradas ainda, e inventar um ano
 * seria mentir pro cliente — mesma regra que já vale para os timers de
 * contagem regressiva de promoção (ver `BACKLOG.md`). `StoreAbout` só
 * renderiza a linha do tempo quando isto tiver entradas.
 */
export const ABOUT_TIMELINE: AboutTimelineEntry[] = [];

export function hasTimeline(
  entries: AboutTimelineEntry[] = ABOUT_TIMELINE,
): boolean {
  return entries.length > 0;
}

/** Ordem cronológica ascendente — a ordem em que a história é contada. */
export function sortAboutTimeline(
  entries: AboutTimelineEntry[],
): AboutTimelineEntry[] {
  return [...entries].sort((a, b) => Number(a.year) - Number(b.year));
}
