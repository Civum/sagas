# Design questions

Things in this codebase that are wrong, or at least unsettled, with no decision
made about them yet.

This is not a list of bugs and it isn't a backlog. Every item here is a real
question with arguments on both sides, written down so you can see the shape of
the problem before you run into it.

## How to use this

**Read the section that touches what you're working on before you refactor
anything.** Some of these look like sloppiness and aren't. Others look
deliberate and aren't. The difference is written down here rather than left for
you to guess.

**Disagreeing with a decision is normal and welcome.** Most of these are here
because I couldn't work out the answer, not because anyone is attached to the
current one.

**If you find a question this file missed, add it.** A pull request that adds an entry
here is worth as much as one that changes code. Possibly more, because the next
team reads this file too.

The first three sections are sorted by how much conversation an answer needs.
Part 4 is different: those are not for this project to answer at all, and the
section says why.

---

# Part 1 — Answerable with a pull request

Local, contained, and you don't need permission. Open a PR with your reasoning
and bring it to a check-in.

## The three edge types are copy-pasted

**Now:** `disputeEdge`, `extensionEdge`, and `referenceEdge` in
`packages/contracts/src/model.ts` each declare their own `id`,
`contributorId`, and `createdAt`. So do `affirmation` and `passover`.

**Why:** so the whole model reads top to bottom without following an
inheritance chain. Also because it was written to the
requirements rather than to the pattern behind them.

**The problem:** five places to change when the shared part changes, and nothing
stops them drifting. It also hides something true, which is that every one of
these is a person doing something to something at a time.

**Why this is hard:** a shared base type is obviously correct and makes the file
harder to read straight through. Zod's `.extend()` handles this cleanly, but
inferred types get harder to follow in editor tooltips, which matters when
you're learning the model.

## Every id is just `string`

**Now:** `SiteId`, `ClaimId`, `ContributorId` and the rest are all aliases for
`string`.

**The problem:** nothing stops you passing a claim id where a contributor id
belongs. TypeScript will let it through and you'll find out at runtime, or
worse, not at all.

**Why this is hard:** branded types fix it (`type ClaimId = string & { __brand:
'ClaimId' }`) at the cost of needing a cast every time you construct one from a
plain string, which is often. Zod supports `.brand()`. Whether the friction is
worth the safety depends on how much id-juggling the code ends up doing, which
nobody knows yet.

## `translationDispute` and `disputeEdge` are the same idea

**Now:** two separate shapes. One objects to a claim, the other objects to a
translation. Both carry a contributor, a target, reasoning, and a timestamp.

**The problem:** they will keep diverging. A third kind of objection is already
foreseeable (see Part 2), and it'll be a third copy.

**Why this is hard:** merging them means a target that can point at different
kinds of thing, which is either a discriminated union or a polymorphic
reference. Both are more complex than what is there now. The question is whether
that complexity is worth paying for today or once there are three.

## A transcript and a translation are the same kind of thing

**Now:** `transcript` and `translation` are separate shapes. One turns audio into
text, the other turns text in one language into text in another. Both are one
person's interpretation of a record, both are attributed, both allow more than
one to exist, and neither has a slot for the correct one.

**Why:** they arrived at different times, for different teams.

**The problem:** a third will show up. Text pulled out of a scanned letter is the
same shape again, and `mediaDerivative` already has a `text_extract` kind that
half-does it.

**Why this is hard:** merging them needs a single shape with a source, a target
language, a method, and a person, which is more abstract than either of the two
and reads worse for the common case. The transcript that starts as machine
output and gets corrected by a person is the case that breaks most attempts at
this, so try that one first.

---

# Part 2 — Bring it to a check-in first

These change the shape of the model, which means they affect more than one team.
Raise them before building.

Two entries here are marked **decided, not built**. They are not open questions.
They are settled shape changes waiting on a safe moment to land, and they sit
here because that is where somebody looks for a shape change.

## What does an interface do with "sometime in the fifties, probably"?

**Now:** what somebody said about time is kept in their words, as the `excerpt`
on a date element. `1963-1964` sits next to "this would be 1963, 1964".
`before boarding house` sits next to "Before the boarding house". Nothing
normalises those into a year, and there is no period field on a claim.

