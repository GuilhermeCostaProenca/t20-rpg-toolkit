# T20 OS

`T20 OS` is a world-first operating system for the GM.

This project is not meant to be just a campaign dashboard or a combat helper. The goal is to centralize the real workflow of running tabletop RPGs in one product: worldbuilding, session prep, live table operation, world memory, visual references, and Tormenta 20 support.

Today, most GM workflows are fragmented across chat threads, PDFs, Pinterest boards, notes, improvised spreadsheets, combat trackers, and memory. `t20-rpg-toolkit` exists to collapse that fragmentation into one coherent system.

## Product direction

The toolkit is being refactored into a modular GM platform with a clear rule:

- one complete module at a time
- nothing ships as a fake MVP
- nothing is developed directly on `master`
- branches merge into `master`, then die

The long-term product vision is documented in:

- [`docs/t20-toolkit-master-plan.md`](docs/t20-toolkit-master-plan.md)
- [`docs/attack-index.md`](docs/attack-index.md)

## What this app is becoming

The toolkit is being shaped into a product that can support:

- living worlds as the root of the system
- campaigns as timelines inside those worlds
- persistent entities, relationships, and consequences
- deep world creation with families, lineages, politics, lore, and founding events
- session preparation inside the app
- live table operation with combat, map, reveal, and quick lookup
- world memory after play
- visual libraries for references and reveals
- Tormenta 20 encounter support and balancing tools

Future Jarvis integration is part of the ecosystem vision, but this repository is the product itself. It must be strong on its own.

## Current foundations already in the repo

The current codebase already contains strong building blocks:

- world-first data model with `World`, `Campaign`, `Session`, and `WorldEvent`
- combat flow with initiative, turns, conditions, and action processing
- interactive map support
- reveal system for player-facing content
- AI chat, narration processing, and transcription surfaces
- dice and tactical UI primitives
- Next.js app shell, Prisma, and world-scoped routes

The current challenge is not "missing features". It is product consolidation: UX fluidity, domain cohesion, and turning many isolated parts into one master-grade system.

## Official attack plans

The rework is tracked through dedicated execution plans in [`docs/`](docs):

- [`docs/attack-index.md`](docs/attack-index.md)
- [`docs/shell-cockpit-plan.md`](docs/shell-cockpit-plan.md)
- [`docs/codex-do-mundo-plan.md`](docs/codex-do-mundo-plan.md)
- [`docs/grafo-narrativo-plan.md`](docs/grafo-narrativo-plan.md)
- [`docs/biblioteca-visual-plan.md`](docs/biblioteca-visual-plan.md)
- [`docs/forja-do-mundo-plan.md`](docs/forja-do-mundo-plan.md)
- [`docs/forja-de-sessao-plan.md`](docs/forja-de-sessao-plan.md)
- [`docs/mesa-ao-vivo-plan.md`](docs/mesa-ao-vivo-plan.md)
- [`docs/memoria-do-mundo-plan.md`](docs/memoria-do-mundo-plan.md)
- [`docs/balanceamento-t20-plan.md`](docs/balanceamento-t20-plan.md)

These documents are not decorative. They are the working source of truth for implementation, acceptance, branch flow, and completion tracking.

## Tech stack

- Next.js 16
- React 19
- TypeScript 5
- Prisma
- PostgreSQL
- Tailwind CSS 4
- Radix UI
- Framer Motion
- MapLibre GL
- Three.js / React Three Fiber
- Vitest

## Repository structure

High-level structure:

```txt
prisma/      Database schema and migrations
public/      Static assets
scripts/     Project scripts and smoke tests
src/app/     App routes and API routes
src/components/
src/lib/     Core app logic, engine, validators, events, AI helpers
docs/        Product vision and attack plans
references/  External reference projects and reusable domain inspiration
```

## References

This repository contains a local `references/` folder with upstream material that can accelerate the refactor:

- `references/gerador-ficha-tormenta20`
- `references/roll20_tormenta20_grimoire`
- `references/artonMap`
- `references/fichas-de-nimb-fvvt`
- `references/jarvez-mcp-rpg` (legacy folder name for Jarvis brain references)

These references are here to inform domain modeling, T20 rules support, map strategy, visual organization, and future ecosystem integration. They are not meant to be copied blindly into the main product.

## Getting started

### Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d db
```

The local database container uses the values defined in `.env.docker`.

### 3. Create `.env.docker`

Copy the template and set a real password:

```bash
cp .env.docker.example .env.docker
```

Minimum values:

```env
POSTGRES_USER=t20
POSTGRES_PASSWORD=use-a-long-random-secret-here
POSTGRES_DB=t20os
POSTGRES_PORT=5432
APP_PORT=3000
APP_BIND=127.0.0.1
TRUSTED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true
```

How the key variables work:

- `APP_BIND` controls which host interface publishes the web app. Inside the container, Next.js always listens on `0.0.0.0`; exposure is controlled on the host side by Docker.
- `TRUSTED_ORIGINS` is the allowlist for browser origins that may issue trusted interactive requests. Keep it aligned with every URL you actually intend to use in the browser.
- `WATCHPACK_POLLING` and `CHOKIDAR_USEPOLLING` keep file watching reliable through the Docker bind mount during development.

Security notes:

- PostgreSQL is published only to `127.0.0.1` on the host, so local tools can connect without exposing the database to LAN, Tailscale, or the public internet.
- The app binds to `127.0.0.1` by default, which is the safest local-only default.
- For LAN or Tailscale access, prefer binding to the exact private interface IP you want to expose instead of using `0.0.0.0`.
- Do not expose this stack directly to the public internet without a VPN or a hardened reverse proxy with TLS and authentication in front of it.
- Do not open router port forwarding for this app.
- Do not publish the database port beyond loopback.

### 4. Run Docker in development mode

```bash
docker compose --env-file .env.docker up --build
```

This is the default Docker workflow for active development.

What it does:

- starts PostgreSQL on the internal Docker network and publishes it only on host loopback
- starts Next.js in development mode inside Docker
- bind-mounts the repository so code changes reflect immediately in the container
- keeps `node_modules` and `.next` in Docker volumes to avoid host/container clashes
- allows dev access from the specific browser origins you configure in `TRUSTED_ORIGINS`
- applies Prisma migrations with `prisma migrate deploy`

#### Localhost only

Safe default for using the app only on the same machine:

```bash
docker compose --env-file .env.docker up --build
```

Open on this machine:

```txt
http://127.0.0.1:3000
http://localhost:3000
```

If port `3000` is already in use:

```bash
APP_PORT=3001 docker compose --env-file .env.docker up --build
```

#### LAN access

Bind the app to the host LAN IP you explicitly want to expose:

```bash
APP_BIND=192.168.0.25 TRUSTED_ORIGINS=http://192.168.0.25:3000,http://127.0.0.1:3000,http://localhost:3000 docker compose --env-file .env.docker up --build
```

Open:

```txt
http://192.168.0.25:3000
```

This keeps the database private and exposes only the web app on that LAN interface.

#### Tailscale access

Requirements:

- Tailscale is installed and connected on the host machine running Docker
- the client device is authenticated in the same tailnet or otherwise authorized by your Tailscale policy

Bind the app to the host Tailscale IP:

```bash
APP_BIND=100.101.102.103 TRUSTED_ORIGINS=http://100.101.102.103:3000,http://my-host.tailnet-name.ts.net:3000,http://127.0.0.1:3000,http://localhost:3000 docker compose --env-file .env.docker up --build
```

Open from an authorized device:

```txt
http://100.101.102.103:3000
http://my-host.tailnet-name.ts.net:3000
```

Notes:

- Tailscale runs on the host, not inside the container.
- The container does not need a Tailscale client.
- `APP_BIND` should be the host Tailscale IP when you want the app reachable specifically on that interface.
- If you use MagicDNS in the browser, include the MagicDNS URL in `TRUSTED_ORIGINS`.

If you want a different PC outside your home/local network to access this app, do **not** publish it raw on your router.

Use one of these instead:

- Tailscale or WireGuard, then expose the app only on the VPN interface
- a hardened reverse proxy with TLS, authentication, and IP allowlisting
- a private tunnel you control, never an anonymous public port forward

The Docker setup here is designed to be safe-by-default for local development and controlled LAN access. Public exposure requires an explicit security layer in front of it.

### 5. Expose the app with a Quick Cloudflare Tunnel

Use this when you want temporary browser access from any network without opening ports on your router and without exposing your machine directly.

Prerequisites:

- the app is already running on `http://localhost:3000`
- `cloudflared` is installed on the host

Windows install example:

```powershell
winget install --id Cloudflare.cloudflared --exact
```

If you just installed it, open a new terminal before using the command below so `cloudflared` is on your `PATH`.

Start the app:

```bash
docker compose --env-file .env.docker up --build
```

Start the tunnel:

```bash
cloudflared tunnel --url http://localhost:3000
```

