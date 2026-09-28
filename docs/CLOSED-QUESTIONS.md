# Closed questions

These are decisions that came out of `DESIGN-QUESTIONS.md`, kept with their
reasoning so that somebody who runs into one next year knows it was considered
and does not reopen it from scratch.

A decision here may not be in the code yet. Each entry says what it is waiting
on, so if the contract still has the old shape, that is expected. If you think a
decision is wrong, say so and bring the reasoning. What causes trouble is
building against one without raising it.

---

## `affirmation` duplicates a passover tier

This is resolved and not yet implemented. It has to be made in the same change
as "A dispute should be a claim", because both move the fixture counts that
`packages/fixtures/behaviour/scoring-contract.ts` asserts, and that file is what
the intelligence layer's first task runs against. So neither change happens
until that team has a working scorer.

An affirmation and a passover are the same thing. An affirmation has an id, a
claim id, a contributor id and a timestamp. A passover has all of that plus a
`kind`, and one of the kinds is `sounds_right`. So an affirmation is a passover
with that kind set, stored in a table of its own.

The trouble is that only one of them counts. `affirmationCount` reaches the
scorer and passovers reach nothing, so whether a reader nodding at a claim
counts for anything depends on which button the interface happened to show them.

The fix is to drop `affirmation` and keep one reaction object with a kind on it.
`affirmationCount` becomes a count of the passovers where the kind is
`sounds_right`. All three kinds feed the same thing, which is how much a node
gets surfaced rather than how true it is. Sounds right adds a little weight.
Don't care adds none, though it still records that somebody saw the claim, which
tells you something about reach. Don't know adds none either, and it says the
claim has not reached anybody able to judge it. None of the three create edges
and none of them are votes.

There should not be a fourth value for disagreeing. A cheap negative is a
downvote, and disputes carry reasoning on purpose. What is missing is a way to
say that somebody who knows should look at this, carrying no weight at all, and
`flag` may already be that mechanism sitting in the wrong place.

This is not a Part 1 change, the kind you can settle in a pull request on your
own. Deleting the object moves the fixture counts and therefore the derived
states, and `affirmationCount` and `affirmations` appear on fourteen lines of
that scoring contract.

## A dispute should be a claim

This is resolved and not yet implemented. It is made in the same change as the
`affirmation` and `passover` merge, after the intelligence team has a working
scorer.

Right now the two ways of responding to a claim are shaped differently.
`claim_disputed` produces an edge that carries reasoning and an optional
proposed value, and the reducer writes it into `disputes`. An extension produces
a claim with a `parentClaimId`. So one of them creates a node and the other does
not.

Part of a dispute already works. The proposed value is corroborated, because
`competingValues` counts distinct contributors per proposed value, so two people
independently saying 1914 register as two lines for 1914. Disputes carry
content.

The reasoning is the part that does not work. Somebody citing a hotel register
and somebody citing what their aunt said both count as one line for the same
value, and there is no way to back one and not the other. So the reasoning is an
assertion that cannot be corroborated, extended or disputed, which is strange in
an archive that should be able to record an independent confirmation of a
dispute.

The shape that fixes it is a dispute that is a claim carrying a dispute edge:
the assertion in the node, what it targets in the edge. `disputeCount` does not
change in value, because a dispute still produces one edge against its target,
so the ten scoring rules keep reading the same number. What it makes possible
later is a dispute with its own weight, which would be a new field in
`ScoringInput` rather than a changed one.

A dispute-claim has a source record like every other claim (the record its
conversation started from, `claim.sourceRecordId`), and it can carry evidence
records. So a dispute has provenance. Without it a dispute would be the only
assertion in the system with none, and it is the assertion type most likely to
be casual or hostile. The cost is that disputing means
typing what you know rather than clicking, which fits with disputes already
requiring reasoning.

One thing is still open, which is whether `translationDispute` collapses into
the same shape at the same time. It is the same idea applied to a different
target, and it is already logged as a duplicate in Part 1.

---

## Extensions target a detail

Decided on 27 September, not built. An extension points at a detail of the claim
it adds to, the same way a dispute does, with a fallback to the whole claim for
an extension that is about all of it ("my family ran it until the war"). The new
information an extension brings lives in its own record, which is attached as
evidence.

Still open: whether an extension needs reasoning the way a dispute does, and
exactly how the whole-claim fallback is expressed in the contract.

## `reference` is not an edge type

Decided and done on 27 September, in contract 2.0.0. `edgeType` is dispute and
extension. The forms a claim takes are extension, dispute and resolution, and
`reference` was never one of them. `referenceEdge`, the `reference_marked`
event, and the fixture references are gone.

What a reference was trying to do, letting a claim point at another place, is
still a real need. How that works is open, under "What makes a place
significant?" in `DESIGN-QUESTIONS.md`.

## Lineage is dropped

Decided and done on 27 September, in contract 2.0.0. `lineageId`,
`independentLineageCount`, `lineageDiversity` and `claimsCorroboratedByOtherLines`
are gone.

The rule stays: corroboration counts independent records, not people. What went
is the idea that a family is the unit of independence. The system records
behaviour, not identity, so it has no way to know who anybody's family is.
Nothing could ever fill the field outside the fixture data, so the fallback was
the only value it ever took. And family is the wrong proxy anyway. Two cousins
who heard one telling are one source, and two siblings who both saw the fire are
two.

In its place, the stand-in counts records: `independentRecordCount` is the number
of distinct records other contributors have brought to back a claim. Agreement
never counts. How independence should really be worked out from the graph (the
same record cited twice, the same branch, descent from the same root claim) is
the intelligence layer's design work.

This also closes "Can vouching carry what lineage cannot?" and "Is family the
right unit?". Whether vouching says anything about independence is still open.

