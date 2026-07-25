# Cardápio Premium (Fase 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the existing `ProductCard` and `MenuSection` visuals (taller product images, richer hover lift, bolder category headers) and add a "Cardápio" nav header above the category list in both the desktop sidebar and mobile drawer — a small, CSS/JSX-only phase after the prior phase's scope review ruled out real "Mais Vendido"/"Promoção" tags and per-category description/image (no public data exists for them without touching `services`/`repositories`, which is out of scope).

**Architecture:** Four small, independent class/markup edits to already-existing components. No new files, no new components, no new data flow.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Tailwind CSS v4 (semantic tokens), `lucide-react` (`UtensilsCrossed`).

## Global Constraints

- Frontend-only. Do NOT modify: `services/`, `repositories/`, database schema, `checkout`, cart logic, realtime, admin panel, kitchen panel, printing, QR code.
- Do NOT add any new product badge/tag not already backed by real data (`isFeatured`, `isNew` are real; "Mais Vendido", "Promoção", "Artesanal" are explicitly out of scope this phase — confirmed with the user).
- Do NOT add category description/image — the public `MenuCategory` type has no such fields.
- The new "Cardápio" nav entry has no `aria-current`/active-state logic of its own — the categories rendered beneath it already show their own active state via the existing ScrollSpy. Keep it a plain static link/button.
- No new npm dependencies. No new Supabase calls.
- Test convention (same as prior phases): Vitest covers pure logic only. All four edits in this phase are pure CSS/JSX changes with no new logic — no new test files. Validated via typecheck/lint/build + full suite regression + HTML fetch from the dev server (browser interaction verification remains unavailable in this environment, per prior phases).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `features/menu/components/product-card.tsx` | Modify | Taller image aspect ratio, richer hover (scale added to existing lift/shadow). |
| `features/menu/components/menu-section.tsx` | Modify | Bolder/bigger category header, subtle bottom border separator. |
| `features/menu/components/store-sidebar.tsx` | Modify | Add a static "Cardápio" nav header link above the category list. |
| `features/menu/components/store-mobile-nav.tsx` | Modify | Same "Cardápio" nav header, drawer version, with its own `goToCardapio` handler. |

---

### Task 1: Polish ProductCard

**Files:**
- Modify: `features/menu/components/product-card.tsx`

**Interfaces:**
- No signature change — `ProductCard({ product }: { product: Product })` unchanged.

No test: pure CSS class changes on an existing presentational component.

- [ ] **Step 1: Change the image aspect ratio**

Find:

```tsx
      <div className="relative aspect-5/4 w-full overflow-hidden bg-gradient-to-br from-primary/15 via-accent/20 to-accent/40">
```

Replace with:

```tsx
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-primary/15 via-accent/20 to-accent/40">
```

- [ ] **Step 2: Add hover scale to the card lift**

Find:

```tsx
    <Card
      className={cn(
        "group gap-0 py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
        unavailable && "opacity-75 hover:translate-y-0 hover:shadow-sm",
      )}
    >
```

Replace with:

```tsx
    <Card
      className={cn(
        "group gap-0 py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl",
        unavailable && "opacity-75 hover:scale-100 hover:translate-y-0 hover:shadow-sm",
      )}
    >
```

(The `unavailable` branch also gets `hover:scale-100` added, so an unavailable product's card doesn't scale up on hover either — consistent with it already suppressing the lift/shadow.)

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/product-card.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add features/menu/components/product-card.tsx
git commit -m "feat(menu): polish product card image ratio and hover lift"
```

---

### Task 2: Polish MenuSection header

**Files:**
- Modify: `features/menu/components/menu-section.tsx`

**Interfaces:**
- No signature change — `MenuSection({ section }: { section: StoreSection })` unchanged.

No test: pure CSS class changes.

- [ ] **Step 1: Update the header markup**

Find:

```tsx
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <CategoryIcon slug={section.slug} className="size-5" />
        </span>
        <h2
          id={`titulo-${section.slug}`}
          className="text-xl font-bold tracking-tight sm:text-2xl"
        >
          {section.title}
        </h2>
        <span className="text-sm text-muted-foreground tabular-nums">
          {count} {count === 1 ? "item" : "itens"}
        </span>
      </div>
