# T20 OS — UI Kit

## Overview
High-fidelity recreation of the T20 OS GM cockpit. Covers the two main surfaces:
- **Landing page** — marketing/hero with nav, features, CTA
- **App shell** — sidebar + world cockpit modules (Codex, Forja, Mesa ao Vivo, Memória)

## Usage
Open `index.html` for the full interactive prototype. It starts on the landing page; click "Abrir cockpit" to enter the app shell.

## Component files
| File | Contents |
|---|---|
| `Sidebar.jsx` | AppSidebar with world nav sections, brand mark, chrome-panel info blocks |
| `TopBar.jsx` | Topbar with breadcrumbs, world badge, action buttons |
| `Cards.jsx` | Chrome panel, cinematic frame, world hero, entity card, session card |
| `LandingPage.jsx` | Hero, navbar, features grid, how-to, CTA, footer |
| `AppShell.jsx` | Main cockpit shell, module views (Codex, Forja, Mesa, Memória) |
| `index.html` | Entry point — loads all JSX components via Babel |

## Notes
- Fonts: DM Sans (body), Cinzel (display) — from Google Fonts
- Icons: Lucide (via CDN unpkg)
- No real data — all fake/placeholder content
- Framer Motion omitted for simplicity; transitions via CSS only
