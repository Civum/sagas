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

## Getting started

```bash
pnpm install
cp .env.example .env      # then add your own Mapbox token
pnpm fixtures:build       # regenerate derived states, print a readable dump
pnpm conformance          # check the fixtures against the contract
pnpm dev:web              # the experience layer
```

Node 22, pnpm 9. That's the whole setup. **[SETUP.md](./SETUP.md)** has the
detail — registering a Mapbox token, running the local database, and a
where-to-start section per team.

**There are no sponsor-provided credentials.** You register your own free-tier
Mapbox token, and Postgres runs locally when it's needed. Nothing in this repo
talks to a service you need our permission to reach. If a task appears to
require a key you don't have, that's a bug in the scaffold — tell us. Staging
deploys are ours to run; development is entirely yours.

## What the scaffold deliberately does not include

- **A design system or design tokens.** BYU-I owns this. You get a brand brief,
  not a component library. Handing over a design system would remove the most
  interesting work in your scope.
- **A synthesis API.** There is no endpoint this semester. `loadState()` reads a
  derived graph state off disk, and that is enough to build every view in the
  experience scope. UofI builds the real engine later.
- **A database schema.** Designing it is UofI's deliverable. The shapes in
  `@sagas/contracts` are the constraint; how they're stored is the research.
- **A weight propagation algorithm.** `packages/fixtures/src/weight.ts` is
  arithmetic that exists so claims have an ordering to render. It is not a
  baseline, not a specification, and not an opinion. It will be deleted.

If it feels like something is missing, check whether it's on this list before
assuming it's an oversight.

## Working together

Weekly: a short async review before a 30-minute sync. Post a note before each
sync — what you built, what you're unsure about, what you assumed. **The
assumptions are the valuable part**; they become spec updates.

If you're blocked, route around it and flag it. Don't wait. The scope is
parallelizable by design, and a week spent waiting is a week nobody gets back.

Disagree with the design. These scopes describe where the work looks like it
should go from where we're standing in August; the interesting problems here are
genuinely open and students routinely see things sponsors don't. The goal is
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
