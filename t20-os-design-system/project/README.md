# T20 OS Design System

## Overview

**T20 OS** is a "world-first operating system for GMs" — a full-stack web application for running Tormenta 20 (Brazilian tabletop RPG) campaigns. It centralizes the real GM workflow: worldbuilding, session prep, live table operation, and world memory.

**Brand positioning:** Premium, cinematic, epic. Feels like a digitized rulebook from the Tormenta universe. Dark, atmospheric, powerful.

**Primary language:** Brazilian Portuguese (product copy, navigation). Technical code in English.

**Author:** Guilherme Costa Proenca — [@GuilhermeCostaProenca](https://github.com/GuilhermeCostaProenca)

---

## Sources

- **Codebase:** `t20-rpg-toolkit/` (local mount — Next.js 16, React 19, Tailwind CSS 4, Radix UI, Framer Motion, Prisma/PostgreSQL)
- **GitHub repo:** `GuilhermeCostaProenca/t20-rpg-toolkit` (inaccessible during build — 404; all design context derived from the mounted codebase)
- **Key files read:** `src/app/globals.css`, `src/components/brand.tsx`, `src/components/app-sidebar.tsx`, `src/components/landing/*`, `src/components/ui/*`

---

## Products / Surfaces

| Surface | Description |
|---|---|
| **Landing page** | Marketing site — hero, features, how-to, CTA |
| **App shell** | GM cockpit — sidebar nav, world context, module routing |
| **Modules** | Codex, Forja, Mesa ao Vivo, Memória, Balanceamento, Graph, Atlas |

---

## CONTENT FUNDAMENTALS

### Language & Tone

- **Brazilian Portuguese first** for all product copy, nav labels, and product naming
- **Technical infrastructure** stays in English (code, configs, type names)
- **Tone:** Serious, masterful, cinematic. No fluff, no casual banter. Reads like a premium game manual or military briefing.
- **Capitalization:** Product module names are Title Case in Portuguese (Codex do Mundo, Mesa ao Vivo, Forja de Sessão). UI labels are Title Case. Body copy is sentence case.
- **Voice:** 2nd person singular ("você"), addressing the GM as a master strategist. Empowering, not instructional.
- **Emoji:** Never used in product UI. Zero emoji anywhere.
- **Numbers/stats:** Used sparingly and meaningfully — no data slop.

### Copy examples (from codebase)
- "Um cockpit de fantasia para mestres que levam o mundo a sério"
- "Crie, prepare e opere campanhas Tormenta 20 em um fluxo único: do worldbuilding até a mesa ao vivo."
- "Mundo primeiro, campanha como linha do tempo."
- "Cockpit contínuo em vez de navegação fragmentada."
- "Operação testada para campanhas longas e mesa intensa"

### Product naming conventions
- Modules use evocative Portuguese names: **Codex** (not "Compêndio"), **Forja** (not "Editor"), **Mesa ao Vivo** (not "Sessão"), **Memória** (not "Histórico")
- Short eyebrow labels use ALL-CAPS tracking: "MUNDO", "MESA", "APOIO"
- Status badges are concise: "Em operação", "Hot", "Centro"

---

## VISUAL FOUNDATIONS

### Color System

**Base palette (light theme — app uses dark exclusively):**
- Background: `#06070c` — near-black with blue-purple tint
- Foreground: `#f4efe7` — warm parchment white
- Primary (blood red): `#bc4a3f`
- Primary dark: `#6b1220`
- Gold/amber: `#d5a240` (chart-4)
- Muted background: `#1a1821`
- Muted foreground: `#b5aea4`
- Sidebar: `rgba(9,9,14,0.96)`
- Card: `rgba(15,14,20,0.94)`
- Border: `rgba(255,255,255,0.08)`
- Ring: `rgba(188,74,63,0.65)`

**Theme philosophy:** Single dark theme. No light mode. The darkness is intentional — it's the candlelit GM screen aesthetic.

### Typography

- **Display (h1):** `ui-serif, Georgia, Cambria, serif` — used explicitly in hero. Substitute: **Cinzel** (Google Fonts). Uppercase, weight 800, letter-spacing 0.02em.
- **Body:** `--font-geist-sans` (Geist Sans from Vercel). Substitute: **DM Sans** (Google Fonts). Clean, modern, slightly condensed feel.
- **Mono:** `--font-geist-mono` (Geist Mono). Substitute: **JetBrains Mono** (Google Fonts). Used for code, data, terminal surfaces.
- **Eyebrow labels:** 0.72rem, weight 700, letter-spacing 0.22em, uppercase, gold color `rgba(245,221,177,0.78)` — the `.section-eyebrow` class.

**⚠ Font substitution:** Geist Sans and Geist Mono are Vercel-proprietary. This design system uses **DM Sans** and **JetBrains Mono** from Google Fonts as closest visual matches. Request original TTF files from the team for pixel-perfect reproduction.

### Backgrounds

- **Body:** Deep radial gradients — red glow at 12%/18%, gold at 78%/12%, blue at 72%/68%, base `#06070c`
- **Grain texture:** `::after` pseudo-element with repeating diagonal gradient at opacity 0.55 — gives parchment/aged paper feel
- **Panels:** `backdrop-blur-xl` + semi-transparent backgrounds — glassmorphism
- **Hero:** Full-bleed video (Arton map fly-over) with vignette overlay
- **No gradients as backgrounds** — gradients are used as ambient glow layers on top of solid dark backgrounds, never as the primary fill

### Cards & Panels

Two main card styles:
- **`.chrome-panel`:** Gold/red ambient glow, `box-shadow: 0 20px 80px rgba(0,0,0,0.55)`, `border: 1px solid rgba(255,255,255,0.06)` — used for sidebar info blocks
- **`.cinematic-frame`:** Darker, more contained, top-left red glow — used for content cards and priority items
- Corner radius: `--radius: 0.9rem` (14.4px). Cards use `rounded-xl` (12px) to `rounded-3xl` (24px).
- Borders: always `rgba(255,255,255,0.08)` — very subtle white
- Active state adds: `border-primary/25 bg-primary/12 shadow-[0_0_18px_rgba(188,74,63,0.18)]`

### Shadows & Elevation

- **Base:** `0 20px 80px rgba(0,0,0,0.55)`
- **Glow ring:** `0 0 0 1px rgba(188,74,63,0.25), 0 12px 40px rgba(0,0,0,0.35), 0 0 32px rgba(188,74,63,0.25)`
- **Sidebar shadow on active:** `0 0 18px rgba(188,74,63,0.18)`
- No physical drop-shadows — all elevation comes from glow and ambient light

### Animation

- **Library:** Framer Motion
- **Entry pattern:** `opacity: 0 → 1, y: 18–28px → 0`, duration 0.45–0.55s, no spring
- **Easing:** `[0.2, 0.65, 0.3, 0.9]` for nav, default ease for content
- **Stagger:** 0.1s between hero elements
- **Hover states:** `-translate-y-0.5` (slight lift) on primary buttons; `opacity` change on ghost buttons; `border-white/10 bg-white/5 text-foreground` on nav items
- **Scroll:** Navbar background transitions from transparent to opaque on scroll

### Iconography

See ICONOGRAPHY section below.

### Layout

- Max content width: `min(1320px, calc(100vw - 1.75rem))`
- App shell: sidebar (286px fixed) + main content area
- Grid: `.grid-shell` = `1.7fr 0.9fr` (collapses to 1fr at 1280px)
- Spacing: Tailwind spacing scale (gap-3, gap-6, p-4, p-6 most common)
- Navbar: floating pill (`rounded-2xl`), fixed top, backdrop blur

### Hover / Press States

- **Primary buttons:** `hover:bg-primary/90` — darken
- **Ghost nav items:** `hover:border-white/10 hover:bg-white/5 hover:text-foreground`
- **Link buttons (landing):** `hover:-translate-y-0.5` — subtle lift
- **Active nav:** Red glow ring + tinted background
- **Press:** No explicit scale-down; transition-based color changes only

### Color Vibe of Imagery

- Dark, atmospheric — de-saturated with contrast boost
- Warm tones (red/amber) emphasized
- No bright or saturated stock photos
- Video content uses `opacity: 0.18` with `saturate(1.2) contrast(1.1) brightness(0.7)` filter

---

## ICONOGRAPHY

- **Icon library:** [Lucide Icons](https://lucide.dev) — used via `lucide-react` package (CDN: `https://unpkg.com/lucide@latest`)
- **Style:** Outline/stroke icons, 16px (`h-4 w-4`) standard, 20px (`h-5 w-5`) for emphasis
- **Color:** Inherits text color; special colors: `text-amber-300/80` for priority/gold items, `text-primary/90` for active red items, `text-muted-foreground` for inactive
- **No emoji** anywhere in the product
- **No unicode chars as icons**
- **No custom SVG icons** — pure Lucide throughout
- **Usage:** Always paired with text labels in nav; standalone only in badges/indicators

**Icons used in nav (from codebase):**
`LayoutDashboard`, `Globe2`, `Flame`, `Crown`, `Waypoints`, `Images`, `Swords`, `Presentation`, `BookMarked`, `BookOpenText`, `ScrollText`, `Scale`, `Sparkles`, `Boxes`

**Assets folder:** `assets/arton-map.jpg` — the world map of Arton (Tormenta setting), used as hero video poster and visual reference background.

---

## File Index

```
README.md                  ← This file
SKILL.md                   ← Agent skill descriptor
colors_and_type.css        ← CSS design tokens (colors + typography)
assets/
  arton-map.jpg            ← World map of Arton (hero poster)
preview/
  colors-base.html         ← Base color palette swatches
  colors-semantic.html     ← Semantic color roles
  type-display.html        ← Display / heading typography
  type-body.html           ← Body + mono type specimens
  type-eyebrow.html        ← Eyebrow + label styles
  spacing-tokens.html      ← Radius, border, spacing tokens
  shadows-elevation.html   ← Shadow + glow system
  components-buttons.html  ← Button variants
  components-badges.html   ← Badge variants
  components-cards.html    ← Chrome panel + cinematic frame cards
  components-nav.html      ← Sidebar nav items + active states
  components-inputs.html   ← Input + select fields
  brand-logo.html          ← Brand logo + wordmark
  brand-background.html    ← Background texture + grain system
ui_kits/
  t20os/
    README.md              ← UI kit notes
    index.html             ← Interactive app prototype
    Sidebar.jsx            ← Sidebar component
    TopBar.jsx             ← Top bar component
    LandingPage.jsx        ← Landing page sections
    AppShell.jsx           ← App shell layout
    Cards.jsx              ← Card primitives
```
