# Design questions

Things in this codebase we know are wrong, or at least unsettled, and haven't
decided what to do about.

This is not a list of bugs and it isn't a backlog. Every item here is a real
question with arguments on both sides, written down so you can see the shape of
the problem before you run into it.

## How to use this

**Read the section that touches what you're working on before you refactor
anything.** Some of these look like sloppiness and aren't. Others look
deliberate and aren't. The difference is written down here rather than left for
you to guess.

**Disagreeing with a decision is normal and welcome.** Most of these are here
because we couldn't work out the answer, not because we're attached to the
current one.

**If you find a question we missed, add it.** A pull request that adds an entry
here is worth as much as one that changes code. Possibly more, because the next
team reads this file too.

The three sections are sorted by how much conversation an answer needs.

---

# Part 1 — Answerable with a pull request

Local, contained, and you don't need permission. Open a PR with your reasoning
and we'll talk about it at a check-in.

## The three edge types are copy-pasted

**Now:** `disputeEdge`, `extensionEdge`, and `referenceEdge` in
`packages/contracts/src/model.ts` each declare their own `id`,
`contributorId`, and `createdAt`. So do `affirmation` and `passover`.

**Why:** so the whole model reads top to bottom without following an
inheritance chain. Also because we wrote down the requirements rather than
looking for the pattern behind them.

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
we don't know yet.

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

## Does `era` deserve to exist?

**Now:** a claim can carry an `era`, one of six coarse buckets like
`depression_war_1930_1945`. It is optional, and about half the fixture claims
have none.

**Why:** oral history does not come with dates. People say "during the war" and
"when I was young", and forcing a year produces a made-up answer instead of an
honest one. A bucket seemed like the way to keep something filterable without
inventing precision.

**What is actually stored, which is less lossy than it looks:** what somebody
said about time is kept verbatim, as the `excerpt` on a date element.
`cl-fronton-floor` holds `1963-1964` alongside "this would be 1963, 1964", and
`cl-prelot` holds `before boarding house` alongside "Before the boarding house".
The words are not gone. An earlier version of this entry claimed they were, and
that was wrong.

**The problem:** `era` is a second, coarser copy of information that already
exists in a better form, and nothing reads it. Two places in the whole codebase
touch it: a debug print, and a count of distinct periods feeding the integrity
score. No interface filters on it. Meanwhile it has to be chosen by whoever
enters the account, which means it is the one field in the model that is
routinely somebody's guess rather than somebody's testimony.

**The tension:** the obvious move is to delete it and derive a period from date
elements when one is needed. That is cleaner and it costs something real. A
derived period is only as good as the element extraction, "during the war" does
not parse into a year without a human, and a filter that silently drops every
claim whose date could not be parsed will hide exactly the vaguest and oldest
material, which is usually the most valuable.

**The harder half, which nobody has solved:** what does an interface do with
"sometime in the fifties, probably"? Showing a range implies precision that is
not there. Showing the raw phrase makes sorting and filtering hard. Showing
both is clutter. This is the actual open question, and `era` is a workaround for
it rather than an answer to it.

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

# Part 3 — Nobody has answered these

Open problems. Not homework, and not blocking anything. Here because they're
where the project gets interesting, and because a good answer to any of them
would be publishable.

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

We don't have an answer. It's the most likely thing to matter in practice.

## Silence is not doubt

A claim nobody has engaged with tells you about attention, not truth. Nothing in
the current model distinguishes "this is doubtful" from "nobody who could speak
to this has seen it".

This matters more here than in most systems. The records most likely to sit
untouched are the ones not in English, from rural places, from small families,
from people who aren't online. If the interface makes silence look like doubt,
it quietly discounts exactly the material the archive exists for.

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
better. Some are two people restating themselves. Some are a group agreeing with
each other loudly and calling it corroboration.

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

## What makes a place significant?

Some places matter more than others, and the archive should be able to say so
without anyone declaring it. One idea: a place referenced often in accounts about
*other* places has earned significance from how the community talks, not from
anyone's opinion.

That's roughly PageRank over a reference graph, which is well-trodden. What might
not be is what the edges mean here — typed relationships, independence measured
by family line rather than by count, and references created by people marking
text rather than by authors linking.

---

# Adding to this file

Same shape as everything above:

- **Now** — what the code does today
- **Why** — if there was a reason, even a bad one
- **The problem** — what goes wrong
- **The tension** — why the obvious fix isn't obviously right

Leave out the answer. If you know the answer it isn't a design question, it's a
pull request.