Or, from this project:

```bash
npm run tunnel
```

What to expect:

- `cloudflared` creates a temporary public URL such as `https://random-name.trycloudflare.com`
- the URL changes on every execution
- traffic goes out over Cloudflare's tunnel, which works well in restrictive networks that still allow outbound `443`
- your home or office IP is not published directly in the browser URL
- this is appropriate for testing, review, and short-lived sharing

Important limits:

- Quick Tunnels are temporary and should not be treated as a permanent publish strategy
- keep the local app running while the tunnel is active
- the database remains private on host loopback and is not exposed by the tunnel
- this exposes the web app publicly through the generated URL, so use it only when you intentionally want remote browser access to the app
- do not combine this with router port forwarding

### 6. Run the hardened runtime profile

Use this when you want a production-like container without bind mounts:

```bash
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.runtime.yml up --build
```

What changes in this mode:

- uses the production `runner` image
- removes source-code bind mounts
- runs the container filesystem as read-only
- mounts writable `tmpfs` only for temporary runtime/cache paths
- drops Linux capabilities
- keeps the app process as a non-root user
- keeps PostgreSQL internal-only
- still publishes only the app port you configured

This mode is better for testing external access and runtime posture.

### 6.1 What is safe and what is not

Safe in this setup:

- `APP_BIND=127.0.0.1` for machine-local use
- `APP_BIND=<LAN_IP>` for controlled LAN testing
- `APP_BIND=<TAILSCALE_IP>` for controlled access over Tailscale
- `cloudflared tunnel --url http://localhost:3000` for short-lived remote browser access without opening inbound ports
- adding the exact browser URLs you use to `TRUSTED_ORIGINS`
- using the runtime override for a more locked-down execution mode

Not safe:

- router port forwarding to this app
- publishing PostgreSQL to `0.0.0.0`
- exposing the full stack to the public internet without an auth/TLS layer
- treating browser access as remote desktop or machine access
- adding wildcard origins you do not control

### 7. Create your local `.env`

Create a `.env` file in the repository root when you want to run Next.js directly on the host:

```env
DATABASE_URL="postgresql://t20:<your-password>@localhost:5432/t20os?schema=public"
DIRECT_URL="postgresql://t20:<your-password>@localhost:5432/t20os?schema=public"
```

If you are using Docker for the app itself, the container uses `db` as the internal database host. For host-side development, use `localhost`.

### 8. Apply Prisma migrations

```bash
npx prisma migrate dev
```

### 9. Start the app

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Useful commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:run
```

## Development workflow

This repository follows a strict branch discipline.

- never implement directly on `master`
- create a branch with the `codex/` prefix
- keep scope tight
- open a PR back into `master`
- merge with `squash merge`
- delete the branch after merge

Recommended branch examples:

```txt
codex/shell-cockpit-foundation
codex/codex-entity-schema
codex/graph-ui-navigation
```

Recommended commit style:

```txt
feat(shell): build world cockpit foundation
feat(codex): add universal entity model
refactor(world): align world-scoped navigation
docs(plan): expand acceptance criteria for codex
```

## Product principles

The rework follows a few hard rules:

- world is the root context
- campaigns are timelines inside worlds
- the toolkit must become the GM's main operational surface
- layout must feel fluid, not page-fragmented
- visuals must feel premium, not template-driven
- modules must ship complete enough to be usable in real play or prep

## Current priority

The first major module of the rework is `Codex do Mundo`.

Its mission is to become the main worldbuilding and consultation surface for:

- entities
- relationships
- visual references
- quick inspect
- full entity workspace

That module is the foundation for the graph, the future `Forja do Mundo`, session forge, live table flow, and world memory.

Creating a world itself is also being treated as a first-class product problem. A new world cannot stop at a name and an empty dashboard; it must lead into a real bootstrap flow for families, houses, lineages, politics, lore, visual references, and founding events.

## Notes on product language

This repository mixes implementation and product language in Portuguese and English.

- Product naming and planning are often in Portuguese because the target creative workflow is Brazilian Portuguese-first.
- Technical infrastructure may remain in English where it improves consistency with the codebase and toolchain.

## Status

This repository is active and under heavy refactor toward a stronger GM-centered architecture.

The core direction is no longer "add more isolated features". It is "turn this into one coherent, beautiful, operational system for the master".

## Author

**Guilherme Costa Proenca**

- GitHub: [@GuilhermeCostaProenca](https://github.com/GuilhermeCostaProenca)