**Why:** there used to be one. It was a bucket like `depression_war_1930_1945`,
chosen by whoever typed the record in, and it was deleted. It was a second,
coarser copy of information the excerpt already held, nothing read it, and half
the values in the fixture were the scaffold guessing.

**The problem:** you cannot sort or filter on a phrase. "During the war" and
"1943" belong near each other on a timeline and no code can currently tell.

**Why this is hard:** normalising into a range makes filtering work and implies
precision nobody has. Showing the raw phrase is honest and unsortable. Doing
both is clutter, and doing neither means the archive has no way to answer "what
do we know about the fifties".

Whatever you build here has to keep the words. A range calculated from a phrase
is a reading of it, and readings in this project are attributed and contestable
rather than silently replacing the thing they read.

## A claim is a telling and an assertion at once, and probably shouldn't be

**Now:** a `claim` holds both a person's telling and the assertion inside it.
`cl-boarding` in the Anduiza fixture is simultaneously Marisol's account of her
great-grandmother and the assertion that the boarding house opened in 1922. A
dispute attaches to the claim.

**The problem:** disputing the claim visibly disputes the person. Someone's
account of their own family is personal, and giving one takes a bit of courage.
A system where the public picks it apart has the wrong feel no matter how
carefully the interface is worded.

**A shape worth considering:** separate the artifact from the assertions. A
photograph or a recording just exists, and there is nothing to disagree with. What
people disagree about is what it *means*. So the artifact becomes uncontestable
by construction, and disagreement lands on someone's reading of it, which is
impersonal.

**What that opens up:** if the artifact is separate, a contribution can be a
photo with one sentence, or a letter, or a recording. Someone elderly with a
story wouldn't also have to be a transcriber and a translator. The current model
has nowhere to put any of that.

**What it costs:** a whole layer that does not exist, and a new question. Who
writes the interpretation, and does a family accept a stranger doing it?

## Should one claim hold more than one assertion?

**Now:** a claim is a paragraph with typed `elements` inside it. Disagreement
points at an element id.

**An alternative:** "my grandfather ran sheep through Bruneau Canyon in 1943"
becomes three claims: a person, a place, a date. Each one is a single
assertion.

**What that buys:** a date claim compares directly against a date claim from
another source, with no digging into a paragraph. Disputes point at a claim and
the element-id indirection disappears. The three edge types become one shape.

**What it costs:** more work at entry time. And `1943` on its own means nothing,
so something has to group atomic claims back into a readable statement.

## How does a record get a location?

**The requirement, which is not up for debate:** a record ends up with a
location, and the record says how it got one. Everything below is how.

**Now:** `capturedLocation` holds coordinates, a `method` of `placed`,
`geocoded`, `embedded`, or `inherited`, and an optional `accuracyMetres`.
Separately, `site.coordinatePrecision` is `approximate` or `surveyed`.

**The problem:** `coordinatePrecision` collapses two different things. A photo's
embedded GPS is precise to a few metres and frequently wrong, because the camera
was across the street from the building. A pin dropped by the granddaughter of
the woman who worked there is imprecise and authoritative. Method and precision
are separate axes and that enum has one.

**The routes, with what each costs:**

- *A pin on a map.* No external dependency, no credentials, and the person
  placing it usually knows the building. Bad on mobile, bad for someone who
  doesn't recognise the street layout from above, and hopeless for a place that
  isn't there any more.
- *Geocoding an address.* Familiar to enter and works from a letterhead. Needs an
  external service with credentials, gets vague once you leave a city grid, and
  returns a point on a street rather than a building.
- *Reading it out of the file.* Free, already in most phone photos, and the only
  route that needs nobody to do anything. Also the most confidently wrong, and it
  is a privacy question: somebody uploading a family photo has not necessarily
  agreed to publish where they were standing.
- *Inheriting the place's coordinates.* Always available, never adds anything.

**The harder half, and this is the open part:** should precision be stored or
worked out? A stored number is somebody's guess written down once. A derived one
could take the method, the source, and how much else agrees, and produce
something better than any single guess.

