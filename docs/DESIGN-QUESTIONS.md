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

**The tension:** a shared base type is obviously correct and makes the file
harder to read straight through. Zod's `.extend()` handles this cleanly, but
inferred types get harder to follow in editor tooltips, which matters when
you're learning the model.

## Every id is just `string`

**Now:** `SiteId`, `ClaimId`, `ContributorId` and the rest are all aliases for
`string`.

**The problem:** nothing stops you passing a claim id where a contributor id
belongs. TypeScript will let it through and you'll find out at runtime, or
worse, not at all.

**The tension:** branded types fix it (`type ClaimId = string & { __brand:
'ClaimId' }`) at the cost of needing a cast every time you construct one from a
plain string, which is often. Zod supports `.brand()`. Whether the friction is
worth the safety depends on how much id-juggling the code ends up doing, which
nobody knows yet.

## `translationDispute` and `disputeEdge` are the same idea

**Now:** two separate shapes. One objects to a claim, the other objects to a
translation. Both carry a contributor, a target, reasoning, and a timestamp.

**The problem:** they will keep diverging. A third kind of objection is already
foreseeable (see Part 2), and it'll be a third copy.

**The tension:** merging them means a target that can point at different kinds
of thing, which is either a discriminated union or a polymorphic reference.
Both are more complex than what's there. The question is whether the complexity
is worth paying now or after there are three.

## A transcript and a translation are the same kind of thing

**Now:** `transcript` and `translation` are separate shapes. One turns audio into
text, the other turns text in one language into text in another. Both are one
person's interpretation of a record, both are attributed, both allow more than
one to exist, and neither has a slot for the correct one.

**Why:** they arrived at different times, for different teams.

**The problem:** a third will show up. Text pulled out of a scanned letter is the
same shape again, and `mediaDerivative` already has a `text_extract` kind that
half-does it.

**The tension:** merging them needs a single shape with a source, a target
language, a method, and a person, which is more abstract than either of the two
and reads worse for the common case. The transcript that starts as machine
output and gets corrected by a person is the case that breaks most attempts at
this, so try that one first.

---

# Part 2 — Bring it to a check-in first

These change the shape of the model, which means they affect more than one team.
Raise them before building.

## What does an interface do with "sometime in the fifties, probably"?

**Now:** what somebody said about time is kept in their words, as the `excerpt`
on a date element. `1963-1964` sits next to "this would be 1963, 1964".
`before boarding house` sits next to "Before the boarding house". Nothing
normalises those into a year, and there is no period field on a claim.

**Why:** there used to be one. It was a bucket like `depression_war_1930_1945`,
chosen by whoever typed the account in, and it was deleted. It was a second,
coarser copy of information the excerpt already held, nothing read it, and half
the values in the fixture were the scaffold guessing.

**The problem:** you cannot sort or filter on a phrase. "During the war" and
"1943" belong near each other on a timeline and no code can currently tell.

**The tension:** normalising into a range makes filtering work and implies
precision nobody has. Showing the raw phrase is honest and unsortable. Doing
both is clutter, and doing neither means the archive has no way to answer "what
do we know about the fifties".

Whatever you build here has to keep the words. A range calculated from a phrase
is a reading of it, and readings in this project are attributed and contestable
rather than silently replacing the thing they read.

## Accounts and claims are the same thing, and probably shouldn't be

**Now:** a `claim` holds both a person's telling and the assertion inside it.
`cl-boarding` in the Anduiza fixture is simultaneously Marisol's account of her
great-grandmother and the assertion that the boarding house opened in 1922. A
dispute attaches to the claim.

**The problem:** disputing the claim visibly disputes the person. Someone's
account of their own family is personal, and giving one takes a bit of courage.
A system where the public picks it apart has the wrong feel no matter how
carefully the interface is worded.

**A shape worth considering:** separate the artifact from the assertions. A
photograph or a recording just exists — there's nothing to disagree with. What
people disagree about is what it *means*. So the artifact becomes uncontestable
by construction, and disagreement lands on someone's reading of it, which is
impersonal.

**What that opens up:** if the artifact is separate, a contribution can be a
photo with one sentence, or a letter, or a recording. Someone elderly with a
story wouldn't also have to be a transcriber and a translator. The current model
has nowhere to put any of that.

**What it costs:** a whole layer that doesn't exist, and a new question — who
writes the interpretation, and does a family accept a stranger doing it?

## Claims might want to be atomic

**Now:** a claim is a paragraph with typed `elements` inside it. Disagreement
points at an element id.

**An alternative:** "my grandfather ran sheep through Bruneau Canyon in 1943"
becomes three claims — a person, a place, a date. Each one is a single
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

**The problem:** these aren't the same. Someone reading an account and agreeing
carries almost no evidence. Two families independently having a record about the
same building is real corroboration and it should count for far more.

**Worth knowing:** the fixture data currently has no example of the second kind.
Every instance of agreement in it is a reader clicking agree. That's a gap in
the test data as much as in the model.

---

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
headline deliverable. Everything else in Part 3 is downstream of it.

