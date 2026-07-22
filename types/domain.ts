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

// ---------------------------------------------------------------------------
// Painel Administrativo (Sprint 5) — superset de gestão, não exposto à
// vitrine pública. `MenuCategory`/`Product` continuam o contrato do cliente.
// ---------------------------------------------------------------------------

export type AdminProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string | null;
  priceCents: number;
  /** Sempre menor que `priceCents` quando presente (constraint no banco). */
  promoPriceCents: number | null;
  sku: string | null;
  imageUrl: string | null;
  prepTimeMinutes: number;
  sortOrder: number;
  isAvailable: boolean;
  /** Aparece no cardápio (equivalente a `is_active` de `AdminCategory`). */
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  ingredients: string[];
  allergens: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  /** Aparece no cardápio (equivalente a `is_published` de `Product`). */
  isActive: boolean;
  /** Pode ser pedida agora. */
  isAvailable: boolean;
  /** Quantidade de produtos vinculados — usado para proteger contra exclusão acidental. */
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Pedidos (Painel da Cozinha — Sprint 2; Checkout — Sprint 3)
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivered"
  | "completed"
  | "cancelled";

/** "dine_in" (consumo no local) — arquitetura preparada, sem captura de mesa ainda. */
export type OrderType = "pickup" | "delivery" | "dine_in";

export type OrderItem = {
  id: string;
  /** Nulo se o produto original foi removido do cardápio — o snapshot permanece. */
  productId: string | null;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  notes: string | null;
};

export type Order = {
  id: string;
  tenantId: string;
  /** "Senha" exibida ao cliente/cozinha — atribuída atomicamente por `create_order` antes do insert (Sprint 3). */
  orderNumber: number;
  status: OrderStatus;
  orderType: OrderType;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  subtotalCents: number;
  /** Taxa de serviço — arquitetura preparada (Sprint 3), sempre 0 por ora. */
  serviceFeeCents: number;
  /** Desconto de cupom — arquitetura preparada (Sprint 3), sempre 0 por ora. */
  discountCents: number;
  /** Sempre nulo por ora — sem lógica de cupom real ainda. */
  couponCode: string | null;
  /** Computado (`subtotalCents + serviceFeeCents - discountCents`) — não armazenado no banco. */
  totalCents: number;
  isPriority: boolean;
  estimatedReadyAt: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  items: OrderItem[];
};

/**
 * Subconjunto público de `Order`, sem PII (`customerName`/`customerPhone`/
 * `notes`/`cancelledReason` ficam de fora) — para a página de acompanhamento
 * (`/pedido/[id]`), que qualquer visitante com o link acessa. Ver ADR 0006 e
 * `docs/security.md`.
 */
export type PublicOrderTracking = {
  orderId: string;
  orderNumber: number;
  status: OrderStatus;
  orderType: OrderType;
  subtotalCents: number;
  serviceFeeCents: number;
  discountCents: number;
  totalCents: number;
  estimatedReadyAt: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
};