But a derived figure that drives where a pin renders means changing the formula
silently moves every pin on the map, with no record of where they used to be.
That is the same problem `WEIGHT_MODEL_VERSION` exists to handle in the fixtures,
and it is not obvious that location deserves a lighter answer than weight did.

**Worth reading first:** geocoders already solved the reporting half of this.
Google's geocoding API returns a `location_type` of `ROOFTOP`,
`RANGE_INTERPOLATED`, `GEOMETRIC_CENTER`, or `APPROXIMATE` alongside the
coordinates. There is an established vocabulary here and inventing a worse one
would be a shame.

## Agreement and corroboration are collapsed into one thing

**Now:** `affirmation` covers both.

**The problem:** these aren't the same. Someone reading a claim and agreeing
carries almost no evidence. Two families independently having a record about the
same building is real corroboration and it should count for far more.

**Worth knowing:** the fixture data currently has no example of the second kind.
Every instance of agreement in it is a reader clicking agree. That's a gap in
the test data as much as in the model.

## A profile has no way to say whether anyone can prove it is theirs

**Now:** `contributor` carries an id, a display name, a lineage, an institution,
a joined date, and the invented flag. Nothing says whether the person behind it
can get back to it. This semester every profile is a guest id kept in browser
storage.

**The problem:** a guest id is a way in, not an end state. Somebody starts
contributing without signing up and verifies later. The model has no word for
the difference, so nothing can treat the two differently, and nothing can
connect them when verification arrives. On the day accounts exist, every
contribution made this year is stranded.

**The cheap part:** one field on `contributor` saying which kind it is. It is
additive and needs no migration. It also lets a scorer treat a distinct verified
person differently from an unrecoverable one, which is not reputation. It is the
same kind of signal as counting corroboration by distinct family line. It asks
whether this is one person once, not whether the person is any good.

**The expensive part, and this is the open one:** linking. If guest G and
verified V turn out to be the same person, and V once affirmed a claim by G,
that affirmation was never independent. Linking two profiles retroactively
invalidates corroboration the archive has already counted, and claims that were
shown as well supported because of it. It is the three cousins problem arriving
through identity instead of family.

Do not build profile linking until there is an answer to what happens to
everything the archive already said on the strength of the old counts.

## Resolution is a missing edge

**Now:** there are three edge types. Dispute, extension, reference. When a claim
settles an earlier disagreement it is filed as an extension, and nothing records
that it was written to settle anything. The fixture has one at t3 and the only
place it is called a reconciliation candidate is a comment.

**The problem:** the archive cannot tell somebody adding context apart from
somebody proposing that two conflicting readings were both true. Those are
different acts and a reader should be able to see which one happened.

**The cheap version:** an optional field on `extensionEdge` listing the disputes
it claims to resolve. Do not add a fourth edge type. The contract has three,
dispute and extension and reference, and Part 1 already asks whether those three
should collapse into one. A fourth would make that worse.

A resolution, on this reading, is not a new kind of thing. It is a claim
attached by an extension edge that names what it settles, which is the same
node-and-edge shape everything else has.

**A second reading, which is not the live one.** Take `reference` out of
`edgeType` and put `resolution` in, so resolution becomes a third type rather
than a fourth. That was raised on 15 September and set aside, and the argument
for it did not survive the fields: `referenceEdge` has a `fromClaimId` and an
optional `toClaimId`, so a reference does come from a claim and can point at
one. What is actually unlike the other two is that its target is optional and
may resolve to nothing, and that it marks a span of text rather than asserting
anything. Whether that is enough to move it is open, and it is a good question
for a diagram to argue. Until somebody does, the cheap version above is the
live proposal.

**What a system can do here is propose, not decide.** Disputes already target
specific elements, so the set of open conflicts at a node is computable without
reading anything. Showing somebody "these two readings disagree on the date and
on the owner, do you want to write something that covers both" is the same
pattern as proposing cross-language matches for a person to confirm.

**Two things not to build.**

Requiring the people who raised the disputes to accept a resolution hands one
person a veto over the record. In a community that already disagrees, a single
holdout freezes a node forever.

A consensus threshold that flips a resolution into an accepted state is the
endorsement mechanism this project removed. Passovers are not votes and the
contract says so. A resolution is a claim. It carries weight like any other
claim, it can be disputed like any other claim, and it locks nothing.

