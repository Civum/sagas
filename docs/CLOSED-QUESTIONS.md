# Closed questions

These are decisions that came out of `DESIGN-QUESTIONS.md`. The reasoning is
kept because somebody who runs into one of these next year needs to know it was
considered. Without it they reopen the question from scratch.

## What "closed" means here

**A resolved question can still be absent from the code.** Each entry says what
it is waiting on. If the contract still has the old shape, that is expected.

**A closed question can be reopened.** Every entry states its reasoning so you
can read it and disagree. Bring the argument. What causes trouble is building
against a decision without raising it.

**Nothing here is a commitment about dates.** "After the intelligence team has a
working scorer" is a dependency, not a date.

---

## `affirmation` duplicates a passover tier

This is resolved and not yet implemented. It has to be made in the same change
as "A dispute should be a claim", because both move the fixture counts that
`packages/fixtures/behaviour/scoring-contract.ts` asserts. Neither is made until
the intelligence team has a working scorer, for the reason under "Why it is not
a Part 1 change" below.

**Now:** `affirmation` is an id, a claim id, a contributor id and a timestamp.
`passover` is the same, plus a `kind`, and one of the kinds is `sounds_right`.
An affirmation is a passover with `kind: sounds_right`. That is one mechanic
stored in two objects.

**The problem:** the same act lands in a different object depending on which
button an interface showed. `affirmationCount` reaches the scorer and passovers
reach nothing, so whether a reader nodding counts is decided by the interface
rather than by what the reader did.

**The fix:** `affirmation` goes away. One reaction object with a kind.
`affirmationCount` becomes a count of passovers where kind is `sounds_right`.
All three kinds feed the same thing, which is how much a node is surfaced rather
than how true it is. Sounds right adds a little. Don't care adds nothing to the
claim and still records that somebody saw it, which is information about reach.
Don't know also adds nothing and says the claim has not reached anybody able to
judge it. None of them create edges. None of them are votes.

**There is no fourth value for disagreement.** There is no "that's wrong" and
there should not be. A cheap negative is a downvote, and disputes carry
reasoning on purpose.
What is missing is a way to say "somebody who knows should look at this"
carrying no weight at all, and `flag` may already be that mechanism sitting in
the wrong place.

**Why it is not a Part 1 change.** Deleting the object moves fixture counts and
therefore the derived states, and `affirmationCount` and `affirmations` appear
on fourteen lines of `packages/fixtures/behaviour/scoring-contract.ts`, which is
the file the intelligence layer's first task runs against.

## A dispute should be a claim

This is resolved and not yet implemented. It is made in the same change as the
`affirmation` and `passover` merge, after the intelligence team has a working
scorer.

**Now:** `claim_disputed` produces an edge carrying reasoning and an optional
proposed value. The reducer writes it into `disputes`. An extension, by
contrast, produces a claim with a `parentClaimId`. So one of the two ways of
responding to a claim creates a node and the other does not.

**What works today:** the proposed value is already corroborated.
`competingValues` counts distinct family lines per proposed value, so two people
independently saying 1914 register as two lines for 1914. Disputes are not
contentless.

**What does not:** the reasoning. Somebody citing a hotel register and somebody
citing what their aunt said both count as one line for the same value, and there
is no way to back one and not the other. The reasoning is an assertion that
cannot be corroborated, extended, or disputed, which is strange, because an
independent confirmation of a dispute is exactly the kind of thing this archive
should be able to record.

**The shape:** a dispute is a claim that carries a dispute edge. Node for the
assertion, edge for what it targets. `disputeCount` does not change in value,
since a dispute still produces one edge against its target, so the ten scoring
rules keep reading the same number. What becomes possible later is a dispute
with its own weight, which is a new field in `ScoringInput` rather than a
changed one.

**A dispute-claim carries a `recordId`, like every claim.** A dispute then has
provenance. Without it, a dispute would be the only assertion in the system with
none, and it is the assertion type most likely to be casual or hostile. It also
keeps `claim.recordId` non-optional. An optional foreign key in the middle of
the core object means every consumer branches on whether it is there, for as
long as the field exists. The cost is that disputing means typing what you
know rather than clicking, which is consistent with disputes already requiring
reasoning.

**What is still open:** whether `translationDispute` collapses into the same
shape at the same time. It is the same idea applied to a different target and it
is already logged as a duplicate in Part 1.
