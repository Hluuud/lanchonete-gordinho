# Sobre Nós / Contato / Footer (Fase 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three institutional sections to the client storefront — "Sobre Nós" (`#sobre`), "Contato" (`#contato`, with an embedded Google Maps iframe), and a page-wide footer — and wire "Sobre Nós"/"Contato" into both the desktop sidebar and mobile drawer navigation as the 2nd/3rd nav items, without touching any backend layer.

**Architecture:** Three new presentational components (`StoreAbout`, `StoreContactSection`, `StoreFooter`) rendered inside `StoreExperience`, after the existing `#cardapio` content block. `contact-info.ts` (Fase 1) gains two additions — `SLOGAN` (relocated from `store-sidebar.tsx`, now also needed by the Footer) and `MAPS_EMBED_LINK` (a new derived constant, same pattern as the existing `MAPS_LINK`). `StoreSidebar` and `StoreMobileNav` each get two more static nav entries, following the exact pattern already established for "Home" in Fase 2.

**Tech Stack:** Next.js 16 / React 19, TypeScript, Tailwind CSS v4 (semantic tokens, no hardcoded colors), `lucide-react` (`Info`, `Phone`, `MapPin`, `Clock`, `MessageCircle`, `Navigation`, `Users`, `Award`, `Flame`, `Store`), existing `Button` (`components/ui/button.tsx`), existing `StoreOpenBadge` (hydration-safe open/closed status, reused rather than re-implemented), existing `InstagramIcon`/`FacebookIcon` (`features/menu/social-icons.tsx`).

## Global Constraints

- Frontend-only. Do NOT modify: `services/`, `repositories/`, database schema, `checkout`, cart logic, realtime, admin panel, kitchen panel, printing, QR code.
- Do NOT modify the theme token blocks in `styles/globals.css` — semantic tokens only (`--primary`, `--foreground`, `--background`, `--secondary`, `--muted-foreground`, `--card`), no hardcoded colors.
- "Sobre Nós" copy is approved draft text (not a gray placeholder), to be used verbatim — see Task 2 for the exact strings.
- No product/environment photos — no real image exists yet. Use icon-on-gradient placeholders (same visual language as the Fase 2 Hero placeholder), never a stock-photo-style generic image.
- The Google Maps embed uses the no-API-key public embed URL format (`https://www.google.com/maps?q=<address>&output=embed`) — an external call to Google, not Supabase; does not violate "no new Supabase calls." `loading="lazy"` on the iframe.
- The Contato section's "Horário" must reuse the existing `StoreOpenBadge` component (`features/menu/components/store-open-badge.tsx`) rather than calling `getStoreOpenState(new Date())` directly — `StoreOpenBadge` already solves the SSR/hydration-mismatch risk of rendering the current time; a direct call would reintroduce a bug this codebase already fixed once.
- The Footer's "Links úteis" are in-page anchors only (`#home`, `#cardapio`, `#sobre`, `#contato`) using plain `<a href="#id">` (no `onClick`/`scrollToSection`) — no invented pages (privacy policy, terms of use, etc. don't exist).
- "Sobre Nós" and "Contato" are static nav entries (not derived from `sections`), added as the 2nd/3rd items in both `StoreSidebar` and `StoreMobileNav` (after "Home", before the dynamic category list) — same mechanism already used for "Home" in Fase 2.
- No new npm dependencies. No new Supabase calls.
- Test convention (same as prior phases): Vitest covers pure logic only. The two new `contact-info.ts` exports get test coverage (mirrors existing `MAPS_LINK` test). `StoreAbout`, `StoreContactSection`, `StoreFooter`, and the sidebar/drawer nav-entry additions are presentational — no new unit test files for those, validated via typecheck/lint/build + full suite regression + HTML fetch from the dev server (same approach used at the end of Fase 2, since browser interaction verification remains unavailable in this environment).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `features/menu/contact-info.ts` | Modify | Add `SLOGAN` (relocated) and `MAPS_EMBED_LINK` (new derived constant). |
| `features/menu/contact-info.test.ts` | Modify | Add assertions for `SLOGAN` and `MAPS_EMBED_LINK`. |
| `features/menu/components/store-about.tsx` | Create | "Sobre Nós" section (`#sobre`): history text, mission/quality/specialty feature grid, two image placeholders. |
| `features/menu/components/store-contact-section.tsx` | Create | "Contato" section (`#contato`): embedded map, address/phone/hours/social cards, "Como chegar" button. |
| `features/menu/components/store-footer.tsx` | Create | Page-wide institutional footer: company/contact/useful-links/social columns + copyright line. |
| `features/menu/components/store-experience.tsx` | Modify | Render `<StoreAbout />`, `<StoreContactSection />`, `<StoreFooter />` after the existing `#cardapio` block. |
| `features/menu/components/store-sidebar.tsx` | Modify | Import `SLOGAN` from `contact-info.ts` instead of a local constant; add "Sobre Nós"/"Contato" static nav entries; extend `useScrollSpy` ids. |
| `features/menu/components/store-mobile-nav.tsx` | Modify | Add "Sobre Nós"/"Contato" static nav buttons with their own handlers, same pattern as `goToHome`. |