Some accounts deserve more weight than others. A person who has contributed
twenty things that other families independently backed is not the same as
somebody who turned up yesterday, and pretending otherwise produces an archive
where the loudest recent voice wins. But every mechanism for saying so has a
failure mode that is worse than the problem.

**What you have to work with.** `contributorStanding` in the contract records
what each person has actually done: records submitted, claims written, claims
that another family line backed, claims somebody disputed, disputes they raised,
how many of those disputes proposed an alternative rather than only objecting,
affirmations, translations, transcripts, flags, and when they were first and
last active. All counts. No score, deliberately.

That list is the real constraint on the answer. An algorithm can only be as good
as what the model wrote down, so if you find yourself wanting a signal that is
not there, that is a contract change and a useful one. Ask for it early.

**Why the obvious answer is dangerous.** Weight accounts by their author's
standing and you have built a system where established families outrank new
ones. In a community with real internal divisions, and this one has them, that
is not a rounding error. It is the archive quietly agreeing with whoever was
already winning.

The same trap shows up in moderation. Prioritising flags by the reputation of
whoever raised them is obviously correct and also lets a majority bury a
minority account. Current thinking is that standing should decide what a human
looks at first and never what disappears on its own, which is untested and may
be too weak to be useful.

**Some threads worth pulling.** Corroboration across family lines is the one
signal that cannot be manufactured by enthusiasm, and it is already counted.
Whether a dispute produced a new record or only more disputes is structural and
needs no reading. Silence is not doubt, and standing built on engagement will
systematically discount accounts nobody has seen. And there is nothing in the
model letting one contributor stand behind another, so somebody every elder in
the room would vouch for looks exactly like a stranger until they have posted
enough.

**The thing to avoid.** A single number. The moment standing collapses to one
score, it will get displayed, and a person's account of their own family will
have a rating next to it.

## Can someone take their record back?

The model says nothing is deleted. Disagreement is preserved rather than
resolved away, which is most of the point.

But that's a principle about *disagreement*, and it collides with a principle
about *consent*. If a family contributes an account and decides years later they
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

An account in Euskara and an account in English can be about the same building
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

The obvious approach also lets an established majority bury a minority account.
This community has real internal divisions, so that isn't hypothetical.

Current thinking is that reputation should decide what a human looks at first
and never what disappears on its own. Untested.

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
accounts reasonably well. It does nothing about a large real family whose real
members really do vouch for each other, which is the failure this project
actually cares about, arriving through a different door than the one
`independentLineageCount` is watching.

Staking makes it worse before it makes it better. If vouching couples two
people's standing, then in a community with existing divisions vouching becomes
a political act, and people decline to vouch across a line they already don't
cross. The trust graph reproduces the split it was meant to see past.

It also collides with a decision already made. `ScoringInput` is never given the
author. That absence is the strongest guarantee in the scoring code, and
inherited trust cannot be used without breaking it. That may still be the right
trade. It hasn't been argued.

## How does a reference become an edge?

The question below assumes a graph of accounts pointing at places. Nothing
creates that graph.

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
data or a to-do item nobody clears. Accounts written before marking existed are
a separate problem with no obvious answer.

## What makes a place significant?

Before any of this works, references have to exist as data. See the question
above.

Some places matter more than others, and the archive should be able to say so
without anyone declaring it. One idea: a place referenced often in accounts about
*other* places has earned significance from how the community talks, not from
anyone's opinion.

That's roughly PageRank over a reference graph, which is well-trodden. What might
not be is what the edges mean here — typed relationships, independence measured
by family line rather than by count, and references created by people marking
text rather than by authors linking.

## Maria the subject and Maria the account

A person named in an account is the same shape as a place named in one: a span
of text pointing at something that may not be in the archive yet. One marking
mechanism covers both, which is one feature instead of two.

A person is two entities though. Maria as the subject of a record is archival —
she is what the account is about, and she may have died in 1961. Maria as a
contributor is a platform actor with behaviour and standing. Libraries have kept
these apart for a century. An authority record and a borrower card are not the
same object.

Most person references will never have an account behind them. The people an
oral history archive talks about are mostly dead, so the subject is the normal
case and a living claimant is the exception. Designing it the other way round,
as accounts that can point at subjects, gets the common case backwards.

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

---

# Part 4 — Not for this project to answer

Everything above this line is a question an engineer can reason about. These are
not.

They are decisions about how a community wants its own record kept, and no
amount of care in this repository substitutes for asking. That hasn't happened.
The
design so far was made without anybody from the community it is modelled on, and
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

Marking a place in someone's account is low stakes. Marking a person is not.

Most people named in an oral history are dead. They did not consent, cannot
correct the record, and their descendants may not agree with each other about
what should be said. A person reference makes all of that permanent, searchable,
and joined across every account that mentions them.

Whether the archive should do it at all is a question for the families in it,
not for whoever is writing the schema.

## Is this built for the community, or for people outside it?

Accounts render in English, with the original preserved underneath. That
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
here. The
CARE Principles for Indigenous Data Governance and the Local Contexts project
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
- **The tension** — why the obvious fix isn't obviously right

Leave out the answer. If you know the answer it isn't a design question, it's a
pull request.
