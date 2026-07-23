/**
 * Tipos de domínio (linguagem do negócio).
 *
 * Independentes do formato do banco: a camada de serviços mapeia as Rows do
 * Supabase (`database.types.ts`) para estes tipos. A UI depende apenas daqui,
 * o que mantém o front desacoplado da estrutura de persistência.
 */

import type { UserRole } from "@/types/database.types";

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
  /** IDs dos grupos de adicionais vinculados (Sprint 5, Fase 3). */
  modifierGroupIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ModifierSelectionType = "single" | "multiple";

export type AdminModifierOption = {
  id: string;
  name: string;
  priceCents: number;
  isAvailable: boolean;
  sortOrder: number;
};

/**
 * Grupo de adicionais (Sprint 5, Fase 3) — reutilizável entre produtos via
 * `product_modifier_groups`. Modelagem/CRUD administrativo apenas: o
 * cliente ainda não escolhe adicionais ao pedir (ver BACKLOG).
 */
export type AdminModifierGroup = {
  id: string;
  name: string;
  selectionType: ModifierSelectionType;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  options: AdminModifierOption[];
  /** Quantos produtos usam este grupo — informativo na listagem. */
  productCount: number;
};

/**
 * Combo (Sprint 5, Fase 4) — produto principal fixo + slots de escolha
 * (ex. "Escolha uma bebida"). Modelagem/CRUD administrativo apenas: o
 * cliente ainda não compra combos (ver BACKLOG).
 */
export type AdminComboSlotProduct = {
  productId: string;
  productName: string;
  /** Sobrescreve o preço normal do produto dentro deste slot, quando definido. */
  priceOverrideCents: number | null;
  sortOrder: number;
};

export type AdminComboSlot = {
  id: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  products: AdminComboSlotProduct[];
};

export type AdminCombo = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  /** `null` = preço calculado (principal + seleções); futuro, sem cálculo real ainda. */
  priceCents: number | null;
  mainProductId: string | null;
  mainProductName: string | null;
  isAvailable: boolean;
  sortOrder: number;
  slots: AdminComboSlot[];
  createdAt: string;
  updatedAt: string;
};

export type StoreMode = "open" | "closed" | "vacation" | "maintenance";

/**
 * Configuração operacional da loja (Sprint 5, Fase 5) — 1:1 com `tenants`.
 * Superset de gestão; o `Tenant` público (vitrine) continua minimalista.
 */
export type AdminStoreSettings = {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  address: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  promoBannerUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  welcomeMessage: string | null;
  closingMessage: string | null;
  avgPrepTimeMinutes: number | null;
  storeMode: StoreMode;
  /** `Record<0-6, {open,close}|null>` (0 = domingo) — mesmo formato de `features/menu/store-info.ts`. */
  businessHours: Record<number, { open: string; close: string } | null> | null;
};

/**
 * Usuário do tenant (Sprint 5, Fase 6) — visão de gestão de `profiles`.
 * `email` reflete o que foi escrito no convite (ver `users.repository.ts`),
 * não é lido de `auth.users` (RLS não alcança o schema `auth`).
 */
export type AdminUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export type AdminTopProduct = {
  productId: string | null;
  name: string;
  quantity: number;
};

export type AdminHourlyOrderCount = {
  /** 0–23. */
  hour: number;
  count: number;
};

/**
 * Métricas do Dashboard (Sprint 5, Fase 7) — agregadas em memória a partir
 * de `orders`/`order_items` já existentes, sem tabela nova. `ordersToday`/
 * `completedToday`/`cancelledToday`/`avgTicketCents` são escopados ao dia
 * atual; `topProducts`/`hourlyOrderCounts`/`peakHour`/`ordersPerHour`/
 * `avgPrepTimeMinutes` usam uma janela mais ampla (`windowDays`) para ter
 * amostra estatística — ver `services/admin/dashboard.service.ts`.
 */
export type AdminDashboardMetrics = {
  ordersToday: number;
  /** Pedidos não finalizados/cancelados, de qualquer dia (fila atual). */
  inProgress: number;
  completedToday: number;
  cancelledToday: number;
  /** Ticket médio de hoje, excluindo cancelados. */
  avgTicketCents: number;
  topProducts: AdminTopProduct[];
  hourlyOrderCounts: AdminHourlyOrderCount[];
  /** Hora do dia (0–23) com mais pedidos na janela — `null` sem dados. */
  peakHour: number | null;
  /** Média de pedidos por hora, considerando só horas com pelo menos 1 pedido na janela. */
  ordersPerHour: number;
  /** Média de `ready_at - preparing_at` dos pedidos concluídos na janela — `null` sem dados. */
  avgPrepTimeMinutes: number | null;
  windowDays: number;
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

export type PrinterRole = "kitchen" | "cashier" | "counter";
export type PrinterConnectionType = "usb" | "network" | "bluetooth";
export type PrinterPaperWidth = "58mm" | "80mm";

/**
 * Configuração de impressora (Sprint 5, Fase 8) — só persistência, sem
 * execução real de impressão ainda (ver `docs/printing.md`).
 */
export type AdminPrinter = {
  id: string;
  name: string;
  role: PrinterRole;
  connectionType: PrinterConnectionType;
  paperWidth: PrinterPaperWidth;
  protocol: string;
  ipAddress: string | null;
  port: number | null;
  model: string | null;
  autoPrint: boolean;
  allowReprint: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
