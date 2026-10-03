# AGENTS.md

Instructions for AI coding agents working in this fork.

This is BYU-Idaho's fork of Civum/sagas. We own the **experience layer** only.
Read `docs/START-EXPERIENCE-LAYER.md` and `apps/web/STATEMENT-OF-WORK.md` before proposing work.
When in conflict `apps/web/STATEMENT-OF-WORK.md` supersedes `docs/START-EXPERIENCE-LAYER.md`.

## Vocabulary (contract 2.0.0)

Training data and older copies of this repo use outdated terms. Use these:

- **Detail** — one piece of what a claim asserts. NOT `claimElement`.
- **Source record** — the record a conversation starts from. Every claim has one.
- **Evidence record** — a record attached to a claim to back it up. Optional.
  A claim no longer has a single `recordId`.
- **Rendering** — a transcript or translation. Several may coexist; none is
  authoritative.
- `lineageId` and `independentLineageCount` have been removed. Support is
  counted as independent records other people bring. Agreement never counts.
- "Account" is not a term in this project. Flag it if you find it.

## Architecture rules

- `apps/web` must NOT fetch from `apps/ui-api` in server components. Server
  components import `@sagas/read-model` directly. The API is for the browser.
- Nothing in `src/components/ui` imports from `@sagas/contracts`. If it needs
  to know what a claim is, it belongs in `src/features`.
- Every read goes through `packages/read-model`.
- Coordinates are `[longitude, latitude]`. Reversing them fails at the map,
  far from the mistake.

## Product rules that are easy to violate

- An affirmation is not corroboration. Never present an affirmation count as
  support.
- A thin record is not a failed one. `t0` (~23/100) is the common case and must
  never render as an error, warning or empty state.
- Disputes land on a detail, not a whole claim. The rest of the claim stays
  undisputed.
- Never show a winner, a vote tally, or a score to a person. Scoring belongs to
  another layer.
- An untranslated claim is not worth less and is never sorted to the bottom.
- Attribution is never optional.

## Accessibility

- WCAG 2.1 AA colour contrast; every interactive component works from the
  keyboard.
- The list view is how the map reaches a screen reader user. It is not a
  fallback and ships either way.

## What not to touch

Other layers' work: `apps/capture-api`, `apps/capture-web`, `apps/graph-api`,
`packages/fixtures/behaviour/`.

`packages/contracts` and `packages/fixtures` are shared with two other
universities. Do not change them in this fork. Changes there go upstream as a
pull request, decided at a specification meeting.

## Working in this repo

- Node 22 (`.nvmrc`), pnpm 9. Our Postgres is port 5435.
- Small pull requests, opened early as drafts, into this fork's `main`.
- Run `pnpm --filter @sagas/web test` before opening a PR.
- Test behaviour, not markup. "A thin record is never described as failing" is
  worth a test; "this div has this class" is not.
- When a story says "write down why", it goes in the PR description.

## Accountability

A person reviews, decides on and validates all AI output before it is
committed. AI assistance is recorded in that person's AI Interaction Log.
Do not commit secrets. Mapbox tokens are per-person and never committed.