## `affirmation` duplicates a passover tier

**Decided, not built.** Ships in the same pass as "A dispute should be a claim",
after the intelligence team has a working scorer.

**Now:** `affirmation` is an id, a claim id, a contributor id and a timestamp.
`passover` is the same, plus a `kind`, and one of the kinds is `sounds_right`.
An affirmation is a passover with `kind: sounds_right`. There are not two
mechanics here. There is one, stored twice.

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

**Careful with a fourth value.** There is no "that's wrong" and there should not
be. A cheap negative is a downvote, and disputes carry reasoning on purpose.
What is missing is a way to say "somebody who knows should look at this"
carrying no weight at all, and `flag` may already be that mechanism sitting in
the wrong place.

**Why it is not a Part 1 change.** Deleting the object moves fixture counts and
therefore the derived states, and `affirmation` appears fourteen times in
`packages/fixtures/behaviour/scoring-contract.ts`, which is the file the
intelligence layer's first task runs against.

## A dispute should be a claim

**Decided, not built.** Landing with the `affirmation` and `passover` merge,
after the intelligence team has a working scorer.

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
keeps `claim.recordId` non-optional, which matters more than it looks: an
optional foreign key in the middle of the core object produces branching logic
in every consumer for years. The cost is that disputing means typing what you
know rather than clicking, which is consistent with disputes already requiring
reasoning.

**What is still open:** whether `translationDispute` collapses into the same
shape at the same time. It is the same idea applied to a different target and it
is already logged as a duplicate in Part 1.

# Part 3 — Open by design

Left open on purpose. Not homework and not blocking anything, but this is where
the project gets interesting.

Open here means I do not have an answer. I have not looked into whether anyone
else does.

Two kinds are mixed together. Some I have no answer to at all. Others could be
settled in this repo and deliberately are not, because designing them is the
deliverable rather than a distraction from it. Either way the answer is yours to
argue for.

## How do you tell a good source from a bad one?

This is the biggest open question in the project and the intelligence layer's
main deliverable. Everything else in Part 3 depends on it.

Some claims deserve more weight than others. Somebody who has contributed twenty
things that other people independently backed is not in the same position as
somebody who arrived yesterday. Saying so is reasonable. Every method of saying
so that I have thought of has a failure mode worse than the problem it solves.

**What you have to work with.** `contributorStanding` in the contract records
what each person has done. Records submitted, claims written, claims that
somebody else backed, claims somebody disputed, disputes raised, how many of
those disputes proposed an alternative instead of only objecting, affirmations,
translations, transcripts, flags, and when they were first and last active.
These are counts. There is no score, and that is deliberate.

That list is the constraint on your answer. An algorithm can only use what the
model wrote down. If you want a signal that is not there, that is a contract
change and a useful one. Ask for it early.

**The rule is this.** How somebody is regarded should not outweigh the
record of what that person has actually contributed. Those two things come apart
more often than you would expect, and most shortcuts in this area work by
quietly substituting the first for the second.

**Why the obvious answer is dangerous.** If a claim's weight depends on its
author's standing, then people who have been contributing longer carry more
weight on every claim they make, whatever the claim says. The archive would
start agreeing with whoever showed up first. That is a large effect, not a small
one.

The same problem appears in moderation. Sorting reports by the reputation of
whoever filed them is the obvious design, and it means a report from a
well-known person is looked at first every time. My position is that standing
can decide what a person looks at first, and should never decide what
disappears without a person looking at it. That is untested and may be too weak
to be useful.

**Things worth trying.** Corroboration from unrelated people is the one signal
that cannot be produced by enthusiasm alone, and it is already counted. Whether
a dispute produced a new record or only more disputes is structural and needs no
reading. A claim nobody has engaged with is not a doubted claim, so standing
built on engagement will undercount claims nobody has seen. And nothing in the
model lets one contributor vouch for another, so somebody the whole community
knows looks exactly like a stranger until they have posted enough.

**What to avoid.** A single number. As soon as standing becomes one score it
will be displayed, and then somebody's account of their own family has a rating
next to it.

