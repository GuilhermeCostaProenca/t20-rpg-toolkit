# Contributing to T20 OS

Thank you for contributing to `t20-rpg-toolkit`.

This repository is being refactored into a world-first operating system for the GM. Contributions are welcome, but they need to respect the product direction, workflow rules, and active execution plans.

Before contributing, read:

- [`README.md`](README.md)
- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`AGENTS.md`](AGENTS.md)
- [`docs/00-strategy/t20-toolkit-master-plan.md`](docs/00-strategy/t20-toolkit-master-plan.md)
- [`docs/00-strategy/attack-index.md`](docs/00-strategy/attack-index.md)

If your change touches a specific front, also read the corresponding `docs/*-plan.md`.

## Core rules

- Do not work directly on `master`
- Use a branch with the `codex/` prefix
- Keep scope tight
- Open a PR to `master`
- Use conventional commits
- Merge with `squash merge`
- Delete the branch after merge

This project does not treat "work exists in a branch" as done. A change is only meaningfully done when it lands in `master`.

## Branch naming

Recommended pattern:

```txt
codex/<front>-<scope>
```

Examples:

```txt
codex/shell-cockpit-foundation
codex/codex-entity-schema
codex/graph-ui-navigation
codex/live-table-quick-access
```

## Commit style

Use conventional commits.

Examples:

```txt
feat(shell): build world cockpit foundation
feat(codex): add universal entity model
refactor(world): align world-scoped navigation
docs(plan): expand acceptance criteria for codex
fix(combat): prevent tracker desync on turn advance
```

## Pull Request requirements

Every PR should include:

### Summary
What changed.

### Motivation
Why the change is needed.

### Changes
Main implementation details.

### Testing
What was validated.

### Risks
Possible regressions or edge cases.

### Notes
Anything intentionally left out, deferred, or important for reviewers.

Also include:
- link or reference to the relevant plan in `docs/`
- screenshots or video for meaningful UI changes
- migration notes if schema or route behavior changed

## Scope discipline

Prefer:
- one clear front per branch
- one coherent capability per PR
- a complete slice over broad unfinished changes

Avoid:
- mixing unrelated fronts
- drive-by refactors with no documented reason
- architecture drift away from the active plans
- adding features that bypass the world-first model

## Product alignment

The repository is evolving toward:
- world-first architecture
- campaigns as timelines
- universal entities
- first-class relationships
- visual libraries
- live table operation
- world memory
- Tormenta 20 support

If a contribution makes the app more fragmented, more route-heavy, or more like a generic CRUD dashboard, it is likely going in the wrong direction.

## UI contributions

The app should feel like a premium fantasy war room for the GM.

UI changes should aim for:
- strong hierarchy
- fluid navigation
- world context awareness
- dense but readable desktop layouts
- operational clarity

Avoid generic admin-panel patterns when they weaken the product identity.

## References policy

This repository includes a `references/` folder with useful external material.

Use references for:
- domain modeling
- T20 rules structure
- visual inspiration
- map strategy
- data organization

Do not copy whole apps or architectures blindly.

If you meaningfully adopt something from `references/`, record it in:
- the relevant plan file
- the PR notes

See:
- [`docs/02-support/reference-harvest-plan.md`](docs/02-support/reference-harvest-plan.md)

## Tests and validation

When behavior changes, add or update validation where appropriate.

Minimum expectation:
- run the most relevant local checks
- document what you ran in the PR

Typical commands:

```bash
npm run lint
npm run test:run
npm run build
```

If you cannot run something, state that clearly.

## Documentation updates

Update docs when your change affects:
- architecture
- workflow
- product direction
- acceptance criteria
- developer expectations

At minimum, review whether any of these need changes:
- `README.md`
- `ARCHITECTURE.md`
- `AGENTS.md`
- `docs/00-strategy/attack-index.md`
- the active front plan in `docs/`

## Questions to ask before opening a PR

- Does this belong to a world?
- Does this fit the active front?
- Does this reduce fragmentation?
- Does this help real GM workflow?
- Does this need a plan update?
- Is this ready to live in `master`?
