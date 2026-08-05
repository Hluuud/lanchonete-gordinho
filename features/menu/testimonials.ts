/**
 * Depoimentos de clientes (`#depoimentos`). Mesma dívida de
 * `contact-info.ts`: hoje é uma constante de frontend porque não existe
 * fonte real (avaliações do Google, ou uma tabela própria) — quando
 * existir, só a origem muda, `StoreTestimonials` continua igual.
 *
 * `TESTIMONIALS` nasce vazia: publicar avaliação fictícia violaria a mesma
 * regra de honestidade da UI que já rege o Hero, a galeria e a linha do
 * tempo do Sobre (nenhum conteúdo inventado no ar). `StoreTestimonials` não
 * renderiza — e "Depoimentos" nem aparece na navegação (`nav.ts`) —
 * enquanto isto seguir vazio.
 */

export type Testimonial = {
  id: string;
  name: string;
  /** Inteiro de 1 a 5 — ver `isValidRating`. */
  rating: number;
  comment: string;
  photoUrl?: string;
  /** Texto de exibição livre ("Julho de 2026"), não usado pra ordenar. */
  date?: string;
};

export const TESTIMONIALS: Testimonial[] = [];

export function hasTestimonials(items: Testimonial[] = TESTIMONIALS): boolean {
  return items.length > 0;
}

/** Nota inteira de 1 a 5 — o que uma UI de estrelas consegue desenhar. */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/** Média arredondada a 1 casa decimal, ou `null` sem nenhum depoimento. */
export function averageRating(items: Testimonial[]): number | null {
  if (items.length === 0) return null;

  const sum = items.reduce((total, item) => total + item.rating, 0);
  return Math.round((sum / items.length) * 10) / 10;
}
