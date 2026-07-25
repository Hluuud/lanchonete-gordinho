# Sidebar + Fundamentos (Fase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the client-facing store sidebar (desktop) and mobile drawer nav with real brand identity — logo/slogan header, a "Peça Agora" CTA, and a real-data contact footer (WhatsApp/Instagram/Facebook/phone/address/hours) — without touching any backend layer.

**Architecture:** Frontend-only change inside `features/menu/`. Contact data becomes a new frontend constants module (`contact-info.ts`), mirroring the existing `store-info.ts` pattern (`BUSINESS_HOURS`). A new shared presentational component (`StoreContactFooter`) is built once and reused by both `StoreSidebar` (desktop) and `StoreMobileNav` (mobile drawer) to avoid duplicating markup. Two small brand-icon SVGs (`InstagramIcon`, `FacebookIcon`) are hand-built because this project's installed `lucide-react` version ships no brand/logo icons (verified: `Instagram`/`Facebook`/`Whatsapp` are not exported).

**Tech Stack:** Next.js 16 / React 19, TypeScript, Tailwind CSS v4 (semantic tokens, no hardcoded colors), `lucide-react` for generic icons, Vitest for pure-logic tests, `class-variance-authority`-based `Button` (`components/ui/button.tsx`).

## Global Constraints

- Frontend-only. Do NOT modify: `services/`, `repositories/`, database schema, `checkout`, cart logic, realtime, admin panel, kitchen panel, printing, QR code.
- Do NOT modify `ADR 0007` / the theme token blocks in `styles/globals.css` — the store keeps its orange (`--primary`) palette.
- Real business data to use verbatim (no placeholders, no fabricated data):
  - Address: `Calçadão Ricardo Gregório, 548, Analândia - SP`
  - Phone/WhatsApp display: `(19) 99727-3897`
  - Email: `edvaldolanchonete@hotmail.com`
  - CNPJ: `09.068.710/0001-28`
  - Instagram: `https://www.instagram.com/andre_edvaldo/`
  - Facebook: `https://www.facebook.com/edvaldo.andre`
  - Hours: Tuesday–Sunday 13:00–00:00, Monday closed (day index 1 = `null`, `Date#getDay()` convention already used by `BUSINESS_HOURS`)
- TikTok: no real link exists — omit the icon entirely (do not render a disabled/placeholder icon).
- The existing category ScrollSpy list inside `StoreSidebar` (logic: `useScrollSpy`, `CategoryIcon`, active-state styling, product count) must keep byte-identical *behavior* — only its surrounding chrome changes.
- No new npm dependencies. No new Supabase calls.
- This codebase's test convention (see `docs/conventions.md`): Vitest covers **pure logic only** — no component/Testing-Library tests exist yet. Presentational components (JSX-only, no branching business logic) are validated via `typecheck`/`lint`/`build` + manual browser check, not unit tests. Only `contact-info.ts` (has derived/computed exports) and the `BUSINESS_HOURS` constant (business-critical data, easy to typo) get Vitest coverage in this plan.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `features/menu/contact-info.ts` | Create | Real contact/social constants + derived links (tel/WhatsApp/Maps). |
| `features/menu/contact-info.test.ts` | Create | Verifies the derived links are built correctly from the display values. |
| `features/menu/store-info.ts` | Modify | `BUSINESS_HOURS` corrected to real hours. |
| `features/menu/store-info.test.ts` | Modify | Add assertions pinning `BUSINESS_HOURS` real values. |
| `features/menu/social-icons.tsx` | Create | `InstagramIcon`, `FacebookIcon` — stroke-style SVGs matching lucide's visual language (this lucide version has no brand icons). |
| `features/menu/components/store-contact-footer.tsx` | Create | Shared contact footer (WhatsApp/Instagram/Facebook/phone/address/hours) — reused by desktop sidebar and mobile drawer. |
| `features/menu/components/store-sidebar.tsx` | Modify | Add slogan + "Peça Agora" CTA + `StoreContactFooter`; category nav logic untouched. |
| `features/menu/components/store-mobile-nav.tsx` | Modify | Append `StoreContactFooter` below the nav list in the Drawer. |

---

### Task 1: Contact info constants

**Files:**
- Create: `features/menu/contact-info.ts`
- Test: `features/menu/contact-info.test.ts`

