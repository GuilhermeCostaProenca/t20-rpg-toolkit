# AGENTS.md

This repository is the main product surface for the GM.

Agents working here must optimize for product cohesion, world-first modeling, and real usability for live tabletop play and session preparation.

## Product truth

`t20-rpg-toolkit` is not a generic dashboard.
It is being refactored into a world-first GM operating system.

The product must centralize:
- worldbuilding
- deep world creation
- session preparation
- live table operation
- world memory
- visual references
- Tormenta 20 support

Do not treat this repo as a loose collection of CRUD pages.

## Primary source of truth

Before making major changes, read:
- `README.md`
- `ARCHITECTURE.md`
- `docs/00-strategy/t20-toolkit-master-plan.md`
- `docs/00-strategy/attack-index.md`
- the specific `docs/01-fronts/*-plan.md` for the active front

If a change does not fit the active plan, stop and reconcile it before implementation.

## Workflow rules

- Never work directly on `master`.
- Use a branch with the `codex/` prefix.
- Keep branches scoped to one front or one clear sub-cut.
- Open a PR back to `master`.
- Use conventional commits.
- Preferred merge mode: `squash merge`.
- Delete the branch after merge.
- Do not let meaningful work accumulate uncommitted across many fronts.
- When a recorte is stable, commit, push, merge to `master`, and kill the branch before continuing.
- Do not keep Docker or day-to-day usage pointed at a long-running side branch unless that branch is about to be merged.

Do not leave important work living only in a long-running side branch.
Do not treat a dirty branch as an acceptable long-term execution state.

## Branch discipline is mandatory

- `master` is the principal line and the only branch that should represent the integrated product.
- A branch is a short-lived delivery vehicle, not a second home for the product.
- If the user is running the app seriously, the expectation is that the relevant work is already merged into `master`.
- If Docker is bind-mounting the repository, it is reflecting the current checked-out branch. Agents must be explicit about that and must not leave the user unknowingly running a side branch.
- Before ending a substantial work cycle, agents must either:
  - merge the branch into `master`, or
  - clearly state that the work is still only in branch and not yet safe to treat as the main line.

## Git completion rule

Work is not operationally complete when it only:
- exists in the working tree;
- exists as uncommitted local changes;
- exists only in a feature branch;
- exists remotely without merge to `master`.

Operational completion means:
1. code committed;
2. branch pushed;
3. branch merged into `master`;
4. branch deleted;
5. local workspace returned to `master` when the cycle closes.

## Docker rule

- The development Docker stack bind-mounts the current repository state.
- Therefore Docker reflects the currently checked-out branch, not `origin/master` magically.
- Agents must treat this as a serious operational concern.
- If the user expects the running app to represent the principal product line, agents must regularize Git first or state clearly that the container is still running branch-only code.

## Linear execution policy

This repository uses Linear as the execution layer for non-trivial work.

Rules:
- Before starting substantial work, check whether there is an active Linear issue for it.
- If the work is non-trivial and no issue exists, create one or explicitly record that the work needs a new issue.
- Use Linear to track execution status. Notion remains the deeper context and documentation layer.
- When work starts, move the Linear issue to `In Progress` when possible.
- When work is blocked, update the Linear issue with the blocker and current state.
- When work finishes, move the issue to `Done` and leave a concise summary of what changed.
- Branch names, commits and PRs should reference the Linear issue ID whenever possible.
- If the work changes project direction, architecture, roadmap, or active fronts, update the relevant Notion project hub or plan docs in the same task.

## Implementation priorities

When there is tension between options, prefer:
1. world-scoped modeling over global shortcuts
2. continuous cockpit UX over route-heavy UX
3. complete module slices over fake MVP breadth
4. explicit domain structure over hidden text blobs
5. product cohesion over copying reference repos

## UI guidance

The app should feel like a premium fantasy war room for the GM.

Avoid:
- generic admin panel aesthetics
- disconnected page-to-page experiences
- weak hierarchy
- overuse of placeholder cards
- UI that forces the GM to constantly enter and exit pages

Prefer:
- strong world context
- persistent panels and quick inspect surfaces
- dense but legible desktop layouts
- deliberate visual hierarchy
- image-rich but operationally efficient design

## Domain guidance

The system should evolve toward:
- world-first architecture
- campaigns as timelines
- universal entities
- first-class relationships
- family and lineage structures
- politics and founding chronology
- narrative events as memory
- visual libraries tied to entities and sessions

When adding new domain structures, ask:
- does this belong to a world?
- should this be an entity, a relationship, or an event?
- does this improve continuity?
- will this help the GM during prep or live play?

## References policy

This repo includes a `references/` folder with useful upstream material.

Use references to harvest:
- domain structure
- T20 data organization
- map strategies
- visual patterns
- UX ideas

Do not blindly copy:
- full app shells
- whole architectures
- arbitrary UI components
- stack choices that conflict with this repo

If you use a reference meaningfully, record that use in the relevant plan and PR.

See:
- `docs/02-support/reference-harvest-plan.md`

## Done means merged

Work is not considered complete when it only:
- exists locally
- exists in a branch
- exists as a partial commit
- exists as an undocumented experiment

A front is only materially complete when:
- the scoped implementation is in `master`
- acceptance criteria from the corresponding plan are satisfied
- docs are updated if scope or behavior changed

## Current strategic order

1. Shell and Cockpit
2. Codex do Mundo
3. Grafo Narrativo
4. Biblioteca Visual
5. Forja do Mundo
6. Forja de Sessao
7. Mesa ao Vivo
8. Memoria do Mundo
9. Balanceamento T20

Do not jump ahead in a way that weakens the foundation of earlier fronts.
