# Promoções (Fase 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static, full-width promo banner section between the Home hero and the menu, using the same gradient palette and CTA pattern already established by `StoreHero` — no new nav entry, no new dependency, no data layer changes.

**Architecture:** One new self-contained client component (`StorePromoBanner`) with no props, rendered once from `store-experience.tsx` between `<StoreHero />` and the existing `<div id="cardapio">`. No other file changes.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Tailwind CSS v4 (semantic tokens), `lucide-react` (`Sparkles`), existing `Button` component (`@/components/ui/button`), existing `scrollToSection` (`@/features/menu/scroll-to-section`).

## Global Constraints

- Frontend-only. Do NOT modify: `services/`, `repositories/`, database schema, `checkout`, cart logic, realtime, admin panel, kitchen panel, printing, QR code.
- Do NOT touch `store-sidebar.tsx` or `store-mobile-nav.tsx` — this phase's spec explicitly decided the banner gets no nav entry and is not added to the `useScrollSpy` id array.
- Do NOT add any new npm dependency (no carousel library — this is a single static banner, not a carousel).
- Content is a placeholder draft, not a real promotion: do NOT invent a specific discount, price, or time-limited offer. Use the exact copy specified below.
- Reuse the existing `Button` component and `scrollToSection` helper — do not hand-roll a new button or scroll mechanism.
- Test convention (same as prior phases): Vitest covers pure logic only. This phase is pure JSX/CSS with one `onClick` that calls the already-covered `scrollToSection` — no new test files. Validated via typecheck/lint/build + full suite regression + HTML fetch from the dev server (browser interaction verification remains unavailable in this environment, per prior phases).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `features/menu/components/store-promo-banner.tsx` | Create | Static full-width promo banner section (`#promocoes`), gradient background, `Sparkles` icon, title/subtitle, "Ver Cardápio" CTA. |
| `features/menu/components/store-experience.tsx` | Modify | Import and render `<StorePromoBanner />` between `<StoreHero />` and `<div id="cardapio">`. |

---

### Task 1: Create StorePromoBanner

**Files:**
- Create: `features/menu/components/store-promo-banner.tsx`

**Interfaces:**
- Consumes: `Button` (`@/components/ui/button`, default props — no `variant`/`size` beyond what's shown below), `scrollToSection` (`@/features/menu/scroll-to-section`, signature `(id: string) => void`, already used identically by `StoreHero`), `Sparkles` (`lucide-react`).
- Produces: `StorePromoBanner()` — a component with no props, default export is NOT used (named export, matching every other component in this directory, e.g. `StoreHero`, `StoreAbout`).

No test: pure JSX/CSS, `onClick` calls `scrollToSection` which is already exercised by `StoreHero`'s identical usage — no new logic to cover.

- [ ] **Step 1: Write the component**

Create `features/menu/components/store-promo-banner.tsx` with this exact content:

```tsx
"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/features/menu/scroll-to-section";

const PROMO_TITLE = "Fique de olho nas nossas promoções";
const PROMO_SUBTITLE =
  "Sempre tem novidade por aqui — dá uma olhada no cardápio e aproveite.";

/**
 * Faixa full-width entre a Home e o Cardápio (âncora `#promocoes`, sem
 * item de navegação próprio — ver spec da Fase 5). Conteúdo é rascunho
 * editável enquanto não há uma promoção real cadastrada.
 */
export function StorePromoBanner() {
  return (
    <section
      id="promocoes"
      className="bg-gradient-to-r from-primary via-primary/80 to-foreground px-4 py-10 lg:scroll-mt-20 lg:px-8"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
        <Sparkles
          className="size-10 text-background/80"
          strokeWidth={1.5}
          aria-hidden
        />
        <h2 className="text-2xl font-black text-background lg:text-3xl">
          {PROMO_TITLE}
        </h2>
        <p className="text-base text-background/80 lg:text-lg">
          {PROMO_SUBTITLE}
        </p>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="mt-2 rounded-full"
          onClick={() => scrollToSection("cardapio")}
        >
          Ver Cardápio
        </Button>
      </div>
    </section>
  );
}
```

(`variant="secondary"` — confirmed present in `components/ui/button.tsx`'s variant map as `"bg-secondary text-secondary-foreground hover:bg-secondary/80"` — gives the CTA contrast against the gradient background, same role `StoreHero`'s second button fills with `variant="outline"` against its own lighter background.)

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-promo-banner.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/components/store-promo-banner.tsx
git commit -m "feat(menu): add static promo banner section"
```

---

### Task 2: Render StorePromoBanner in StoreExperience

**Files:**
- Modify: `features/menu/components/store-experience.tsx:10` (import block), `features/menu/components/store-experience.tsx:102-104` (render block)

**Interfaces:**
- Consumes: `StorePromoBanner` from Task 1 (named export, no props).
- Produces: no change to `StoreExperience`'s own prop signature.

- [ ] **Step 1: Add the import**

Find:

```tsx
import { StoreHero } from "@/features/menu/components/store-hero";
```

Replace with:

```tsx
import { StoreHero } from "@/features/menu/components/store-hero";
import { StorePromoBanner } from "@/features/menu/components/store-promo-banner";
```

- [ ] **Step 2: Render it between StoreHero and the cardápio div**

Find:

```tsx
        <StoreHero />

        <div id="cardapio" className="mx-auto w-full max-w-6xl px-4 py-4 pb-24">
```

Replace with:

```tsx
        <StoreHero />

        <StorePromoBanner />

        <div id="cardapio" className="mx-auto w-full max-w-6xl px-4 py-4 pb-24">
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-experience.tsx`
Expected: no errors.

- [ ] **Step 4: Run full test suite (regression check)**

Run: `npx vitest run`
Expected: PASS (same count as before this phase — no new test files).

- [ ] **Step 5: Commit**

```bash
git add features/menu/components/store-experience.tsx
git commit -m "feat(menu): render promo banner between Home and Cardápio"
```

---

### Task 3: Full validation pass

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
Expected: all tests pass (this phase adds no new test files — same count as the end of Fase 4).

- [ ] **Step 5: HTML verification pass**

No browser automation tooling is available in this environment (known, accepted limitation, documented in BACKLOG.md). Do NOT simulate or claim to observe hover/click/scroll behavior. Instead:

Start the dev server (or reuse one already running — check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` first) and fetch the rendered HTML of the storefront home page. Confirm via the actual HTML you fetch (quote what you see):
- A `<section id="promocoes"...>` element exists in the markup.
- The text "Fique de olho nas nossas promoções" appears inside it.
- A "Ver Cardápio" button/text exists inside `#promocoes` (distinct from the one already inside `#home`).
- The `#promocoes` section appears in the HTML source after `#home` and before `#cardapio` (confirms render order).

- [ ] **Step 6: `git status` check**

Run: `git status`
Expected: clean tree, no changes outside the files listed in this plan's File Structure table (plus this session's already-committed spec/plan docs).

- [ ] **Step 7: Commit (if anything was fixed during validation)**

```bash
git add -A
git commit -m "fix(menu): address validation findings from promo banner pass"
```

(Skip this step if validation found nothing to fix — no empty commits.)