```

Replace with:

```tsx
      <div className="mb-6 flex items-center gap-3 border-b pb-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <CategoryIcon slug={section.slug} className="size-6" />
        </span>
        <h2
          id={`titulo-${section.slug}`}
          className="text-2xl font-black tracking-tight sm:text-3xl"
        >
          {section.title}
        </h2>
        <span className="text-sm text-muted-foreground tabular-nums">
          {count} {count === 1 ? "item" : "itens"}
        </span>
      </div>
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/menu-section.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/components/menu-section.tsx
git commit -m "feat(menu): bolder category section headers"
```

---

### Task 3: Add "Cardápio" nav header to the desktop sidebar

**Files:**
- Modify: `features/menu/components/store-sidebar.tsx`

**Interfaces:**
- Consumes: `UtensilsCrossed` (`lucide-react`), `scrollToSection` (already imported).
- Produces: no change to `StoreSidebar`'s prop signature.

- [ ] **Step 1: Add the icon import**

Replace:

```tsx
import { ArrowRight, Home, Info, Phone } from "lucide-react";
```

with:

```tsx
import { ArrowRight, Home, Info, Phone, UtensilsCrossed } from "lucide-react";
```

- [ ] **Step 2: Insert the "Cardápio" header link**

Find:

```tsx
              <Phone className="size-5" aria-hidden />
              <span className="flex-1 truncate">Contato</span>
            </a>
          </li>

          {sections.map((section) => {
```

Replace with:

```tsx
              <Phone className="size-5" aria-hidden />
              <span className="flex-1 truncate">Contato</span>
            </a>
          </li>

          <li className="pt-2">
            <a
              href="#cardapio"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("cardapio");
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              <UtensilsCrossed className="size-4" aria-hidden />
              Cardápio
            </a>
          </li>

          {sections.map((section) => {
```

(The existing `{sections.map((section) => { ... })}` body, its closing `})}`, and the closing `</ul>`/`</nav>` are unchanged.)

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-sidebar.tsx`
Expected: no errors.

- [ ] **Step 4: Run full test suite (regression check)**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/menu/components/store-sidebar.tsx
git commit -m "feat(menu): add Cardápio nav header above category list (sidebar)"
```

---

### Task 4: Add "Cardápio" nav header to the mobile drawer

**Files:**
- Modify: `features/menu/components/store-mobile-nav.tsx`

**Interfaces:**
- Consumes: `UtensilsCrossed` (`lucide-react`), `scrollToSection` (already imported).
- Produces: no change to `StoreMobileNav`'s prop signature.

- [ ] **Step 1: Add the icon import**

Replace:

```tsx
import { Home, Info, Phone } from "lucide-react";
```

with:

```tsx
import { Home, Info, Phone, UtensilsCrossed } from "lucide-react";
```

- [ ] **Step 2: Add a `goToCardapio` handler**

Find:

```tsx
  function goToContato() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("contato"), 200);
  }
```

Replace with:

```tsx
  function goToContato() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("contato"), 200);
  }

  function goToCardapio() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("cardapio"), 200);
  }
```

- [ ] **Step 3: Insert the "Cardápio" header button**

Find:

```tsx
                <Phone className="size-5" aria-hidden />
                <span className="flex-1 truncate">Contato</span>
              </button>
            </li>

            {sections.map((section) => (
```

Replace with:

```tsx
                <Phone className="size-5" aria-hidden />
                <span className="flex-1 truncate">Contato</span>
              </button>
            </li>

            <li className="pt-2">
              <button
                type="button"
                onClick={goToCardapio}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase transition-colors hover:text-primary"
              >
                <UtensilsCrossed className="size-4" aria-hidden />
                Cardápio
              </button>
            </li>

            {sections.map((section) => (
```

(The existing `{sections.map((section) => ( ... ))}` body and closing `</ul>` are unchanged.)

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-mobile-nav.tsx`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add features/menu/components/store-mobile-nav.tsx
git commit -m "feat(menu): add Cardápio nav header above category list (mobile drawer)"
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
Expected: all 99 tests pass (this phase adds no new test files).

- [ ] **Step 5: HTML verification pass**

No browser automation tooling is available in this environment (known, accepted limitation, documented in BACKLOG.md). Do NOT simulate or claim to observe hover/click/scroll behavior. Instead:

Start the dev server (or reuse one already running — check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` first) and fetch the rendered HTML of the storefront home page. Confirm via the actual HTML you fetch (quote what you see):
- A product card's image wrapper has the `aspect-4/3` class (not `aspect-5/4`).
- A category section header contains `text-2xl font-black` and a `border-b` class.
- The sidebar markup shows a "Cardápio" link/text between "Contato" and the first category, with an `href="#cardapio"`.

- [ ] **Step 6: `git status` check**

Run: `git status`
Expected: clean tree, no changes outside the files listed in this plan's File Structure table (plus this session's already-committed spec/plan docs).

- [ ] **Step 7: Commit (if anything was fixed during validation)**

```bash
git add -A
git commit -m "fix(menu): address validation findings from menu polish pass"
```

(Skip this step if validation found nothing to fix — no empty commits.)
