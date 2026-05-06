---
name: t20-rpg-toolkit-design
description: Use this skill to generate well-branded interfaces and assets for t20-rpg-toolkit (T20 OS) — a world-first GM Operating System for Tormenta 20 campaigns. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

**Product name:** T20 OS · t20-rpg-toolkit
**Brand language:** Brazilian Portuguese (product); English (code)
**Tone:** Epic, cinematic, masterful. Like a premium RPG rulebook digitized.

**Core colors:**
- Background: `#06070c`
- Foreground/parchment: `#f4efe7`
- Primary red: `#bc4a3f`
- Gold: `#d5a240` / `#c9a84c`
- Border: `rgba(255,255,255,0.08)`

**Fonts:**
- Display: Cinzel (Google Fonts) — headings, uppercase, weight 700–900
- Body: DM Sans (Google Fonts) — UI text, weight 400–700
- Mono: JetBrains Mono — code, terminals
- (Production uses Geist Sans/Mono — request TTFs from team)

**Key CSS utilities:** `.chrome-panel`, `.cinematic-frame`, `.section-eyebrow`, `.world-hero`
→ All defined in `colors_and_type.css`

**Icon library:** Lucide Icons (`https://unpkg.com/lucide@latest`)

**UI Kit:** `ui_kits/t20os/index.html` — interactive landing + app cockpit prototype