## Can someone take their record back?

The model says nothing is deleted. Disagreement is preserved rather than
resolved away, which is most of the point.

But that's a principle about *disagreement*, and it collides with a principle
about *consent*. If a family contributes a record and decides years later they
don't want it public, what happens? What happens to the interpretations and
claims built on top of it?

You can see the hole in the code. `submissionState` runs from `draft` to
`published` and has no exit, because adding one would have been answering this.
`flag` has a `not_mine_to_share` reason, which is somebody raising exactly this
problem, and nothing downstream knows what to do when that flag is upheld.

I don't have an answer. It's the most likely thing to matter in practice.

## Silence is not doubt

A claim nobody has engaged with tells you about attention, not truth. Nothing in
the current model distinguishes "this is doubtful" from "nobody who could speak
to this has seen it".

This matters more here than in most systems. The records most likely to sit
untouched are the ones not in English, from rural places, from small families,
from people who aren't online. If the interface makes silence look like doubt,
it quietly discounts exactly the material the archive exists for.

One idea is to stop treating a skip as silence. If someone works through the
claims on a site and moves past one without extending it or disputing it, ask
which it was. Not knowing, agreeing with nothing to add, and not caring all look
identical today and are not the same signal at all.

Whether asking is honest is the open part. Someone who skipped because they were
tired now has to pick one of your categories, and what comes back is partly an
artifact of having asked. A manufactured signal is worse than a missing one,
because it looks the same as a real one.

## How do claims compare across languages?

A claim in Euskara and a claim in English can be about the same building
and the same year. Working out that they agree is easy for a person and hard for
a machine, especially for Euskara, which has very little training data and isn't
related to anything else in Europe.

Part of it is easier than it looks: a date is `1943` in any language, and a place
is a pointer. Structured comparison gets you further than it seems before any
language model is involved.

The rest is open. Whatever handles it should propose matches for a person to
confirm rather than asserting them.

## What shape is an argument?

Some disagreements are productive. People bring new material, the record gets
better. Others are two people restating themselves at each other, or a group
agreeing loudly and calling the noise corroboration.

You can tell these apart structurally, without reading anything. Do disputes
land on different parts of the claim or pile onto one? Does a dispute produce
new records, or only more disputes? How many distinct families are involved?
Does anyone reply?

What you'd *do* with that is the open part. Letting it change how much a claim
weighs is the tempting option and probably the dangerous one.

## Moderation without majority capture

Flags need prioritising or the queue is useless. The obvious approach weights
them by the reputation of whoever flagged.

The obvious approach also lets an established majority bury a minority claim.
This community has real internal divisions, so that isn't hypothetical.

The idea is that reputation should decide what a human looks at first
and never what disappears on its own. That has not been tested.

## What groups claims together at a site?

Claims attach directly to a site, so every claim at a place sits in one pool. A
site accumulates unrelated topics: who cooked there, what the floor was made of,
who owned it in 1912. Nothing in the model separates them, and a reader arriving
at a busy site gets one long undifferentiated list.

One option is that a record introduces a conversation and claims live inside
conversations, which makes the grouping a stored thing with an author.

Another is that grouping is computed rather than stored, so it is a clustering
problem over claim text and elements and it changes as the archive grows.

A third question sits underneath both. Whether a record carries a score of its
own. Not the quality of the artifact, but something derived from what the
conversations on it turned out to be worth. That may be a real quantity or a
category error.

This is the intelligence layer's first assignment and their entity relationship
diagram is the first attempt at an answer.

## Is the reason a claim scores what it does shown to the person who wrote it?

A contributor can see a weight. Whether they can see why is open.

Showing the reasoning is the honest option and it is what an archive built on
attribution ought to do. Somebody whose account sits low deserves to know it is
because no independent family line has backed it yet, rather than being left to
guess that the system disliked them.

The objection is that a visible rationale is a specification for gaming it. If
the interface says a claim needs corroboration from another family line, that is
also an instruction for how to manufacture one.

Whether that objection survives contact with this particular archive is not
obvious. Manufacturing a second family is harder than manufacturing a second
account, and the lineage count is the one signal enthusiasm cannot produce on
its own. It may be that the gaming risk is small enough here to pay for the
honesty.

