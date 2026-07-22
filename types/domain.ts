/**
 * Tipos de domínio (linguagem do negócio).
 *
 * Independentes do formato do banco: a camada de serviços mapeia as Rows do
 * Supabase (`database.types.ts`) para estes tipos. A UI depende apenas daqui,
 * o que mantém o front desacoplado da estrutura de persistência.
 */

export type Tenant = {
  id: string;
  slug: string;
  name: string;
};

export type ProductBadges = {
  isFeatured: boolean;
  isNew: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  /** Preço em centavos (inteiro). Formatação para BRL acontece na UI. */
  priceCents: number;
  imageUrl: string | null;
  prepTimeMinutes: number;
  isAvailable: boolean;
  badges: ProductBadges;
  /**
   * Nota média (0-5). Sem dado real ainda — não há avaliações no banco.
   * Sempre `null` por ora; a UI reserva o slot mas só exibe quando existir.
   */
  rating: number | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  products: Product[];
};

export type Menu = {
  tenant: Tenant;
  categories: MenuCategory[];
};
