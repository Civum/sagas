# Changelog

Every change to `@sagas/contracts` or `@sagas/fixtures` gets an entry here with a
contract version, who it affects, what a consumer has to do — and, most
importantly, **why it changed and where it came from.**

**One changelog, not one per school.** A change frequently touches two layers,
and more to the point, seeing that the intelligence team found a flaw the
experience team is now working around is the entire reason the contract sits in
the middle. Splitting this file would hide the one thing it exists to show.

Entries name **layers**, not schools. Layers are stable; which university owns
one is not, and this file should still make sense to next year's cohort.

Changes land on Mondays and only on Mondays — see "When the contract changes" in
the root README. Your fork is pinned, so nothing here reaches you until you pull.

**Two kinds of entry.** A contract change carries a version number. A repo change
— a new app, a new guide, tooling — carries a date only, because it doesn't move
the contract. Both say who they affect, and both are worth a Monday glance.

**Check this file every Monday.** If the **Affects** line doesn't name your
layer, you can stop reading and get on with your week.

## Entry format

```
## vX.Y.Z — YYYY-MM-DD

**Affects:** experience layer · intelligence layer · content layer · none (additive)

**What:** One line. The diff, in English.

**Why:** Where this came from — which team hit it, or which conversation caused
it. This is the most useful field in the entry.

**You need to:**
- *experience layer* — nothing, or the specific migration.
- *intelligence layer* — nothing, or the specific migration.
```

---

## 2026-09-08 — scoring rules and the intelligence layer's guide

**Affects:** intelligence layer

**What:**

- New guide, `docs/START-INTELLIGENCE-LAYER.md`. What to read, what to ignore,
  what to install, and the first task.
- `apps/graph-api` now runs tests. There is a `src/scorer.test.ts` with an empty
  scorer and the rules running against it, so `pnpm test` produces failures you
  can work against rather than a configuration problem.
- The scoring rules went from sixteen to ten. Six that asserted on
  `independentLineageCount` were removed, because a family is not something this
  system can currently observe. `lineageId` is hand-authored, nothing derives it,
  and there are no accounts to attach it to. The question moved into the "what
  these rules do not cover" block, which is where open problems belong.
- The remaining ten are prefixed `required` or `open to argument`. Required
  means this project will not merge a scorer that fails one. Open to argument
  means it is a position the sponsor holds and wrote down so it is checkable, and
  disagreeing is a check-in conversation.

**Why:** The suite was over-specified. It constrained the shape of the input as
well as the behaviour of the output, which meant a team designing independence
differently would have been fighting the tests rather than the problem. The
algorithm is the intelligence layer's deliverable and the rules should be a floor
rather than a design.

**You need to:**

- *intelligence layer* — read `docs/START-INTELLIGENCE-LAYER.md`. If you had
  already started against the sixteen rules, six of them are gone and the reason
  is in the file.
- *content layer* — nothing.
- *experience layer* — nothing.

---

## 2026-09-08 — repo change, no contract movement

**Affects:** every layer, but only if you have already run `pnpm db:up`

**What:** Each layer now has its own database, its own container and its own
`docker-compose.yml`, sitting next to the app that owns it.

| Layer | Where | Port | Database |
|---|---|---|---|
| Content | `apps/capture-api` | 5433 | `sagas_content` |
| Intelligence | `apps/graph-api` | 5434 | `sagas_intelligence` |
| Experience | `apps/ui-api` | 5435 | `sagas_read` |

The commands are unchanged, but they run from your app's directory rather than
the repository root. Object storage moved into the content layer's compose file,
so the other two layers never start it. The root `docker-compose.yml` is gone.

**Why:** The documentation already said each layer has its own database and the
scaffold only ever made one, so nothing enforced it. Sharing also meant object
storage sat behind a compose profile purely because one team needed it and two
did not, and both start guides spent a paragraph telling people which parts were
not theirs. One team's setup will grow over the semester and two will not, which
is the case where sharing costs the most.