**Interfaces:**
- Produces: `ADDRESS: string`, `PHONE_DISPLAY: string`, `PHONE_TEL_LINK: string`, `WHATSAPP_LINK: string`, `INSTAGRAM_LINK: string`, `FACEBOOK_LINK: string`, `EMAIL: string`, `CNPJ: string`, `MAPS_LINK: string` — all consumed by Task 5 (`store-contact-footer.tsx`).

- [ ] **Step 1: Write the failing test**

Create `features/menu/contact-info.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import {
  ADDRESS,
  CNPJ,
  EMAIL,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";

describe("contact-info", () => {
  it("expõe os dados estáticos de contato sem alteração", () => {
    expect(ADDRESS).toBe("Calçadão Ricardo Gregório, 548, Analândia - SP");
    expect(PHONE_DISPLAY).toBe("(19) 99727-3897");
    expect(EMAIL).toBe("edvaldolanchonete@hotmail.com");
    expect(CNPJ).toBe("09.068.710/0001-28");
    expect(INSTAGRAM_LINK).toBe("https://www.instagram.com/andre_edvaldo/");
    expect(FACEBOOK_LINK).toBe("https://www.facebook.com/edvaldo.andre");
  });

  it("deriva o link de telefone a partir do número exibido", () => {
    expect(PHONE_TEL_LINK).toBe("tel:+5519997273897");
  });

  it("deriva o link do WhatsApp a partir do número exibido", () => {
    expect(WHATSAPP_LINK).toBe("https://wa.me/5519997273897");
  });

  it("codifica o endereço no link do Google Maps", () => {
    expect(MAPS_LINK).toBe(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(ADDRESS),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run features/menu/contact-info.test.ts`
Expected: FAIL — `Cannot find module '@/features/menu/contact-info'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `features/menu/contact-info.ts`:

```typescript
/**
 * Dados reais de contato/redes da loja (fornecidos pelo lojista em
 * 2026-07-24), mantidos como constante no client até existir wiring de
 * `tenants.phone/whatsapp/instagram/facebook/address` no service/repository
 * público do cardápio (hoje `findTenantBySlug` só busca `id, slug, name` —
 * ver BACKLOG.md). Mesmo padrão já usado em `BUSINESS_HOURS`
 * (`store-info.ts`): quando o wiring existir, só a fonte muda, a forma de
 * consumo (estas constantes) permanece.
 */

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export const ADDRESS = "Calçadão Ricardo Gregório, 548, Analândia - SP";
export const PHONE_DISPLAY = "(19) 99727-3897";
export const EMAIL = "edvaldolanchonete@hotmail.com";
export const CNPJ = "09.068.710/0001-28";
/** Instagram/Facebook pessoais do proprietário — únicos disponíveis hoje. */
export const INSTAGRAM_LINK = "https://www.instagram.com/andre_edvaldo/";
export const FACEBOOK_LINK = "https://www.facebook.com/edvaldo.andre";

