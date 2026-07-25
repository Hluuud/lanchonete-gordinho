# Home / Hero (Fase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Hero section (`#home`) to the client storefront — headline, subtitle, two CTAs, and a video-ready media placeholder — and wire "Home" into both the desktop sidebar and mobile drawer navigation as the first nav item, without touching any backend layer.

**Architecture:** One new presentational client component (`StoreHero`) rendered between the existing sticky `StoreTopbar` and the existing `#cardapio` content wrapper inside `StoreExperience`. `StoreSidebar` and `StoreMobileNav` (both already redesigned in Fase 1, currently in `dev`) each get one static "Home" nav entry added ahead of their existing dynamic category list, reusing the same `scrollToSection`/`useScrollSpy` primitives already in place — no new navigation abstraction.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Tailwind CSS v4 (semantic tokens, no hardcoded colors), `lucide-react` (`Sandwich`, `Home` icons), `components/ui/button.tsx` (`Button`), existing `useCart()` hook for the cart-opening CTA.

## Global Constraints

- Frontend-only. Do NOT modify: `services/`, `repositories/`, database schema, `checkout`, cart logic, realtime, admin panel, kitchen panel, printing, QR code.
- Do NOT modify the theme token blocks in `styles/globals.css` — use existing semantic tokens (`--primary`, `--foreground`, `--background`) only, no hardcoded colors.
- Hero copy is final text, not a placeholder — use verbatim:
  - Title: `O Hambúrguer que vai conquistar seu dia.`
  - Subtitle: `Feito na hora, com ingredientes de verdade — no capricho que só a Lanchonete do Gordinho tem.`
- No product photo in the media placeholder — no product has a real `imageUrl` yet (confirmed). Use an icon-on-gradient placeholder only.
- `StoreHero` accepts an optional `videoUrl?: string` prop that swaps the gradient placeholder for a `<video autoPlay muted loop playsInline>` when provided. No caller passes it in this phase — this is groundwork for a future asset, not active behavior.
- "Ver Cardápio" calls `scrollToSection("cardapio")` (existing anchor, unchanged). "Fazer Pedido" calls `setOpen(true)` from `useCart()` (existing cart-opening behavior, same as `StoreTopbar`'s cart button).
- "Home" is a static nav entry (not derived from `sections`), added as the first item in both `StoreSidebar` and `StoreMobileNav`, pointing at the new `#home` anchor. No shared/new nav-config abstraction — this phase adds the entry directly in each of the two files, matching how the existing dynamic list is already written per-file.
- No new npm dependencies. No new Supabase calls.
- Test convention (same as Fase 1): Vitest covers pure logic only. `StoreHero`, and the sidebar/drawer nav-entry additions, are presentational/JSX changes — no new unit test files. Validated via typecheck/lint/build + full existing suite (regression) + manual browser check when available.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `features/menu/components/store-hero.tsx` | Create | Hero section: headline, subtitle, two CTAs, media placeholder (gradient+icon, or `<video>` when `videoUrl` is passed). |
| `features/menu/components/store-experience.tsx` | Modify | Render `<StoreHero />` between `<StoreTopbar />` and the existing `#cardapio` wrapper. |
| `features/menu/components/store-sidebar.tsx` | Modify | Add static "Home" nav entry; extend `useScrollSpy` id list to include `"home"`. |
| `features/menu/components/store-mobile-nav.tsx` | Modify | Add static "Home" button in the Drawer nav list, with its own close+scroll handler. |

---

### Task 1: Hero section component

**Files:**
- Create: `features/menu/components/store-hero.tsx`

**Interfaces:**
- Produces: `StoreHero(props?: { videoUrl?: string })` — a self-contained section with `id="home"`. Consumed by Task 2 (`store-experience.tsx`).
- Consumes: `Button` (`@/components/ui/button`), `useCart` (`@/features/cart/use-cart`), `scrollToSection` (`@/features/menu/scroll-to-section`), `Sandwich` (`lucide-react`).

No test: presentational component (headline/CTA/placeholder markup, no branching business logic) — validated via typecheck/lint/build + manual browser check, per this codebase's Vitest-covers-pure-logic-only convention (already applied to `StoreSidebar`/`StoreContactFooter` in Fase 1).

- [ ] **Step 1: Write the implementation**

Create `features/menu/components/store-hero.tsx`:

```tsx
"use client";

import { Sandwich } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";
import { scrollToSection } from "@/features/menu/scroll-to-section";

const HERO_TITLE = "O Hambúrguer que vai conquistar seu dia.";
const HERO_SUBTITLE =
  "Feito na hora, com ingredientes de verdade — no capricho que só a Lanchonete do Gordinho tem.";

/**
 * Hero da Home (âncora `#home`, primeiro item de navegação da sidebar/
 * drawer): título/CTA à esquerda, placeholder de mídia à direita.
 * `videoUrl` ainda não é passada por ninguém — componente já preparado para
 * receber vídeo local ou CDN sem redesenho (troca só o lado direito).
 */