**You need to:** If you have not started a database yet, nothing. If you have,
`cd` into your app, run `pnpm db:reset`, then `pnpm db:up`, and update
`DATABASE_URL` in your `.env` to the line for your layer.

---

## 2026-09-07 — repo change, no contract movement

**Affects:** content layer

**What:** `apps/capture-api` is set up so that nothing stands between you and
writing an endpoint.

- Express 5 and `pg` added, with `dev`, `start` and `migrate` scripts.
- `src/db.ts` holds a shared connection pool.
- `scripts/migrate.ts` applies numbered SQL files from `migrations/` in order,
  once each, inside a transaction, recording what it applied. Small enough to
  read.
- `src/index.ts` is a placeholder describing the shape of the first endpoint.
- The README covers the three decisions now made: Express 5, `pg` with SQL
  written out, and numbered migration files.

The endpoint itself and the first migration are not here. Those are yours.

**Why:** Choosing between server frameworks is a week of research that produces
a decision nobody on a first project is equipped to make, and configuration is
not the interesting part. The parts that are interesting stay yours.

**You need to:**

- *content layer* — `pnpm install`. Then read `src/index.ts`, which describes
  what to build.
- *intelligence layer* — nothing.
- *experience layer* — nothing.

---

## 2026-09-04 — repo change, no contract movement

**Affects:** content layer · everyone, lightly

**What:**

- New app, `apps/capture-web`, the contributing interface. It ships empty with a
  README, and the framework choice belongs to the content team.
- New guide, `docs/START-CONTENT-LAYER.md`, covering what to read, what to
  ignore, what to install, the first task, and how the months are shaped.
- `apps/capture-api/README.md` gains a "This semester" section: ordering, table
  ownership, no authentication, no hosting, how translation works.
- Editor config committed. `.vscode/extensions.json` recommends the extensions
  this repo expects; `.vscode/settings.json` turns on format-on-save and points
  TypeScript at the workspace version.
- `docs/DESIGN-QUESTIONS.md`. Part 3 is now "Open by design" and Part 4 is "Not
  for this project to answer". Four new entries on inherited trust, reference
  edges, the split between a person as record subject and as platform account,
  and naming people who can't consent.
- Root README notes the licence and how contributions are credited.

**Why:** The content team started, and the repo had a domain description without
an ordering. Everything here is about making the first week smaller.

**You need to:**

- *content layer* — read `docs/START-CONTENT-LAYER.md`. It replaces guessing.
- *intelligence layer* — nothing yet. Your equivalent guide is coming.
- *experience layer* — nothing yet.

---

## v1.0.0 — unreleased

**Affects:** all layers — this is the starting point.

**What:** Initial contract, covering all three layers.

Claim graph: sites, contributors, claims with typed addressable elements,
dispute / extension / reference edges, affirmations, passover signals,
translations.

Content capture: records, media references with processing state and
derivatives, transcripts, captured location with the method that produced it,
and flags. A record is a bundle rather than a file type, and every claim points
at the record it was read out of.

Intelligence input: every derived state carries what each contributor has
actually done, as counts and never as a score, and every claim carries the
record it was read out of.

Anduiza fixture: 64 authored contribution events, four derived states, nine
records. Twenty acceptance criteria covering granular disputes, corroboration
independence, untranslated accounts, coexisting renderings, one record producing
several claims, media still processing, an embedded location that contradicts
the place, an open flag on a published record, and a contributor who has
authored nothing and is one of the most useful people in the record.

No period field on a claim. What somebody said about time is kept in their
words, on date elements, and `datedClaims` in the integrity score counts how
much of a record is anchored in time from those rather than from a bucket
chosen at entry.

**Why:** Written by the sponsor in August 2026, before any team existed and
before anyone from the Basque community had reviewed it. Expect it to be wrong
in at least one interesting way — `packages/fixtures/README.md`
carries a list of known gaps, and closing one is a welcome PR.

**You need to:** Nothing. This is the first one.