export const PHONE_TEL_LINK = `tel:+55${digitsOnly(PHONE_DISPLAY)}`;
export const WHATSAPP_LINK = `https://wa.me/55${digitsOnly(PHONE_DISPLAY)}`;
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run features/menu/contact-info.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add features/menu/contact-info.ts features/menu/contact-info.test.ts
git commit -m "feat(menu): add real contact info constants for storefront footer"
```

---

### Task 2: Fix real business hours

**Files:**
- Modify: `features/menu/store-info.ts:15-23`
- Test: `features/menu/store-info.test.ts` (append)

**Interfaces:**
- Consumes: nothing new.
- Produces: `BUSINESS_HOURS` unchanged shape (`Record<number, DayHours>`), now with real values — consumed as-is by `StoreOpenBadge` and (Task 5) `StoreContactFooter`.

- [ ] **Step 1: Write the failing test**

Append to `features/menu/store-info.test.ts` (after the existing `describe("getAverageMenuPrepTimeMinutes", ...)` block, before the closing of the file):

```typescript
describe("BUSINESS_HOURS", () => {
  it("segunda-feira fechada, terça a domingo 13:00–00:00", () => {
    expect(BUSINESS_HOURS[1]).toBeNull();
    for (const day of [0, 2, 3, 4, 5, 6]) {
      expect(BUSINESS_HOURS[day]).toEqual({ open: "13:00", close: "00:00" });
    }
  });
});
```

Replace the existing import at the top of `features/menu/store-info.test.ts`:

```typescript
import {
  getAverageMenuPrepTimeMinutes,
  getStoreOpenState,
  type DayHours,
} from "@/features/menu/store-info";
```

with:

```typescript
import {
  BUSINESS_HOURS,
  getAverageMenuPrepTimeMinutes,
  getStoreOpenState,
  type DayHours,
} from "@/features/menu/store-info";
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run features/menu/store-info.test.ts`
Expected: FAIL — current `BUSINESS_HOURS[0]` is `{ open: "18:00", close: "23:00" }`, not `{ open: "13:00", close: "00:00" }`.

- [ ] **Step 3: Fix the implementation**

In `features/menu/store-info.ts`, replace lines 15-23:

```typescript
export const BUSINESS_HOURS: Record<number, DayHours> = {
  0: { open: "18:00", close: "23:00" },
  1: null,
  2: { open: "18:00", close: "23:00" },
  3: { open: "18:00", close: "23:00" },
  4: { open: "18:00", close: "23:00" },
  5: { open: "18:00", close: "23:30" },
  6: { open: "18:00", close: "23:30" },
};
```

with:

```typescript
export const BUSINESS_HOURS: Record<number, DayHours> = {
  0: { open: "13:00", close: "00:00" },
  1: null,
  2: { open: "13:00", close: "00:00" },
  3: { open: "13:00", close: "00:00" },
  4: { open: "13:00", close: "00:00" },
  5: { open: "13:00", close: "00:00" },
  6: { open: "13:00", close: "00:00" },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run features/menu/store-info.test.ts`
Expected: PASS (all tests, including the new `BUSINESS_HOURS` block)

- [ ] **Step 5: Commit**

```bash
git add features/menu/store-info.ts features/menu/store-info.test.ts
git commit -m "fix(menu): correct real business hours (Tue-Sun 13:00-00:00)"
```

---

### Task 3: Instagram/Facebook stroke-icon components

**Files:**
- Create: `features/menu/social-icons.tsx`

**Interfaces:**
- Produces: `InstagramIcon(props: { className?: string })`, `FacebookIcon(props: { className?: string })` — consumed by Task 5 (`store-contact-footer.tsx`).

No test: pure SVG markup, no branching logic — validated via typecheck/lint/build + visual check (per Global Constraints testing note).

- [ ] **Step 1: Write the implementation**

Create `features/menu/social-icons.tsx`:

```tsx
/**
 * Ícones de Instagram/Facebook desenhados à mão (stroke, 24x24, estilo
 * feather/lucide) — a versão instalada de `lucide-react` não exporta ícones
 * de marca (`Instagram`/`Facebook`/`Whatsapp` ausentes; confirmado via
 * `Object.keys(require('lucide-react'))`). WhatsApp usa `MessageCircle` do
 * próprio lucide no rodapé de contato, sem necessidade de ícone customizado.
 */

type IconProps = {
  className?: string;
};

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/social-icons.tsx
git commit -m "feat(menu): add hand-drawn Instagram/Facebook stroke icons"
```

---

### Task 4: Shared contact footer component

**Files:**
- Create: `features/menu/components/store-contact-footer.tsx`

**Interfaces:**
- Consumes: `ADDRESS, MAPS_LINK, PHONE_DISPLAY, PHONE_TEL_LINK, WHATSAPP_LINK, INSTAGRAM_LINK, FACEBOOK_LINK` (Task 1), `InstagramIcon, FacebookIcon` (Task 3), `getStoreOpenState` + `BUSINESS_HOURS` (Task 2, via `@/features/menu/store-info`), `cn` (`@/lib/utils`).
- Produces: `StoreContactFooter(props: { className?: string })` — consumed by Task 5 (`store-sidebar.tsx`) and Task 6 (`store-mobile-nav.tsx`).

No test: presentational component, hydration-safe clock pattern copied verbatim from the already-shipped `StoreOpenBadge` (`features/menu/components/store-open-badge.tsx`) — validated via typecheck/lint/build + manual browser check.

- [ ] **Step 1: Write the implementation**

Create `features/menu/components/store-contact-footer.tsx`:

```tsx
"use client";

import { useSyncExternalStore } from "react";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";

import {
  ADDRESS,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import { FacebookIcon, InstagramIcon } from "@/features/menu/social-icons";
import { getStoreOpenState } from "@/features/menu/store-info";
import { cn } from "@/lib/utils";

const MINUTE_MS = 60_000;

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, MINUTE_MS);
  return () => window.clearInterval(id);
}

function getMinuteSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS);
}

function getServerSnapshot(): number | null {
  return null;
}

const SOCIAL_LINK_CLASS =
  "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary";

/**
 * Rodapé de contato reaproveitado pela sidebar desktop (`StoreSidebar`) e
 * pelo drawer mobile (`StoreMobileNav`): WhatsApp/Instagram/Facebook,
 * telefone, endereço (link "Como chegar") e status de horário. Relógio via
 * `useSyncExternalStore` com snapshot por minuto — mesmo padrão de
 * `StoreOpenBadge`, evita hydration mismatch (servidor renderiza
 * placeholder neutro).
 */
export function StoreContactFooter({
  className,
}: {
  className?: string;
} = {}) {
  const minute = useSyncExternalStore(
    subscribe,
    getMinuteSnapshot,
    getServerSnapshot,
  );

  return (
    <div className={cn("flex shrink-0 flex-col gap-3 border-t px-5 py-4", className)}>
      <div className="flex items-center gap-1">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className={SOCIAL_LINK_CLASS}
        >
          <MessageCircle className="size-4" aria-hidden />
        </a>
        <a
          href={INSTAGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className={SOCIAL_LINK_CLASS}
        >
          <InstagramIcon className="size-4" />
        </a>
        <a
          href={FACEBOOK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={SOCIAL_LINK_CLASS}
        >
          <FacebookIcon className="size-4" />
        </a>
      </div>

      <a
        href={PHONE_TEL_LINK}
        className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <Phone className="size-3.5 shrink-0" aria-hidden />
        {PHONE_DISPLAY}
      </a>

      <a
        href={MAPS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{ADDRESS}</span>
      </a>

      {minute === null ? (
        <span className="h-4 w-32 animate-pulse rounded bg-secondary" aria-hidden />
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          {getStoreOpenState(new Date()).label}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/components/store-contact-footer.tsx
git commit -m "feat(menu): add shared store contact footer component"
```

---

### Task 5: Redesign desktop sidebar

**Files:**
- Modify: `features/menu/components/store-sidebar.tsx` (full file replace)

**Interfaces:**
- Consumes: `StoreContactFooter` (Task 4), `Button` (`@/components/ui/button`), `ArrowRight` (`lucide-react`), everything the file already imports (`BrandLogo`, `CategoryIcon`, `scrollToSection`, `useScrollSpy`, `sectionAnchorId`, `StoreSection`, `SearchBar`, `cn`).
- Produces: `StoreSidebar` keeps its exact existing prop signature `{ tenantName, sections, query, onQueryChange }` — no change for `store-experience.tsx`, which already renders `<div id="cardapio">` around the main content (the CTA's scroll target).

- [ ] **Step 1: Replace the file**

Replace the full contents of `features/menu/components/store-sidebar.tsx` with:

```tsx
"use client";

import { ArrowRight } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/features/menu/category-icon";
import { StoreContactFooter } from "@/features/menu/components/store-contact-footer";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { useScrollSpy } from "@/features/menu/use-scroll-spy";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";
import { SearchBar } from "@/features/search/components/search-bar";
import { cn } from "@/lib/utils";

const SLOGAN = "Sabor que aquece, feito com carinho";

/**
 * Sidebar fixa do autoatendimento (desktop/totem, `lg:+`): identidade da
 * marca, CTA de pedido, busca e navegação vertical de categorias com
 * destaque da seção ativa (ScrollSpy). No mobile a navegação equivalente é
 * a `StoreMobileNav` (Drawer).
 */
export function StoreSidebar({
  tenantName,
  sections,
  query,
  onQueryChange,
}: {
  tenantName: string;
  sections: StoreSection[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const activeId = useScrollSpy(
    sections.map((section) => sectionAnchorId(section.slug)),
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-card lg:flex">
      <div className="flex flex-col gap-4 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="lg" priority />
          <div className="min-w-0">
            <p className="text-lg leading-tight font-extrabold">
              {tenantName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {SLOGAN}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full rounded-full"
          onClick={() => scrollToSection("cardapio")}
        >
          Peça Agora
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="px-5 pb-4">
        <SearchBar
          value={query}
          onChange={onQueryChange}
          placeholder="Buscar no cardápio"
        />
      </div>

      <nav
        aria-label="Seções do cardápio"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <ul className="flex flex-col gap-1">
          {sections.map((section) => {
            const anchor = sectionAnchorId(section.slug);
            const isActive = anchor === activeId;

            return (
              <li key={section.id}>
                <a
                  href={`#${anchor}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(anchor);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <CategoryIcon slug={section.slug} className="size-5" />
                  <span className="flex-1 truncate">{section.title}</span>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isActive
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {section.products.length}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <StoreContactFooter />
    </aside>
  );
}
```

Note: the category `<nav>` block (ScrollSpy usage, `CategoryIcon`, active-state classes, product count) is copied **unchanged** from the current file — only the surrounding header (logo/slogan/CTA) and the new footer are added.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-sidebar.tsx`
Expected: no errors.

- [ ] **Step 3: Run full test suite (regression check)**

Run: `npx vitest run`
Expected: PASS — `use-scroll-spy`/`virtual-sections`/`store-info`/`contact-info` tests all still pass (this task doesn't touch any tested logic).

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000` at a desktop viewport (≥1024px). Verify:
- Logo, tenant name, and slogan render in the header.
- "Peça Agora" button is visible and clicking it smooth-scrolls to the product list (the `#cardapio` anchor).
- Category list still highlights the active section while scrolling (ScrollSpy unchanged).
- Footer shows WhatsApp/Instagram/Facebook icons (links open in a new tab), phone (tel: link), address (opens Google Maps), and an "Aberto até .../Abre às .../Fechado hoje" line.

- [ ] **Step 5: Commit**

```bash
git add features/menu/components/store-sidebar.tsx
git commit -m "feat(menu): redesign store sidebar with CTA and contact footer"
```

---

### Task 6: Add contact footer to mobile drawer

**Files:**
- Modify: `features/menu/components/store-mobile-nav.tsx`

**Interfaces:**
- Consumes: `StoreContactFooter` (Task 4).
- Produces: no signature change — `StoreMobileNav` keeps its existing props.

- [ ] **Step 1: Add the import**

In `features/menu/components/store-mobile-nav.tsx`, add to the imports (after the `BrandLogo` import):

```typescript
import { StoreContactFooter } from "@/features/menu/components/store-contact-footer";
```

- [ ] **Step 2: Render the footer after the nav list**

Find the closing `</nav>` tag (currently the last element before the closing `</DrawerContent>`) and add `<StoreContactFooter className="shrink-0" />` immediately after it:

```tsx
        </nav>

        <StoreContactFooter className="shrink-0" />
      </DrawerContent>
    </Drawer>
  );
}
```

(This replaces the current `</nav>\n      </DrawerContent>\n    </Drawer>\n  );\n}` ending.)

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-mobile-nav.tsx`
Expected: no errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open at a mobile viewport (≤640px) or narrow the browser window below `lg` (1024px). Tap the menu button in the topbar to open the drawer. Verify:
- Category list still works (tap a category, drawer closes, page scrolls to it — unchanged behavior).
- Contact footer (WhatsApp/Instagram/Facebook/phone/address/hours) renders below the list, doesn't get clipped by the drawer's `max-h-[88vh]`.

- [ ] **Step 5: Commit**

```bash
git add features/menu/components/store-mobile-nav.tsx
git commit -m "feat(menu): add contact footer to mobile drawer nav"
```

---

### Task 7: Full validation pass

**Files:** none (validation only).

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: succeeds with no type or build errors.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all tests pass, including the new `contact-info.test.ts` and the appended `BUSINESS_HOURS` assertions in `store-info.test.ts`.

- [ ] **Step 5: Final manual pass**

Run: `npm run dev`. Walk through both desktop and mobile viewports one more time end to end: header → CTA → search → category scroll-spy → cart (unaffected) → contact footer links. Confirm nothing outside `features/menu/` changed (`git status` should show only the files listed in the File Structure table above, plus the two new spec/plan docs already committed).

- [ ] **Step 6: Commit (if anything was fixed during validation)**

```bash
git add -A
git commit -m "fix(menu): address validation findings from sidebar redesign pass"
```

(Skip this step if validation found nothing to fix — no empty commits.)