export function StoreHero({ videoUrl }: { videoUrl?: string } = {}) {
  const { setOpen } = useCart();

  return (
    <section
      id="home"
      className="grid gap-8 px-4 py-10 lg:scroll-mt-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-16"
    >
      <div className="flex flex-col items-start gap-5">
        <h1 className="text-4xl leading-tight font-black text-balance lg:text-5xl">
          {HERO_TITLE}
        </h1>
        <p className="max-w-md text-base text-muted-foreground lg:text-lg">
          {HERO_SUBTITLE}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size="lg"
            className="rounded-full"
            onClick={() => scrollToSection("cardapio")}
          >
            Ver Cardápio
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            Fazer Pedido
          </Button>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/70 to-foreground lg:aspect-square">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Sandwich
              className="size-24 text-background/30 lg:size-32"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-hero.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/components/store-hero.tsx
git commit -m "feat(menu): add store hero section with CTAs and media placeholder"
```

---

### Task 2: Wire Hero into the storefront layout

**Files:**
- Modify: `features/menu/components/store-experience.tsx`

**Interfaces:**
- Consumes: `StoreHero` (Task 1).
- Produces: no change to `StoreExperience`'s own signature (`{ menu: Menu }`).

- [ ] **Step 1: Add the import**

In `features/menu/components/store-experience.tsx`, add to the imports (near the other `features/menu/components/*` imports):

```typescript
import { StoreHero } from "@/features/menu/components/store-hero";
```

- [ ] **Step 2: Render the Hero between the topbar and the cardápio content**

Find this block:

```tsx
        <StoreTopbar
          tenantName={menu.tenant.name}
          avgPrepMinutes={avgPrepMinutes}
          sections={sections}
          isFiltering={isFiltering}
          query={rawQuery}
          onQueryChange={setRawQuery}
        />

        <div id="cardapio" className="mx-auto w-full max-w-6xl px-4 py-4 pb-24">
```

Replace it with:

```tsx
        <StoreTopbar
          tenantName={menu.tenant.name}
          avgPrepMinutes={avgPrepMinutes}
          sections={sections}
          isFiltering={isFiltering}
          query={rawQuery}
          onQueryChange={setRawQuery}
        />

        <StoreHero />

        <div id="cardapio" className="mx-auto w-full max-w-6xl px-4 py-4 pb-24">
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-experience.tsx`
Expected: no errors.

- [ ] **Step 4: Run full test suite (regression check)**

Run: `npx vitest run`
Expected: PASS — no test touches `StoreExperience` directly, this is a regression guard only.

- [ ] **Step 5: Commit**

```bash
git add features/menu/components/store-experience.tsx
git commit -m "feat(menu): render store hero above the product list"
```

---

### Task 3: Add "Home" to the desktop sidebar nav

**Files:**
- Modify: `features/menu/components/store-sidebar.tsx`

**Interfaces:**
- Consumes: `Home` (`lucide-react`), `scrollToSection` (already imported).
- Produces: no change to `StoreSidebar`'s prop signature.

- [ ] **Step 1: Add the `Home` icon import**

Replace:

```tsx
import { ArrowRight } from "lucide-react";
```

with:

```tsx
import { ArrowRight, Home } from "lucide-react";
```

- [ ] **Step 2: Extend the ScrollSpy id list**

Replace:

```tsx
  const activeId = useScrollSpy(
    sections.map((section) => sectionAnchorId(section.slug)),
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );
```

with:

```tsx
  const activeId = useScrollSpy(
    ["home", ...sections.map((section) => sectionAnchorId(section.slug))],
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );
```

- [ ] **Step 3: Add the static "Home" nav entry**

Find:

```tsx
      <nav
        aria-label="Seções do cardápio"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <ul className="flex flex-col gap-1">
          {sections.map((section) => {
```

Replace with:

```tsx
      <nav
        aria-label="Seções do cardápio"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <ul className="flex flex-col gap-1">
          <li>
            <a
              href="#home"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("home");
              }}
              aria-current={activeId === "home" ? "true" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeId === "home"
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Home className="size-5" aria-hidden />
              <span className="flex-1 truncate">Home</span>
            </a>
          </li>

          {sections.map((section) => {
```

(The existing `{sections.map((section) => { ... })}` body, its closing `})}`, and the closing `</ul>`/`</nav>` are unchanged — only the new `<li>` is inserted immediately before the existing map call.)

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-sidebar.tsx`
Expected: no errors.

- [ ] **Step 5: Run full test suite (regression check)**

Run: `npx vitest run`
Expected: PASS — `use-scroll-spy.test.ts` tests the hook in isolation with its own id arrays, not the array `StoreSidebar` passes it, so this change cannot affect that test file.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, open at a desktop viewport (≥1024px). Verify: "Home" is the first item in the sidebar nav, above the category list, with a house icon; clicking it scrolls to the Hero section at the top of the page; the "Home" item highlights (primary background) while the Hero section is in view, and un-highlights once you scroll into a category section (existing ScrollSpy behavior extended, not replaced).

- [ ] **Step 7: Commit**

```bash
git add features/menu/components/store-sidebar.tsx
git commit -m "feat(menu): add Home entry to desktop sidebar navigation"
```

---

### Task 4: Add "Home" to the mobile drawer nav

**Files:**
- Modify: `features/menu/components/store-mobile-nav.tsx`

**Interfaces:**
- Consumes: `Home` (`lucide-react`), `scrollToSection` (already imported).
- Produces: no change to `StoreMobileNav`'s prop signature.

- [ ] **Step 1: Add the `Home` icon import**

Replace:

```tsx
import { CategoryIcon } from "@/features/menu/category-icon";
```

with:

```tsx
import { Home } from "lucide-react";

import { CategoryIcon } from "@/features/menu/category-icon";
```

- [ ] **Step 2: Add a `goToHome` handler alongside the existing `goTo`**

Find:

```tsx
  function goTo(slug: string) {
    onOpenChange(false);
    // Aguarda o Drawer fechar para não competir com sua própria animação de scroll.
    window.setTimeout(() => scrollToSection(sectionAnchorId(slug)), 200);
  }
```

Replace with:

```tsx
  function goTo(slug: string) {
    onOpenChange(false);
    // Aguarda o Drawer fechar para não competir com sua própria animação de scroll.
    window.setTimeout(() => scrollToSection(sectionAnchorId(slug)), 200);
  }

  function goToHome() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("home"), 200);
  }
```

- [ ] **Step 3: Add the static "Home" button to the list**

Find:

```tsx
          <ul className="flex flex-col gap-1">
            {sections.map((section) => (
```

Replace with:

```tsx
          <ul className="flex flex-col gap-1">
            <li>
              <button
                type="button"
                onClick={goToHome}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary active:bg-primary/15"
              >
                <Home className="size-5" aria-hidden />
                <span className="flex-1 truncate">Home</span>
              </button>
            </li>

            {sections.map((section) => (
```

(The existing `{sections.map((section) => ( ... ))}` body, its closing `)}`, and the closing `</ul>` are unchanged — only the new `<li>` is inserted immediately before the existing map call.)

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-mobile-nav.tsx`
Expected: no errors.

- [ ] **Step 5: Manual visual check**

Run: `npm run dev`, open at a mobile/narrow viewport (≤640px, or the browser window narrowed below 1024px). Open the drawer via the topbar menu button. Verify: "Home" is the first item, above the category list, with a house icon; tapping it closes the drawer and scrolls the page to the Hero section; tapping a category still works as before (drawer closes, scrolls to that category).

- [ ] **Step 6: Commit**

```bash
git add features/menu/components/store-mobile-nav.tsx
git commit -m "feat(menu): add Home entry to mobile drawer navigation"
```

---

### Task 5: Full validation pass

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
Expected: all tests pass (same 98 tests as end of Fase 1 — this phase adds no new test files, only presentational changes).

- [ ] **Step 5: Final manual pass**

Run: `npm run dev`. Walk through both desktop and mobile viewports end to end: sidebar/drawer "Home" entry → Hero section (headline, subtitle, "Ver Cardápio" scrolls down, "Fazer Pedido" opens the cart) → rest of the page (search, categories, cart) unaffected. Confirm `git status` shows only the files listed in the File Structure table above changed.

- [ ] **Step 6: Commit (if anything was fixed during validation)**

```bash
git add -A
git commit -m "fix(menu): address validation findings from home hero pass"
```

(Skip this step if validation found nothing to fix — no empty commits.)
