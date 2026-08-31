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
records. Twenty conformance cases covering granular disputes, corroboration
independence, untranslated accounts, coexisting renderings, one record producing
several claims, media still processing, an embedded location that contradicts
the place, an open flag on a published record, and a contributor who has
authored nothing and is one of the most useful people in the record.

`era` is optional on a claim. Half the fixture claims have none, because they
say nothing about time and putting a period on them would be the scaffold
inventing a fact.

**Why:** Written by the sponsor in August 2026, before any team existed and
before anyone from the Basque community had reviewed it. Expect it to be wrong
in at least one interesting way — `packages/fixtures/conformance/cases.ts`
carries a list of known gaps, and closing one is a welcome PR.

**You need to:** Nothing. This is the first one.