---

### Task 1: Extend contact-info.ts (SLOGAN + MAPS_EMBED_LINK)

**Files:**
- Modify: `features/menu/contact-info.ts`
- Modify: `features/menu/contact-info.test.ts`

**Interfaces:**
- Produces: `SLOGAN: string` (new export), `MAPS_EMBED_LINK: string` (new export). Consumed by Task 2 (`store-about.tsx` — not directly, see below), Task 3 (`store-contact-section.tsx`, `MAPS_EMBED_LINK`), Task 4 (`store-footer.tsx`, `SLOGAN`), Task 6 (`store-sidebar.tsx`, `SLOGAN`).

- [ ] **Step 1: Write the failing test**

Replace the full contents of `features/menu/contact-info.test.ts` with:

```typescript
import { describe, expect, it } from "vitest";

import {
  ADDRESS,
  CNPJ,
  EMAIL,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_EMBED_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  SLOGAN,
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
    expect(SLOGAN).toBe("Sabor que aquece, feito com carinho");
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

  it("codifica o endereço no link de embed do Google Maps", () => {
    expect(MAPS_EMBED_LINK).toBe(
      "https://www.google.com/maps?q=" +
        encodeURIComponent(ADDRESS) +
        "&output=embed",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run features/menu/contact-info.test.ts`
Expected: FAIL — `SLOGAN` and `MAPS_EMBED_LINK` are not exported yet.

- [ ] **Step 3: Write the implementation**

Replace the full contents of `features/menu/contact-info.ts` with:

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

export const SLOGAN = "Sabor que aquece, feito com carinho";

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
/** Embed público do Google Maps — sem chave de API, só o endereço na URL. */
export const MAPS_EMBED_LINK = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run features/menu/contact-info.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add features/menu/contact-info.ts features/menu/contact-info.test.ts
git commit -m "feat(menu): add SLOGAN and MAPS_EMBED_LINK to contact-info"
```

---

### Task 2: "Sobre Nós" section

**Files:**
- Create: `features/menu/components/store-about.tsx`

**Interfaces:**
- Produces: `StoreAbout()` — a section with `id="sobre"`. Consumed by Task 5 (`store-experience.tsx`).
- Consumes: `Award`, `Flame`, `Store`, `Users` (`lucide-react`).

No test: presentational component (approved static copy, no branching logic) — validated via typecheck/lint/build + manual/HTML check, per this codebase's Vitest-covers-pure-logic-only convention.

- [ ] **Step 1: Write the implementation**

Create `features/menu/components/store-about.tsx`:

```tsx
import { Award, Flame, Store, Users } from "lucide-react";