## Can trust be inherited?

A new contributor starts at zero, which is correct and also useless. Nobody
builds standing without contributing, and not many people contribute into a
system that treats them as nobody.

One way out is vouching. An existing contributor vouches for a newcomer, who
inherits some fraction of their standing. LinkedIn works roughly like this and
never quantifies it. Bounded trust propagation over a social graph has a long
literature behind it, most of it concerned with capping how much damage one bad
actor can do.

The objection is less about bots than it looks. A bounded metric handles fake
profiles reasonably well. It does nothing about a large real family whose real
members really do vouch for each other, which is the failure this project
actually cares about, arriving through a different door than the one
`independentLineageCount` is watching.

Staking makes it worse before it makes it better. If vouching couples two
people's standing, then in a community with existing divisions vouching becomes
a political act, and people decline to vouch across a line they already don't
cross. The trust graph reproduces the split it was meant to see past.

It also collides with a decision already made. `ScoringInput` is never given an
author, only facts derived from who contributed. Inherited trust is a property
of a person rather than a derived fact, so it cannot be used without breaking
that. That may still be the right
trade. It hasn't been argued.

## `independentLineageCount` defaults to the answer it exists to prevent

Independence is the load-bearing idea in the whole model. It is what separates
five cousins agreeing from two families agreeing, and it is what `ScoringInput`
gets instead of an author. Everything rests on it.

**Now:** it is counted from `lineageId`, a hand-authored optional string on a
contributor. Six fixture contributors have one, assigned by hand so that `t1`
can demonstrate a cousin affirming a cousin. Nothing derives the field and, with
no logins, there is nothing to derive it from.

**What happens when the field is absent.** `reduce.ts` falls back to
`solo:<contributorId>` when the field is absent. So an unpopulated archive does
not lose the count. It gets a count where every contributor is their own family
line, which means `independentLineageCount` becomes a headcount of distinct
affirmers.

That is the failure the field exists to prevent, stated in `model.ts`: without
it, a large family can make a shaky claim look well-supported just by showing
up. The default resolves in the permissive direction, silently, and the
experience layer renders the result to a person as "Backed by 3 other families".

The comment above the fallback calls it "the guard against three cousins reading
as three independent sources". It is the guard's off switch. The guard only
operates on hand-authored data.

**Why fixtures and production need different answers.** The fallback is right
for fixtures, where the alternative is pretending eight invented people are one
family. It is wrong for production, where the alternative is admitting the
system does not know. One line of code is doing both jobs, which is why it gets
one of them wrong.

**Candidate: write `solo:` when the fixture is authored.** Make the fallback
explicit. A fixture contributor with no family gets `solo:` written in by hand,
and the reducer treats a missing lineage as unknown. The fixtures still
demonstrate everything they demonstrate today, and production fails closed. That
exposes the question underneath, which is what a claim is worth when
independence is unknown rather than absent. There is no value for "unknown" to
say it with.

**Not decided.** Vouching, in the next entry, is the other candidate. It is the
only one that could give the field a source instead of an honest default. Until
something answers this, anything reading `independentLineageCount` outside the
fixtures is reading a number with no source, and anything displaying it is
making a claim about people that nobody made.

## Can vouching carry what lineage cannot?

`lineageId` is hand-authored and nothing derives it, which is why six scoring
rules that depended on it were removed. Nothing in the model lets one
contributor stand behind another either, so somebody the whole community knows
looks exactly like a stranger until they have posted enough.

One mechanism might cover both. If a contributor can vouch for another, and a
vouch carries a reason, then one of those reasons is that the two are related.
Lineage stops being a field somebody typed and becomes something a person said,
with a name and a date on it, which can be disagreed with like anything else.

What is unresolved: a vouch is as gameable as the field it replaces, and two
profiles vouching for each other as family is self-declared lineage with extra
steps. What it adds is attribution. A hand-authored `lineageId` has no author.
A vouch does, and that makes it contestable.

It also runs straight into the linking problem in Part 2, because a vouch
between two profiles that turn out to be one person is worth nothing, and the
archive will already have counted it.

## How does a reference become an edge?

