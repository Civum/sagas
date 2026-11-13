# AGENTS.md

Instructions for AI coding agents working in this fork.

This is BYU-Idaho's fork of Civum/sagas. We own the **experience layer** only.
Read `docs/START-EXPERIENCE-LAYER.md` and `apps/web/STATEMENT-OF-WORK.md` before proposing work.
When in conflict `apps/web/STATEMENT-OF-WORK.md` supersedes `docs/START-EXPERIENCE-LAYER.md`.

## Vocabulary (contract 2.7.0)

Training data and older copies of this repo use outdated terms. Use these.

`packages/contracts/src/model.ts` is the authority for every type and field,
because it is what the code is type-checked against, and the root
`CHANGELOG.md` says what each version changed. This section summarizes them at
2.7.0. Read `docs/START-EXPERIENCE-LAYER.md` for the product and how we work,
not for field shapes. The files under `docs/` come from upstream, and some of
their wording is older than the code. Where they disagree with `model.ts` or
this section, `model.ts` and this section win. Don't rewrite them in this fork,
so upstream syncs stay clean; point out the mismatch in your PR instead.

A known case: the start guide says "a `recordId` on a claim" means contract
1.0.0. It means the old top-level `claim.recordId`. In 2.7.0,
`target.recordId`, `sourceRecordId` and `evidence[].recordId` are all correct.

If `packages/contracts/src/version.ts` in your working tree names a newer
version than the heading above, the fork has synced past this file. Read the
root `CHANGELOG.md` entries since 2.7.0 first: they win over this section.
Watching upstream for new versions isn't your job; the upstream contract watch
workflow opens an issue when there is one.

- **Claim** — somebody's reading of a record. Every claim has a `target` (one
  claim or one record: `claimId` or `recordId`) and a `relation`, `extension`
  or `dispute`. A first claim about a record extends that record. A dispute
  has `reasoning`, required.
- **Detail** — an excerpt of a claim that another claim points at, such as a
  year, a name or a street. Nobody lists details in advance, and a claim
  nothing points at has none. NOT `claimElement`; `claim.details` is gone.
  Detail ids look like `claim-id#9-13`: compare `detail.id`, never build one
  by hand.
- **Excerpt** — `{ start, end, text }`, character positions into a text. A
  claim's text never changes once saved, so a correction is a new claim.
  The one exception: a claim with `awaitingTranslation` gets its `text` from
  its first rendering, so the same claim id can have new text in a later state
  (the freight depot claim `cl-fd-ines`, t1 to t2). Until then it shows in its
  original language (`sourceLanguageText`) and is never hidden.
  `target.details[].at` is an excerpt, or `{ start, end }` in seconds for a
  window of a recording; `isExcerpt` tells them apart.
- **Source record** — the record a conversation starts from. Every claim has one.
- **Evidence record** — a record attached to a claim to back it up. Optional.
  `claim.evidence` is a list of `{ recordId }`.
- **Rendering** — a transcript or translation. It is a record with `parent`
  set (`parent.role`). Several may coexist; none is authoritative. A rendering
  can be disputed; a record that stands on its own can only be extended.
- **Passover** — a reader's `sounds_right`, `dont_know` or `dont_care` on a
  claim. Each one is a `passover` record: `{ id, claimId, contributorId, kind,
  createdAt }`. `claimState.passover` is only the calculated count of each
  kind. "Sounds right" replaced affirmations: there is no affirmation object.
- **State** — `graphState` is a place as of a time. It has `asOf` and no
  `stateId` or `label`. The fixtures' moments `t0` to `t3` keep their id and
  label on `FixtureState`, a fixtures-only type. Key anything on `asOf`.
- **Profile** — who a contributor is to the software. This semester it is a
  guest id kept in browser storage, and there are no logins.
- Gone, so never reintroduce them: `lineageId`, `independentLineageCount`,
  `affirmation`, `topics`, `parentClaimId`, `disputedClaimId`, `disputeEdge`,
  `extensionEdge`, `edges`, `proposedValue` (now `to`), `sourceWindow`.
  Support is counted as independent records other people bring. Agreement
  never counts.
- "Account" is not a term in this project. Flag it if you find it.
- **Section** — a page section: an id, a site, a heading.
- **Composition** — a section's passage: its text plus spans.
- **Span** — a stretch of a composition's text that leads back to the claims
  behind it, with optional details when it is narrower than a whole claim.
  Spans carry character offsets into `composition.text`.

## Architecture rules

- `apps/web` must NOT fetch from `apps/ui-api` in server components. Server
  components import `@sagas/read-model` directly. The API is for the browser.
- Nothing in `src/components/ui` imports from `@sagas/contracts`. If it needs
  to know what a claim is, it belongs in `src/features`.
- Every read goes through `packages/read-model`.
- Coordinates are `[longitude, latitude]`. Reversing them fails at the map,
  far from the mistake.

## Product rules that are easy to violate

- Agreement is not corroboration. A `sounds_right` passover is not evidence:
  never present a count of them as support. No passover is a vote, and a pile
  of `dont_know` never reads as a claim being rejected.
