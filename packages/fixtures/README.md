# @sagas/fixtures

Development fixture data for the Sagas claim graph. Sponsor-owned and
**versioned**, not frozen: this data will change during the semester, because
changes here are how design pressure reaches both layers.

Your fork is pinned to a tag. A fixture change lands in your fork when we agree
at a sync to pull forward, never in the middle of your sprint. Every change
carries a contract version bump and a CHANGELOG line saying what a consumer has
to do about it. If one arrives without that, it's a mistake on our side — say so.

## The content here is invented

Every contributor, family, and remembered event in this package is fictional.
It was written to exercise the data model, not to record anything.

The building, street address, and coordinates are real. Nothing else is.
Surnames were chosen to be plausibly Basque in form while avoiding the families
documented in connection with this building.

Do not display this data publicly, cite it, or show it to community members as
though it were testimony. It is scaffolding for your development environment.

The Euskara sample text has **not** been reviewed by a speaker and is likely
imperfect. It must be reviewed before this fixture appears in any demo.

## What this is, structurally

There is one authored file per site: an append-only log of contribution events
in timestamp order. Graph states are derived by folding that log up to an
instant. **States are never authored by hand.**

```
fixtures/anduiza/events.ts   ← the only authored artifact
src/reduce.ts                ← fold(events, upTo) → GraphState
states/anduiza.t*.json       ← generated, do not edit
```

This shape exists because the version-history timeline needs it. A state built
by folding knows exactly which contributions produced it, so
`eventIdsSincePrevious` on each state is a real answer to "what changed and
who changed it" rather than a second fiction that has to be kept consistent
with the first by hand.

```bash
pnpm build:states   # regenerate states/ and print a readable dump
pnpm test           # invariants over the derived states
```

If you need a graph state that doesn't exist yet, add a cut to `stateCuts` —
don't write a state file.

## The four states

| | integrity | claims | contributors | lineages | disputes | untranslated |
|---|---|---|---|---|---|---|
| **t0** sparse, single source | 23 | 3 | 1 | 1 | 0 | 0 |
| **t1** family corroboration arrives | 52 | 6 | 4 | 3 | 0 | 1 |
| **t2** documentary source contests a date | 65 | 7 | 5 | 4 | 4 | 0 |
| **t3** competing renderings, reconciliation candidate | 86 | 10 | 6 | 5 | 5 | 0 |

Each state deliberately exercises something:

- **t0** — everything single-source and low weight. A sparse site must look
  sparse on the map, not empty.
- **t1** — an affirmation arrives from the author's own cousin. Volume rises,
  independence does not. `cl-boarding` stays `single_source` with one
  affirmation on it. Also: an account submitted in Euskara, pinned and readable
  on the map, sitting outside the claim graph with weight 0.
- **t2** — an institutional source contests *one element* of an otherwise
  well-supported claim. The date is disputed; the location and the person are
  not. A rendering of the Euskara account arrives and it enters the graph. The
  original is untouched.
- **t3** — a second rendering of the same account coexists with the first, each
  attributed, with a preserved objection about what the first one loses. An
  extension satisfies both branches of an earlier disagreement (a reconciliation
  candidate). Two unresolved cross-site reference markers.

## Boundaries

**There is no synthesis endpoint this semester.** These fixtures are what you
build against. UofI builds the synthesis engine in the spring. If you are
writing code that fetches narrative state over the network, stop and ask.

**`src/weight.ts` is not the weight propagation algorithm.** It is arithmetic
that exists so claims have an ordering to render. Designing the real one is
UofI's semester-1 deliverable. Do not treat it as a baseline, a specification,
or an opinion. It will be deleted.

The one property in it worth preserving is a constraint on the problem rather
than a solution to it: affirmations count by distinct family line, not by
headcount. Three cousins do not outweigh three unrelated households.

**Emphasis is by weight ordering.** The highest-weight claim at a node is the
primary reading; competing claims stay visible inline. There is no "community
accepted" status and no endorsement threshold. Dissent is preserved, not
adjudicated. (An earlier scope draft described an endorsement mechanism. That
draft is stale.)

**Media attachments are stubs.** The content capture layer is not scoped for
this semester. Media fields exist in the shape the API contract describes and
are empty.

## Open questions being carried, not answered

These are live. If you have an opinion, bring it to a sync.

- Whether coexisting attributed renderings is the right model for translation
  at all, or whether it encodes an engineer's assumption about how translation
  works. There is a question out to a translation scholar.
- Whether `disputeTarget` should stay as typed elements or become character
  spans into the claim text. Typed elements were chosen because they are
  authorable by hand and give a renderer what it needs without offset math.
  Spans remain reachable.
- Parallel language trees with cross-tree references — a future cohort's
  research question. The schema is built not to foreclose it: `language` on
  claims, `sourceLanguageText` as a first-class field, a `reference` edge type
  that can cross a language boundary. Nothing more than that.