"What makes a place significant?", further down this section, assumes a graph
of claims pointing at places. Nothing creates that graph.

Someone writing about a boarding house mentions the Basque Museum. To a reader
that is a reference. To the database it is four words in a text field. Nothing
links them, and the significance question cannot be asked until something does.

Doing it with a language model means guessing, and guessing wrong permanently.
Asking authors to link as they write means most references go unlinked, because
someone writing about their grandmother is not thinking about the graph.

Another option is to let a person mark a span of text as a reference and, if the
place isn't in the archive yet, let the mark stand unresolved. It costs the
author one gesture and no lookup. The reference exists as data immediately and
gets pointed at a real place later by whoever reads it next. Ambiguity becomes
something to hand to a reader rather than something to solve.

The side effect is worth more than the feature. Resolving "Angie's" to the
Basque Museum records what the community actually calls the place. That cannot
be derived from documents, because it was never written in one. A person
confirming it is the only source there is.

Open: whether people mark anything at all, and whether an unresolved mark is
data or a to-do item nobody clears. Claims written before marking existed are
a separate problem with no obvious answer.

## Does a late dispute count for less?

The idea is that a dispute raised long after the claim it targets carries less
influence on its own than one raised close to it, and that corroboration can
overcome the damping. A weak signal backed by enough independent people still
ends up strong.

A period ends when activity on a topic rises, holds, and falls away. That
boundary comes from engagement, which is doing something different from ranking
by popularity. Engagement says when a period closed. It does not say what is
good inside one, and the damping would apply to everything in a period equally.

Check this before anything else: the model records one date where this needs
three. When the thing happened, when the person came to know it, and when they
said so. `record.capturedAt` is when the artifact was made, so a recording made
in 2026 of a story somebody was told in 1960 about 1922 carries one of the
three. Without the other two, any damping is measuring when somebody got around
to typing.

Open:

- How is distance measured? Period count and elapsed time come apart. A busy
  site might pass through six periods in a year while a quiet one sits in one
  for three, so damping by period penalises a dispute on the busy site six times
  harder for the same calendar gap. That might be right, on the grounds that
  activity means the record was being examined and somebody missed the window.
  It might also be an artifact.
- Does it apply to every edge or only to disputes? An extension arriving late is
  enriching the record rather than attacking it, and damping extensions equally
  makes the archive harder to improve as it ages.
- How does a chain inherit it? If claims descend from a damped dispute, do they
  weigh less or more? That is a question about what the archive is for before it
  is a question about arithmetic.
- Cold start. With few contributors, one person's burst of activity closes a
  period. That is fragile exactly when the archive is thinnest.

## Is the unit of work a task?

Transcribing is a task. Translating is a task. Writing a claim is a task.
Working out who to ask is a task. If task were an object, behavioural history
would be per category by construction instead of tracked separately for each
activity.

`contributorStanding` is already the accounting half of this. Every field in it
counts a completed act. What a task object would add is the part missing
everywhere else: an addressable piece of open work with a state, which is what
makes a queue a queue rather than a step inside a form. The translation queue,
the transcript queue and the moderation queue are the same want, three times,
under three names.

There is one constraint. Some acts close and some do not. `flag` has a status.
`referenceEdge` has a resolved boolean. `disputeEdge` has neither, on purpose,
though the shape of a dispute is itself changing: see "A dispute should be a
claim" in Part 2. A dispute is a task that completes the moment it is filed and
never gets resolved,
and a task model that cannot express that will start asking interfaces to close
disagreements.

Logged as a direction, not a decision, and not this semester.

## What makes a place significant?

Before any of this works, references have to exist as data. See the question
above.

Some places matter more than others, and the archive should be able to say so
without anyone declaring it. One idea: a place referenced often in claims about
*other* places has earned significance from how the community talks, not from
anyone's opinion.

That's roughly PageRank over a reference graph, which is well-trodden. What might
not be is what the edges mean here. They are typed relationships, independence is
measured by family line rather than by count, and references are created by
people marking text rather than by authors linking.

## Maria the subject and Maria the profile

A person named in a claim is the same shape as a place named in one: a span
of text pointing at something that may not be in the archive yet. One marking
mechanism covers both, which is one feature instead of two.

