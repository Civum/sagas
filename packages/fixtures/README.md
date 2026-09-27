# @sagas/fixtures

Development fixture data for the Sagas claim graph. Sponsor-owned and
**versioned**, not frozen: this data will change during the semester, because
changes here are how design pressure reaches both layers.

Your fork is pinned to a tag. A fixture change lands in your fork when we agree
at a sync to pull forward, never in the middle of your sprint. Every change
carries a contract version bump and a CHANGELOG line saying what a consumer has
to do about it. If one arrives without that, it's a mistake on our side. Say so.

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
fixtures/example-site/events.ts   ← the only authored artifact
src/reduce.ts                ← fold(events, upTo) → GraphState
states/example-site.t*.json       ← generated, do not edit
```

The log is in timestamp order and event ids are sequential, so `ev-041` really
did happen after `ev-040`. If you add an event in the middle, renumber.

This shape exists because the version-history timeline needs it. A state built
by folding knows exactly which contributions produced it, so
`eventIdsSincePrevious` on each state is a real answer to "what changed and
who changed it" rather than a second fiction that has to be kept consistent
with the first by hand.

```bash
pnpm build:states   # regenerate states/ and print a readable dump
pnpm test           # invariants over the derived states
```

If you need a graph state that doesn't exist yet, add a cut to `stateCuts`.
Don't write a state file by hand.

## The four states

| | integrity | claims | records | contributors | disputes | untranslated |
|---|---|---|---|---|---|---|
| **t0** sparse, single source | 23 | 3 | 2 | 1 | 0 | 0 |
| **t1** family corroboration arrives | 48 | 6 | 5 | 4 | 0 | 1 |
| **t2** documentary source contests a date | 65 | 7 | 6 | 7 | 4 | 0 |
| **t3** competing renderings, reconciliation candidate | 90 | 10 | 9 | 8 | 5 | 0 |

Counts come from the generated states. If you change the log, regenerate and
update this table, because a stale table here is worse than no table.

Each state deliberately exercises something:

- **t0** — everything single-source and low weight. A sparse site must look
  sparse on the map, not empty.
- **t1** — an affirmation arrives from the author's own cousin. Volume rises,
  independence does not. `cl-boarding` stays `single_source` with one
  affirmation on it. Also: a claim submitted in Euskara, kept and readable
  on the map, sitting outside the claim graph with weight 0.
- **t2** — an institutional source contests *one element* of an otherwise
  well-supported claim. The date is disputed; the location and the person are
  not. A rendering of the Euskara claim arrives and it enters the graph. The
  original is untouched.
- **t3** — a second rendering of the same claim coexists with the first, each
  attributed, with a preserved objection about what the first one loses. An
  extension satisfies both branches of an earlier disagreement (a reconciliation
  candidate). Two unresolved cross-site reference markers. A 600MB recording is
  still being processed when the log ends, and an open flag sits on a published
  record saying part of it was never the contributor's to give.

Records run underneath all of it. Nine of them, deliberately unalike: a written
record with no files at all that produced two separate claims, a photograph
whose embedded GPS puts the camera in the middle of the street, an audio
recording that took four months and four people to become readable in English, a
scanned register page, and one upload still in the queue. Every claim points at
the record it was read out of.

## What your interface has to handle

These are the situations a real archive spends its life in. They are what the
fixture data exists to put in front of you, and they are the closest thing this
project has to a specification.

They are **direction, not a specification of your work.** They say what must not
happen. How your interface satisfies them is your design, and most of what you
build will be things this list says nothing about.

`acceptance/cases.ts` holds a one-line version of each so the `/dev` page can
show the relevant ones next to your components. The reasoning is here.

### A thin record is not a broken one

Most places, most of the time, have three claims from one family and nothing
corroborated. That scores about 23 out of 100 and it is a real place with a thin
record.

An interface that renders it in red, or as an empty state, or as an error, tells
the person who just contributed that their family's claim failed. It did not.
It is early. This is the hardest judgment in the whole layer because it is the
common case and the easy design gets it wrong.

### Agreement is not corroboration

Someone reading a claim and agreeing carries almost no evidence. Two families
independently holding a record about the same building is real corroboration and
it counts for far more.

The model counts by family line, not by headcount, because three cousins are one
source. So an affirmation count on its own must never be presented as support.
Five people agreeing, all from the author's family, is one source with five
people in it.

### Disagreement lands on a part, not the whole

Somebody disputes the date. The address, the person and the event on the same
claim are untouched and still corroborated.

Marking the whole claim as contested throws away the thing that makes this
useful, and it does something worse: it makes a person's account of their family
look discredited when one detail is in question.

### Nothing gets adjudicated

When two readings compete, show both with their support. No winner, nothing
hidden behind an interaction, and never as a vote tally. The count is distinct
families, not people, and labelling it wrong turns evidence into a poll.

### A claim nobody has translated yet is not worth less

It is kept, readable in the original, and attributed. It carries no weight only
because there is nothing yet to compare it against. It is never hidden and never
sorted off the end of the page as though weight zero meant worthless.

When a rendering does arrive, that is somebody's contribution and should read as
one. Several renderings can coexist, none authoritative, and a reader who does
not speak the original still has to be able to see that two people disagree
about what it means.

### A record is a bundle, and a transcript is not a translation

What arrives is whatever the person had: a recording, a photograph with a
sentence under it, a page they typed, or several at once. One icon and one label
will misdescribe it.

A transcript says what a recording says. A rendering says what it means in
another language. Collapsing them loses the fact that somebody who speaks the
language has already verified the words, and that the remaining argument is
about meaning.

### Work in progress is not failure

A large upload still being processed is a job running, not a broken upload. The
record stays readable while it finishes, and nobody is told to try again.

### Reports and signals are not ratings

`sounds_right`, `dont_know` and `dont_care` are routing signals. They decide what
gets shown to whom. They are not quality scores, they must never be aggregated
into one, and a pile of `dont_know` must never read to a contributor as their
claim being rejected.

A report on a record is not a dispute and says nothing about whether the claim
is accurate. The model has no way to resolve one, so nothing may imply a record
has been reviewed and cleared.

### Contribution is not authorship

Somebody with no records and no claims, who has raised two well-reasoned
disputes and one report, is one of the more useful people in the archive. Any
view that ranks or lists contributors has to survive that.

Contributor standing is counts and only counts. Adding them up invents a score
the model deliberately does not have, and a score gets displayed, and then
somebody's account of their own family has a rating beside it.

### Everything traces to a person

Attribution is never optional and never anonymous. Any view that shows claim
text must be able to reach its source.

While the data is invented, every contributor carries a flag saying so, and that
flag must survive into anything anyone can see. A screenshot of development data
must not read as real testimony.

## What no fixture covers yet

Each of these is a real situation the record can be in. Until a fixture
exercises one, every team is free to get it wrong until integration, so closing
any of them is a useful pull request.

- A place with only untranslated claims, so nothing is in the graph at all
- A claim contested by a dozen people across many families
- A claim with no elements that is not awaiting translation
- A claim long enough to break a reading layout
- A place with exactly one claim and no contributors beyond its author
- Two places close enough together to collide as map markers
- A claim whose only affirmations come from people who joined the same day
- Two transcripts of the same recording that disagree about what was said
- The same file uploaded by two people, so the checksums collide and it is one
  source rather than two
- A record whose processing failed outright rather than still running
- A record nobody has read any claims out of yet
- A report that has been upheld, and whatever is supposed to happen next
- Somebody vouched for by a person everyone trusts, who has contributed nothing.
  There is no vouching in the model, so this cannot be represented at all
- Two contributors with identical standing counts whose contributions are
  obviously not equivalent

## Seeing what a change does

Two tools, and neither needs a browser.

### The diff is the visualisation

The states are calculated from the log, so changing anything upstream and
regenerating shows you the consequence in full:

```bash
pnpm fixtures:build
git diff packages/fixtures/states/
```

Change the scoring and every claim that moved appears in that diff. Which claim
now leads the article. How the integrity score shifted. Whether the claim
nobody has translated just got buried.

That is a regression test and a picture at the same time, and it is the only way
to reason about questions like "does this quietly discount small families". You
cannot see that in a unit test, because the unit test only knows the number it
was told to expect.

CI checks the committed states match what the log produces, so a change you
forgot to regenerate fails the build rather than drifting.

### Asking why one claim scores what it does

```bash
pnpm inspect                          # every claim at t3, one line each
pnpm inspect cl-boarding              # one claim, with its inputs
pnpm inspect --state t1 cl-boarding   # the same claim earlier
```

It prints what went in next to what came out, and tells you when the recomputed
weight disagrees with the stored one, which means the states need regenerating.

The point is the inputs. A weight on its own tells you nothing about whether
your scoring is defensible. `cl-boarding` at t3 scoring 1.50 means nothing until
you see that it has one affirmation, zero independent family lines, and three
disputes on its date.

## Boundaries

**There is no synthesis endpoint this semester.** These fixtures are what you
build against. The intelligence layer builds the synthesis engine in the spring. If you are
writing code that fetches narrative state over the network, stop and ask.

**`src/weight.ts` is not the weight propagation algorithm.** It is arithmetic
that exists so claims have an ordering to render. Designing the real one is
the intelligence layer's first-semester deliverable. Do not treat it as a baseline, a specification,
or an opinion. It will be deleted.

The one property in it worth preserving is a constraint on the problem rather
than a solution to it: affirmations count by distinct family line, not by
headcount. Three cousins do not outweigh three unrelated households.

**Emphasis is by weight ordering.** The highest-weight claim at a node is the
primary reading; competing claims stay visible inline. There is no "community
accepted" status and no endorsement threshold. Dissent is preserved, not
adjudicated. (An earlier scope draft described an endorsement mechanism. That
draft is stale.)

**There are no actual files behind the media.** The storage keys in the fixture
point at objects that do not exist, because committing a hundred megabytes of
invented audio to a git repository helps nobody. Everything else about a record
is real: sizes, durations, content types, processing states, derivatives. Putting
bytes behind those keys is content-layer work and a good early one.

## Open questions being carried, not answered

These are live. If you have an opinion, bring it to a sync.

- Whether coexisting attributed renderings is the right model for translation
  at all, or whether it encodes an engineer's assumption about how translation
  works. There is a question out to a translation scholar.
- Whether `disputeTarget` should stay as typed elements or become character
  spans into the claim text. Typed elements were chosen because they are
  authorable by hand and give a renderer what it needs without offset math.
  Spans remain reachable.
- Parallel language trees with cross-tree references. A future cohort's
  research question. The schema is built not to foreclose it: `language` on
  claims, `sourceLanguageText` as a first-class field, a `reference` edge type
  that can cross a language boundary. Nothing more than that.