const ABOUT_TEXT =
  "A Lanchonete do Gordinho nasceu da paixão por lanches de verdade e do carinho em atender bem. Há anos servimos a comunidade de Analândia com ingredientes selecionados, porções generosas e aquele atendimento que faz todo mundo se sentir em casa. Do clássico X-Burger às porções pra compartilhar, cada lanche sai na hora, feito com capricho — porque pra gente, mais que lanches, a ideia é criar momentos.";

const ABOUT_FEATURES = [
  {
    icon: Users,
    title: "Missão",
    description:
      "Servir com carinho — cada pedido preparado pra você se sentir em casa.",
  },
  {
    icon: Award,
    title: "Qualidade",
    description:
      "Ingredientes selecionados, sempre frescos, escolhidos com cuidado.",
  },
  {
    icon: Flame,
    title: "Especialidade",
    description:
      "Feito na hora — hambúrgueres e porções montados no pedido, sem pressa.",
  },
] as const;

/**
 * Seção institucional (`#sobre`): história, missão/qualidade/especialidade
 * e dois placeholders de imagem (ambiente/lanches — nenhuma foto real
 * cadastrada ainda, mesmo tratamento do placeholder do Hero).
 */
export function StoreAbout() {
  return (
    <section
      id="sobre"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl leading-tight font-black text-balance lg:text-4xl">
            Sobre a Lanchonete do Gordinho
          </h2>
          <p className="text-base text-muted-foreground lg:text-lg">
            {ABOUT_TEXT}
          </p>
          <p className="text-sm font-semibold text-primary">
            Há anos servindo Analândia com o mesmo capricho.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-secondary to-foreground/10">
            <Store
              className="size-16 text-primary/50"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary/70 to-foreground">
            <Flame
              className="size-16 text-background/30"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {ABOUT_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-6"
          >
            <feature.icon className="size-8 text-primary" aria-hidden />
            <h3 className="text-base font-bold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-about.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/components/store-about.tsx
git commit -m "feat(menu): add store about section"
```

---

### Task 3: "Contato" section

**Files:**
- Create: `features/menu/components/store-contact-section.tsx`

**Interfaces:**
- Produces: `StoreContactSection()` — a section with `id="contato"`. Consumed by Task 5 (`store-experience.tsx`).
- Consumes: `Button` (`@/components/ui/button`), `StoreOpenBadge` (`@/features/menu/components/store-open-badge`), `ADDRESS`/`FACEBOOK_LINK`/`INSTAGRAM_LINK`/`MAPS_EMBED_LINK`/`MAPS_LINK`/`PHONE_DISPLAY`/`PHONE_TEL_LINK`/`WHATSAPP_LINK` (`@/features/menu/contact-info`, Task 1), `FacebookIcon`/`InstagramIcon` (`@/features/menu/social-icons`), `Clock`/`MapPin`/`MessageCircle`/`Navigation`/`Phone` (`lucide-react`).

No test: presentational component — validated via typecheck/lint/build + manual/HTML check.

- [ ] **Step 1: Write the implementation**

Create `features/menu/components/store-contact-section.tsx`:

```tsx
import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StoreOpenBadge } from "@/features/menu/components/store-open-badge";
import {
  ADDRESS,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  MAPS_EMBED_LINK,
  MAPS_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import { FacebookIcon, InstagramIcon } from "@/features/menu/social-icons";

const SOCIAL_LINK_CLASS =
  "flex size-11 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary";

/**
 * Seção de contato (`#contato`): mapa embutido (Google Maps, sem chave de
 * API) + cards de endereço/telefone/horário/redes + botão "Como chegar".
 * Layout próprio (não reaproveita o `StoreContactFooter` compacto da
 * sidebar) — mesmas constantes de dado, visual maior/mais rico. O card de
 * horário reaproveita `StoreOpenBadge` em vez de chamar
 * `getStoreOpenState(new Date())` direto, pra não reintroduzir o problema
 * de hydration mismatch que aquele componente já resolve.
 */
export function StoreContactSection() {
  return (
    <section
      id="contato"
      className="mx-auto w-full max-w-6xl px-4 py-16 lg:scroll-mt-20 lg:px-8"
    >
      <h2 className="text-3xl leading-tight font-black text-balance lg:text-4xl">
        Onde estamos
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border">
          <iframe
            src={MAPS_EMBED_LINK}
            loading="lazy"
            title={`Mapa de localização — ${ADDRESS}`}
            className="h-80 w-full lg:h-full"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <MapPin
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold">Endereço</p>
              <p className="text-sm text-muted-foreground">{ADDRESS}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <Phone
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold">Telefone</p>
              <a
                href={PHONE_TEL_LINK}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <Clock
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold">Horário</p>
              <div className="mt-1">
                <StoreOpenBadge />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={SOCIAL_LINK_CLASS}
            >
              <MessageCircle className="size-5" aria-hidden />
            </a>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={SOCIAL_LINK_CLASS}
            >
              <InstagramIcon className="size-5" />
            </a>
            <a
              href={FACEBOOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={SOCIAL_LINK_CLASS}
            >
              <FacebookIcon className="size-5" />
            </a>
          </div>

          <Button asChild size="lg" className="w-full rounded-full sm:w-fit">
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
              Como chegar
              <Navigation className="size-4" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-contact-section.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/components/store-contact-section.tsx
git commit -m "feat(menu): add store contact section with embedded map"
```

---

### Task 4: Institutional footer

**Files:**
- Create: `features/menu/components/store-footer.tsx`

**Interfaces:**
- Produces: `StoreFooter()`. Consumed by Task 5 (`store-experience.tsx`).
- Consumes: `BrandLogo` (`@/components/brand-logo`), `ADDRESS`/`CNPJ`/`EMAIL`/`FACEBOOK_LINK`/`INSTAGRAM_LINK`/`PHONE_DISPLAY`/`PHONE_TEL_LINK`/`SLOGAN`/`WHATSAPP_LINK` (`@/features/menu/contact-info`, Task 1), `FacebookIcon`/`InstagramIcon` (`@/features/menu/social-icons`), `MessageCircle` (`lucide-react`).

No test: presentational component.

- [ ] **Step 1: Write the implementation**

Create `features/menu/components/store-footer.tsx`:

```tsx
import { MessageCircle } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import {
  ADDRESS,
  CNPJ,
  EMAIL,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  PHONE_DISPLAY,
  PHONE_TEL_LINK,
  SLOGAN,
  WHATSAPP_LINK,
} from "@/features/menu/contact-info";
import { FacebookIcon, InstagramIcon } from "@/features/menu/social-icons";

const USEFUL_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Cardápio", href: "#cardapio" },
  { label: "Sobre Nós", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

const SOCIAL_LINK_CLASS =
  "flex size-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary";

/**
 * Rodapé institucional da página — aparece uma única vez, ao final do
 * scroll. Sem `onClick`/`scrollToSection`: os links de âncora usam salto
 * direto do navegador (`<a href="#id">` puro), já que é o fim da página.
 */
export function StoreFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <p className="font-extrabold">Lanchonete do Gordinho</p>
          </div>
          <p className="text-sm text-muted-foreground">{SLOGAN}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Contato</p>
          <a
            href={PHONE_TEL_LINK}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {EMAIL}
          </a>
          <p className="text-sm text-muted-foreground">{ADDRESS}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Links úteis</p>
          {USEFUL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Redes sociais</p>
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground lg:px-8">
        © {year} Lanchonete do Gordinho — CNPJ {CNPJ}. Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-footer.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/menu/components/store-footer.tsx
git commit -m "feat(menu): add store institutional footer"
```

---

### Task 5: Wire the three sections into the storefront layout

**Files:**
- Modify: `features/menu/components/store-experience.tsx`

**Interfaces:**
- Consumes: `StoreAbout` (Task 2), `StoreContactSection` (Task 3), `StoreFooter` (Task 4).
- Produces: no change to `StoreExperience`'s own signature (`{ menu: Menu }`).

- [ ] **Step 1: Add the imports**

In `features/menu/components/store-experience.tsx`, add to the imports (near the other `features/menu/components/*` imports):

```typescript
import { StoreAbout } from "@/features/menu/components/store-about";
import { StoreContactSection } from "@/features/menu/components/store-contact-section";
import { StoreFooter } from "@/features/menu/components/store-footer";
```

- [ ] **Step 2: Render the three sections after the existing #cardapio block**

Find this block (the end of the file):

```tsx
          </div>
        </div>
      </div>
    </div>
  );
}
```

Replace it with:

```tsx
          </div>
        </div>

        <StoreAbout />
        <StoreContactSection />
        <StoreFooter />
      </div>
    </div>
  );
}
```

(This inserts the three new sections right after the closing `</div>` of the `#cardapio` wrapper, still inside the `<div className="flex min-w-0 flex-1 flex-col">` right-column wrapper, before that wrapper's own closing `</div>`.)

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-experience.tsx`
Expected: no errors.

- [ ] **Step 4: Run full test suite (regression check)**

Run: `npx vitest run`
Expected: PASS — no test touches `StoreExperience` directly, this is a regression guard only.

- [ ] **Step 5: Commit**

```bash
git add features/menu/components/store-experience.tsx
git commit -m "feat(menu): render about, contact, and footer sections"
```

---

### Task 6: Add "Sobre Nós"/"Contato" to the desktop sidebar nav

**Files:**
- Modify: `features/menu/components/store-sidebar.tsx`

**Interfaces:**
- Consumes: `SLOGAN` (`@/features/menu/contact-info`, Task 1), `Info`, `Phone` (`lucide-react`).
- Produces: no change to `StoreSidebar`'s prop signature.

- [ ] **Step 1: Replace the local SLOGAN constant with an import**

Replace:

```tsx
import { ArrowRight, Home } from "lucide-react";

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
```

with:

```tsx
import { ArrowRight, Home, Info, Phone } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/features/menu/category-icon";
import { StoreContactFooter } from "@/features/menu/components/store-contact-footer";
import { SLOGAN } from "@/features/menu/contact-info";
import { scrollToSection } from "@/features/menu/scroll-to-section";
import { useScrollSpy } from "@/features/menu/use-scroll-spy";
import {
  sectionAnchorId,
  type StoreSection,
} from "@/features/menu/virtual-sections";
import { SearchBar } from "@/features/search/components/search-bar";
import { cn } from "@/lib/utils";
```

- [ ] **Step 2: Extend the ScrollSpy id list**

Replace:

```tsx
  const activeId = useScrollSpy(
    ["home", ...sections.map((section) => sectionAnchorId(section.slug))],
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );
```

with:

```tsx
  const activeId = useScrollSpy(
    [
      "home",
      "sobre",
      "contato",
      ...sections.map((section) => sectionAnchorId(section.slug)),
    ],
    // Linha de detecção logo abaixo do `lg:scroll-mt-20` (80px) das seções —
    // garante que a seção clicada fique ativa ao final do scroll suave.
    { topOffsetPx: 84 },
  );
```

- [ ] **Step 3: Add the two static nav entries**

Find:

```tsx
              <Home className="size-5" aria-hidden />
              <span className="flex-1 truncate">Home</span>
            </a>
          </li>

          {sections.map((section) => {
```

Replace with:

```tsx
              <Home className="size-5" aria-hidden />
              <span className="flex-1 truncate">Home</span>
            </a>
          </li>

          <li>
            <a
              href="#sobre"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("sobre");
              }}
              aria-current={activeId === "sobre" ? "true" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeId === "sobre"
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Info className="size-5" aria-hidden />
              <span className="flex-1 truncate">Sobre Nós</span>
            </a>
          </li>

          <li>
            <a
              href="#contato"
              onClick={(event) => {
                event.preventDefault();
                scrollToSection("contato");
              }}
              aria-current={activeId === "contato" ? "true" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activeId === "contato"
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Phone className="size-5" aria-hidden />
              <span className="flex-1 truncate">Contato</span>
            </a>
          </li>

          {sections.map((section) => {
```

(The existing `{sections.map((section) => { ... })}` body, its closing `})}`, and the closing `</ul>`/`</nav>` are unchanged.)

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint features/menu/components/store-sidebar.tsx`
Expected: no errors.

- [ ] **Step 5: Run full test suite (regression check)**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add features/menu/components/store-sidebar.tsx
git commit -m "feat(menu): add Sobre Nós and Contato entries to desktop sidebar"
```

---

### Task 7: Add "Sobre Nós"/"Contato" to the mobile drawer nav

**Files:**
- Modify: `features/menu/components/store-mobile-nav.tsx`

**Interfaces:**
- Consumes: `Info`, `Phone` (`lucide-react`).
- Produces: no change to `StoreMobileNav`'s prop signature.

- [ ] **Step 1: Add the icon imports**

Replace:

```tsx
import { Home } from "lucide-react";
```

with:

```tsx
import { Home, Info, Phone } from "lucide-react";
```

- [ ] **Step 2: Add `goToSobre`/`goToContato` handlers**

Replace:

```tsx
  function goToHome() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("home"), 200);
  }
```

with:

```tsx
  function goToHome() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("home"), 200);
  }

  function goToSobre() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("sobre"), 200);
  }

  function goToContato() {
    onOpenChange(false);
    window.setTimeout(() => scrollToSection("contato"), 200);
  }
```

- [ ] **Step 3: Add the two static nav buttons**

Find:

```tsx
                <Home className="size-5" aria-hidden />
                <span className="flex-1 truncate">Home</span>
              </button>
            </li>

            {sections.map((section) => (
```

Replace with:

```tsx
                <Home className="size-5" aria-hidden />
                <span className="flex-1 truncate">Home</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={goToSobre}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary active:bg-primary/15"
              >
                <Info className="size-5" aria-hidden />
                <span className="flex-1 truncate">Sobre Nós</span>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={goToContato}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary active:bg-primary/15"
              >
                <Phone className="size-5" aria-hidden />
                <span className="flex-1 truncate">Contato</span>
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
git commit -m "feat(menu): add Sobre Nós and Contato entries to mobile drawer"
```

---

### Task 8: Full validation pass

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
Expected: all tests pass (previous 98 + 1 new assertion added to `contact-info.test.ts` in Task 1 — same file, so the total test *count* stays the same unless a new `it(...)` was added; confirm against the actual file from Task 1, which adds one new `it` block, so expect 99).

- [ ] **Step 5: HTML verification pass**

No browser automation tooling is available in this environment (known, accepted limitation, documented in BACKLOG.md for prior phases). Do NOT simulate or claim to observe clicks, scrolling, or hover states. Instead:

Start the dev server (or reuse one already running — check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` first) and fetch the rendered HTML of the storefront home page. Confirm via the actual HTML you fetch (quote what you see):
- `<section id="sobre">` is present with the heading "Sobre a Lanchonete do Gordinho" and the approved body text.
- `<section id="contato">` is present with an `<iframe>` pointing at `google.com/maps` and a "Como chegar" link/button.
- A `<footer>` element is present with the copyright line containing the current year and the CNPJ.
- The sidebar markup shows "Sobre Nós" and "Contato" as nav entries, in that order, between "Home" and the first category.

- [ ] **Step 6: `git status` check**

Run: `git status`
Expected: clean tree, no changes outside the files listed in this plan's File Structure table (plus this session's already-committed spec/plan docs).

- [ ] **Step 7: Commit (if anything was fixed during validation)**

```bash
git add -A
git commit -m "fix(menu): address validation findings from about/contact/footer pass"
```

(Skip this step if validation found nothing to fix — no empty commits.)
