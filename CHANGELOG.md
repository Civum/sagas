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

## 2026-09-04 — repo change, no contract movement

**Affects:** content layer · everyone, lightly

**What:**

- New app, `apps/capture-web` — the contributing interface. Ships empty, with a
  README. Framework choice is the content team's.
- New guide, `docs/START-CONTENT-LAYER.md` — what to read, what to ignore, what
  to install, the first task, and how the months are shaped.
- `apps/capture-api/README.md` gains a "This semester" section: ordering, table
  ownership, no authentication, no hosting, how translation works.
- Editor config committed. `.vscode/extensions.json` recommends the extensions
  this repo expects; `.vscode/settings.json` turns on format-on-save and points
  TypeScript at the workspace version.
- `docs/DESIGN-QUESTIONS.md` — Part 3 is now "Open by design" and Part 4 is "Not
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