A person is two entities though. Maria as the subject of a record is archival.
She is what the claim is about, and she may have died in 1961. Maria as a
contributor is a platform actor with behaviour and standing. Libraries have kept
these apart for a century. An authority record and a borrower card are not the
same object.

Most person references will never have a profile behind them. The people an
oral history archive talks about are mostly dead, so the subject is the normal
case and a living claimant is the exception. Designing it the other way round,
as profiles that can point at subjects, gets the common case backwards.

Whether being the subject earns weight is the obvious question, and the answer
is probably no. Being the person a story is about makes you one source among
many, sometimes a badly placed one. Families are unreliable about their own.

The less obvious question is the dangerous one. A living claimant usually does
not want more weight. She wants something taken down, softened, or corrected,
and an identity claim is how that pressure arrives. That is the same problem as
"Can someone take their record back?", reached from another direction.

Verifying an identity claim has a neat answer with a bad consequence. Neat: "I
am Maria" is itself a claim, so it corroborates and disputes like any other and
needs no new machinery. Bad: the people who can confirm it are her own family,
which is one lineage. Identity is the case where the independence rule is least
able to help and the case where being wrong costs the most.

---

# Part 4 — Not for this project to answer

Everything above this line is a question an engineer can reason about. These are
not.

They are decisions about how a community wants its own record kept, and no
amount of care in this repository substitutes for asking. That hasn't happened.
The design so far was made without anybody from the community it is modelled on,
and
that is worth knowing while you read the rest of this file.

**So this section is a commitment rather than a backlog.** These do not get
settled by argument, here or anywhere in this repo. A pull request answering one
would be the exact presumption the section exists to name.

What you can usefully do is notice when your work runs into one, and say so.
"I built this and I think it assumes something nobody has checked" is a good
thing to bring to a check-in.

## Who decides what a place is called?

A site has a formal `name` and a list of `aka`. Something had to be primary and
the official name got it.

That is not neutral. The name on the deed and the name people use are often
different, and which one leads is a small statement about whose record this is.

## Naming people who can't answer

Marking a place in someone's claim is low stakes. Marking a person is not.

Most people named in an oral history are dead. They did not consent, cannot
correct the record, and their descendants may not agree with each other about
what should be said. A person reference makes all of that permanent, searchable,
and joined across every claim that mentions them.

Whether the archive should do it at all is a question for the families in it,
not for whoever is writing the schema.

## Is this built for the community, or for people outside it?

Claims render in English, with the original preserved underneath. That
ordering assumes a reader who does not speak the original.

The reverse is a coherent design and it was never considered. Neither was
whether a community would want its record legible to outsiders at all.

## Is family the right unit?

Lineage independence is the load-bearing idea in this whole model. Corroboration
counts by family line, so three cousins are one source.

That assumes kinship organised into family lines, which is one model among many.
Where the meaningful unit is a clan, a house, a congregation, a village, or
something with no equivalent in the word "family", the arithmetic is measuring
the wrong thing while looking like it works.

## Should all of it be public?

Nothing is deleted and everything is visible. That is stated as a principle
throughout this repository, and it is a design position rather than a neutral
default.

For some communities, certain knowledge is not meant to be openly held. It may
be restricted by role, by season, by initiation, or by kin. An archive with no
way to express that is not neutral toward those communities. It is wrong for
them, and confidently so.

People have thought carefully about this and none of it has been reinvented
here. The CARE Principles for Indigenous Data Governance and the Local Contexts
project
are the places to start reading. If your work touches access, read them first.

## What should a disagreement look like to the people in it?

Preserving dissent instead of resolving it is the founding decision of this
project. It is also the one most likely to feel different from the inside.

Two families seeing their disagreement rendered permanently, publicly, with both
names attached, is a specific experience. Nobody has asked whether it is a
welcome one.

# Adding to this file

Same shape as Parts 1 to 3:

- **Now** — what the code does today
- **Why** — if there was a reason, even a bad one
- **The problem** — what goes wrong
- **Why this is hard** — what stops the obvious fix from working

Leave out the answer. If you know the answer it isn't a design question, it's a
pull request.