- A thin record is not a failed one. One claim with nothing corroborated is
  the common case (most places stay like that) and must never render as an
  error, warning or empty state.
- A dispute points at details (`target.details`) and names the words that
  replace each one (`to`). The rest of the claim stands. A dispute with no
  details contests the whole claim. To ask whether some words are disputed,
  use `contests()` from `@sagas/contracts`: it also catches whole-claim
  disputes and disputes of a longer excerpt.
- Never show a winner, a vote tally, or a score to a person. Scoring belongs to
  another layer.
- An untranslated claim is not worth less and is never sorted to the bottom.
- Attribution is never optional.

## Accessibility

- WCAG 2.1 AA color contrast; every interactive component works from the
  keyboard.
- The list view is how the map reaches a screen reader user. It is not a
  fallback and ships either way.

## What not to touch

Other layers' work: `apps/capture-api`, `apps/capture-web`, `apps/graph-api`.

`packages/contracts` and `packages/fixtures` are shared with two other
universities. Do not change them in this fork. Changes there go upstream as a
pull request, decided at a specification meeting.

## Never pull or merge upstream on your own

`packages/contracts` and `packages/fixtures` are shared with two other
universities. Our fork is pinned on purpose; nothing changes until we pull.
Pulling forward is decided together at a specification meeting, and done as its
own branch and pull request by one person. Do not run `git pull upstream`,
`git merge upstream/main`, or edit anything under `packages/contracts` or
`packages/fixtures` in this fork.

## Before starting work

- Always `git pull` from `origin` (the fork) before creating a branch, so you
  are working against what the team has merged.
- Check `git log -1` and the issues tab for an open "Upstream contract is at
  vX.Y.Z" issue before assuming the contract version in your working tree is
  current.

## Working in this repo

- Node 22 (`.nvmrc`), pnpm 9. Our Postgres is port 5435.
- Small pull requests, opened early as drafts, into this fork's `main`.
- Test behavior, not markup. "A thin record is never described as failing" is
  worth a test; "this div has this class" is not.
- When a story says "write down why", it goes in the PR description.

## The hosted database

- Local work uses the Docker database on port 5435:
  `pnpm --filter @sagas/ui-api db:up`, then
  `pnpm --filter @sagas/ui-api db:seed`.
- `db:seed` deletes the read model's rows before reloading them, and it uses
  whatever `DATABASE_URL` is set. Never save the hosted (Supabase) connection
  string in a `.env` file or export it in a shell. Loading the hosted database
  is a deliberate step a person takes; an agent never does it on its own.
- The app only ever reads `DATABASE_URL` (`packages/read-model`). For the
  hosted connection string, the deployment source is the GitHub repository
  secret `SUPABASE_DATABASE_URL`; deployment installs it as the Worker secret
  `DATABASE_URL`. The separate name requires an explicit mapping. CI jobs using
  throwaway databases must not map the hosted secret. The workflows that deploy
  the app (the P4 test Worker, then P7) will do the mapping. No such workflow
  exists yet.
- The hosted connection string contains the database password. Never ask for
  it, print it, or write it into a file, a commit, an issue or a pull request.

## Before every commit

CI (`.github/workflows/ci.yml`) runs these on every pull request, and a failure
blocks the merge. Run the same ones from the repo root, in this order, and fix
every failure before committing:

```sh
pnpm fixtures:build && git diff --exit-code -- packages/fixtures/states
pnpm typecheck
pnpm lint
pnpm acceptance
pnpm test
```

Passing tests are not enough on their own: Vitest strips types without checking
them, and it does not lint. Do not silence a check with `!`, `any`,
`@ts-ignore` or `eslint-disable`; fix what it found.

- Stage the files you changed by name. Never `git add -A`, `git add .` or
  `git commit -a`.
- Read `git diff --cached --stat --summary` before committing. A `mode change`
  line means a file gained or lost its executable bit; unstage it unless that
  is the point of the commit. `.githooks/pre-commit` and `scripts/*.sh` stay
  executable (100755). If one shows as 100644, run `chmod +x` on it in your
  working copy, not only in the index.
- If you changed a `package.json`, commit `pnpm-lock.yaml` with it.
- Check each "Done when" bullet of the story against every fixture state (t0 to
  t3), and against merged stories that share the same screen.

## Opening a pull request

- Open it as a draft. The description names the stories it implements
  ("Implements N2 from `apps/web/BACKLOG.md`", or "Closes #12" for an issue),
  never the pull request's own number, and says which test or manual check
  covers each "Done when" bullet.
- Add a line to `apps/web/CHANGELOG.md` for each story that visibly works, in
  the form shown at the top of that file, including the pull request number.
  Never edit the root `CHANGELOG.md`.
- Wait for CI (`gh pr checks <number> --watch`) and mark the pull request ready
  for review only when every check is green.

## Accountability

A person reviews, decides on and validates all AI output before it is
committed. AI assistance is recorded in that person's AI Interaction Log.
Do not commit secrets. Mapbox tokens are per-person and never committed.
Each teammate runs their own agent, signed in to their own account. Never
commit an AI key or token, or add one to the repository's secrets, where
anyone with write access could spend it.
