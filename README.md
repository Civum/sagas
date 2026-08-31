# Sagas

A map-based archive of community accounts of places.

Someone contributes what they know about a specific location — in whatever
language they'd tell it in — and it stays attached to that place and attributed
to them. Other people add to it, or say where they remember it differently, and
those disagreements stay in the record rather than getting resolved away.

The reference implementation targets the Basque diaspora in Idaho.

This repository is the scaffold two university teams build against. It is
sponsored by [Civum PBC](https://crowdforge.dev).

---

## The problem, stated honestly

Written records capture ownership, dates, and architecture. What they don't
capture is who was actually in the room. That part lives in family memory and in
the recollections of elders, and it is disappearing faster than academia or
journalism can write it down.

The obvious way to build this is a wiki: let people contribute, let the
community converge on one version, show that version. We think that's wrong for
oral history. Communities do not agree about their own past, and the
disagreements are frequently the most interesting part of the record. A system
that resolves them has thrown away the evidence.

So the design question is: **how do you keep a record that preserves
disagreement and still produces something readable?** Not a talk page. Not a
consensus article with a controversy section. A narrative that says, in the
body, "three independent family lines say 1914 and one says 1922, and here is
who each of them is."

Nobody has built this well. That's why it's a capstone.

## How the pieces fit

Accounts are decomposed into individual **claims** — assertions that can be
compared across sources. Claims are nodes in a directed graph. Community
response comes in three forms:

- **Dispute** — "I disagree with this specific element, because." Disputes
  target an *element* of a claim (a date, a place, a person), not the whole
  claim, so a record can say "three disputes target the date; the location is
  undisputed." Disputes without reasoning are rejected.
- **Extension** — "I have more context." A new node that enriches without
  contradicting. The "yes, and" of the system.
- **Affirmation** — a scalar signal that adds weight without adding a node.

Weight accrues from corroboration, but corroboration is counted by **independent
family line**, not by headcount. Three cousins are one source. This distinction
is doing more work than anything else in the model.

There is no "community accepted" status and no endorsement threshold. The
highest-weight claim at a node renders as the primary reading; competing claims
stay visible inline. **Dissent is preserved, not adjudicated.**

Accounts given in a language with no English rendering yet are pinned and
readable in the original, but sit outside the claim graph until someone renders
them. They are never deleted. Multiple renderings coexist, each attributed —
there is no single authoritative translation slot.

## Layers, and who owns what

| Layer | Owner | Scope |
|---|---|---|
| **Experience** | BYU-I | Living article renderer, design system, map, heritage trails, badges, contributor dashboard |
| **Intelligence** | UofI | Claim graph model, weight propagation, trust framework, synthesis engine, exploration |
| **Content capture** | BSU | Media pipeline, account submission, translation workflow, moderation |
| **Contracts & fixtures** | Sponsor | `packages/contracts`, `packages/fixtures` |

Each school forks this repo into its own GitHub organization. All student work
happens in the fork, for grading. PRs upstream are welcome and reviewed —
that's the open-source contribution loop, and it's part of the point.
[`docs/GIT.md`](./docs/GIT.md) has the mechanics.

**No team is ever blocked by another team's timeline.** That is a hard
guarantee, not an aspiration. It is why the fixtures exist.

## The fixtures are the contract

This is the part worth understanding before you write code.

Neither layer waits on the other. Both build against the same fixture data, and
that data is maintained by the sponsor. When work on one layer reveals that the
model is wrong, the fixture changes — and the other layer feels it, as a
versioned contract change discussed at a sync rather than as a broken build.

The contract is not the JSON. The contract is
`packages/fixtures/conformance/cases.ts`: an enumerated list of situations the
record can actually be in, and what your code has to do about each one. They are
deliberately awkward. A sparse site with three claims and no corroboration is
harder to render honestly than a rich one, and it is the case a real archive
spends most of its life in.

Read that file before you consider anything done.

It also lists **known gaps** — situations no fixture covers yet. Every gap is a
design decision made by omission, and closing one is a genuinely useful PR.

## Things we know are unfinished

[`docs/DESIGN-QUESTIONS.md`](./docs/DESIGN-QUESTIONS.md) is a list of decisions
in this codebase that are wrong, or unsettled, or right for reasons that might
not survive contact with real work.

It's sorted by how much conversation an answer needs. Some you can settle with a
pull request. Some change the model and should come to a check-in first. Some
nobody has answered anywhere.

Read the part that touches your work before you refactor something. A few things
in here look like sloppiness and aren't, and a few look deliberate and aren't.
And if you find one we missed, adding it to that file is as useful as changing
the code.

## Getting started

```bash
pnpm install
cp .env.example .env      # then add your own Mapbox token
pnpm fixtures:build       # regenerate derived states, print a readable dump
pnpm conformance          # check the fixtures against the contract
pnpm dev:web              # the experience layer
```

Node 22, pnpm 9, and Docker. **[SETUP.md](./SETUP.md)** has the rest:
registering a Mapbox token, running the local database, object storage and
ffmpeg for the content layer, and which file to open first depending on which
layer you are on.

**There are no sponsor-provided credentials.** You register your own free-tier
Mapbox token, and Postgres runs locally when it's needed. Nothing in this repo
talks to a service you need our permission to reach. If a task appears to
require a key you don't have, that's a bug in the scaffold — tell us. Staging
deploys are ours to run; development is entirely yours.

## What the scaffold deliberately does not include

- **A design system or design tokens.** BYU-I owns this. You get a brand brief,
  not a component library. Handing over a design system would remove the most
  interesting work in your scope.
- **A synthesis engine.** Nothing works out what a narrative should say. The
  experience layer reads derived graph states, which is enough to build every
  view in its scope, and the intelligence layer builds the real thing later.
- **Any database schema.** Two teams design one. The experience layer needs a
  read model shaped for map and article queries; the intelligence layer needs the
  authoritative store. The shapes in `@sagas/contracts` are the constraint, and
  how they get persisted is the work.
- **An upload pipeline.** Object storage is running and empty. Presigned
  uploads, transcoding, and metadata extraction are the content layer's build.
- **A weight propagation algorithm.** `packages/fixtures/src/weight.ts` is
  arithmetic that exists so claims have an ordering to render. It is not a
  baseline, not a specification, and not an opinion. It will be deleted.

If it feels like something is missing, check whether it's on this list before
assuming it's an oversight.

## Working together

### The rhythm

**Check-in — 30 minutes.** Weekly for the first month while scope is still being
worked out, then every other week once you know what you're building. Your
programme's exact day is set with your team.

**Office hours — 30 minutes, every week, immediately before the check-in slot.**
Not a meeting. A door that's open. It runs if there's an agenda and is cancelled
if there isn't, so most weeks it won't happen — and that's fine. It exists so
that "we're stuck" has somewhere to go that isn't an email at eleven at night.

**A short note before each check-in:** what you built, what you're unsure about,
what you assumed. This doubles as the office-hours agenda — if the note has open
questions in it, we use the slot; if it doesn't, we skip it.

**The assumptions are the most valuable part of that note.** They regularly
become contract changes. Writing down "we assumed X" is a normal engineering
artefact, not an admission — and it's how we find out the spec was ambiguous
before you've built a fortnight on top of it.

**One in-person session** where geography allows, deliberately timed for around
week three or four — while design is still being locked and the bandwidth
difference actually matters.

### Pull requests

**PRs open by the stated cutoff get reviewed before that check-in.** Later ones
roll to the next cycle. That's not a penalty — it's so you can predict when
feedback arrives instead of pushing something rushed at 5:55pm.

**One PR per feature. Open it as a draft early.** Genuinely — we would rather see
the shape at 20% and say "not that direction" than review 800 lines and ask you
to redo it. If a PR takes more than about fifteen minutes to read, it is probably
two PRs.

This is the single biggest factor in how useful review is to you. Small, early,
frequent beats large, late, and finished.

### When the contract changes

`@sagas/contracts` and `@sagas/fixtures` are sponsor-owned, and they *will*
change during the semester. That is the point — a change here is how a discovery
on one team, or a conversation with someone in the community, reaches everyone
else. Four rules make that safe:

1. **Changes land on Mondays and only on Mondays.** The contract cannot move
   mid-week. This is a constraint on us, not a release schedule — expect three to
   five changes across a semester, not one a week.
2. **Nothing lands cold.** A significant change is raised at a check-in *before*
   it is built, then published the following Monday. You will hear "we might
   change X" before you see X change.
3. **Your fork is pinned to a tag.** A change is *available* to you, never
   imposed. Pulling forward is a decision made together at a check-in, not
   something that happens to you mid-sprint.

   **Awareness is weekly; adoption is deliberate.** Don't pull every Monday —
   that puts you back on a moving target. Instead, `.github/workflows/upstream-contract-watch.yml`
   runs each Monday morning, compares your pinned contract version against
   upstream, and opens an issue with the changelog if they differ. Nothing in
   your fork changes; you just find out. **Enable Actions on your fork once
   after forking** — GitHub disables them by default, so open the Actions tab
   and click through the confirmation.
4. **Every change carries a version bump, a CHANGELOG entry, and its reason.**
   The reason matters more than the diff — "a translator pointed out that dialect
   can't be recovered from text after the fact, so it has to be captured at
   contribution time" tells you something the diff never will.

   There is **one** changelog, not one per school, and entries name *layers*
   rather than universities. Seeing that the intelligence team hit a problem the
   experience team is now working around is the entire reason the contract sits
   in the middle of three teams.

**Freeze windows.** The contract does not move after your team's design lock
(around week three) except to fix something genuinely broken, and it does not
move at all in the last three weeks of a semester. Anything learned during a
freeze goes into the notes and lands the following term. If a change arrives
outside these rules, that is a mistake on our side — say so.

### Two standing expectations

**If you're blocked, route around it and flag it. Don't wait.** The scope is
parallelizable by design, and a week spent waiting is a week nobody gets back.
[`docs/GIT.md`](./docs/GIT.md) explains how work actually moves between the three
forks, and why nothing you need from another team should ever stop you.

**Disagree with the design.** These scopes describe where the work looked like it
should go from where we were standing in August. The interesting problems here
are genuinely open, and students routinely see things sponsors don't. The goal is
good engineering, not obedience to an initial guess.

## A note on the fixture content

Every contributor, family, and event in the fixture data is **invented**. The
buildings, streets, and coordinates are real; nothing else is. It exists to
exercise the data model.

Do not display it publicly, cite it, or show it to community members as though
it were testimony. The Euskara sample text has not been reviewed by a speaker
and is likely imperfect.

This matters beyond correctness. The point of the project is that a person's
account of their own family stays theirs and stays attributed. Synthetic data
that reads as real testimony cuts against that, so we label it at every level:
in the data, in the schema, and here.

---

Sponsored by Civum PBC · stanton@civum.io
