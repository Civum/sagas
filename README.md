# Sagas

A map-based archive of community accounts of places.

Someone contributes what they know about a place, in whatever language they'd
tell it in. It stays attached to that place and attributed to them. Other people
add to it, or say where they remember it differently, and those disagreements
stay in the record instead of being resolved away.

The example data models one building in Boise and the families who used it. It
is a worked case, picked because it is local and because the building is real.
Nothing in the model is specific to that community, and the first archive built
on this could be anyone's.

This repository is the scaffold three university teams build against. It is
sponsored by [Civum PBC](https://crowdforge.dev).

---

**If you read one thing, read
[what your interface has to handle](./packages/fixtures/README.md#what-your-interface-has-to-handle).**
It is the list of situations a real archive spends its life in, and it is the
closest thing this project has to a specification. Twenty minutes.

**If you read two,** find your layer in [SETUP.md](./SETUP.md#where-to-start-by-team)
and open the README it points at. That is your team's work and where to start on
it.

Everything else here is background, and you can come back for it.

---

## The problem

Written records capture ownership, dates, and architecture. What they don't
capture is who was actually in the room. That part lives in family memory and in
the recollections of elders, and it is disappearing faster than academia or
journalism can write it down.

The obvious way to build this is a wiki: let people contribute, let the
community converge on one version, show that version. We think that's wrong for
oral history. Communities do not agree about their own past, and the
disagreements are often the most interesting part of the record. A system
that resolves them has thrown away the evidence.

So the design question is: **how do you keep a record that preserves
disagreement and still produces something readable?**

A wiki answers that with a talk page, which is where the argument goes to be
ignored. What we want is prose that carries the disagreement in the body of the
text: "three independent family lines say 1914 and one says 1922, and here is
who each of them is."

Nobody has built this well, which is most of why it makes a decent capstone.

## How the pieces fit

Accounts are broken into individual **claims**: assertions that can be compared
across sources. Claims are nodes in a directed graph. Community
response comes in three forms:

- **Dispute.** "I disagree with this specific element, because." Disputes
  target an *element* of a claim (a date, a place, a person), not the whole
  claim, so a record can say "three disputes target the date; the location is
  undisputed." Disputes without reasoning are rejected.
- **Extension.** "I have more context." A new account that adds to another
  without contradicting it.
- **Affirmation.** Somebody agreeing. It adds a little weight and no new
  account.

Weight accrues from corroboration, but corroboration is counted by **independent
family line**, not by headcount. Three cousins are one source. This distinction
is doing more work than anything else in the model.

There is no "community accepted" status and no endorsement threshold. The
highest-weight claim at a node renders as the primary reading; competing claims
stay visible inline. **Dissent is preserved, not adjudicated.**

Accounts given in a language with no English rendering yet are pinned and
readable in the original, but sit outside the claim graph until someone renders
them. They are never deleted. Several renderings can coexist, each credited. There is no slot for the
correct one.

## Layers, and who owns what

| Layer | Owner | Scope |
|---|---|---|
| **Experience** | BYU-I | Living article renderer, design system, map, heritage trails, badges, contributor dashboard |
| **Intelligence** | UofI | Claim graph model, weight propagation, trust framework, synthesis engine, exploration |
| **Content capture** | BSU | Media pipeline, account submission, translation workflow, moderation, and the contributing interface |
| **Contracts & fixtures** | Sponsor | `packages/contracts`, `packages/fixtures` |

Each layer has its own app or apps, so no two teams edit the same files:
`apps/web` + `apps/ui-api` + `packages/read-model` for experience,
`apps/graph-api` + `packages/db` for intelligence, `apps/capture-api` +
`apps/capture-web` for content. [`README` files in each](./SETUP.md) say what goes where.

Each school forks this repo into its own GitHub organization. All student work
happens in the fork, for grading. Pull requests upstream are welcome and reviewed. That is the open-source
contribution loop and it is part of the point.
[`docs/GIT.md`](./docs/GIT.md) has the mechanics.

## What's in here

A pnpm workspace. Every folder under `apps/` and `packages/` is its own package
with its own `package.json`, and they refer to each other by name.

**Start with the row for your layer.** You can ignore most of the rest.

| Package | Owner | What it is | Open it when |
|---|---|---|---|
| `apps/web` | Experience | The site. Next, React, Tailwind. Components are stubs with instructions in them. | Always. This is the layer. |
| `apps/ui-api` | Experience | Read API over the archive for the browser. Empty. | You are building the back end for the site. |
| `packages/read-model` | Experience | Data access shared by the two above. Reads fixtures today, wants a database. | First infrastructure job on that layer. |
| `apps/capture-api` | Content | Submission, uploads, transcription and moderation. Empty. | Always. This is the layer. |
| `apps/graph-api` | Intelligence | Scoring, the graph, geographic queries. Empty. | Always. This is the layer. |
| `packages/db` | Intelligence | The authoritative store. Schema, migrations, spatial indexes. Empty. | Before you design any tables. |
| `packages/contracts` | Sponsor | The shapes, defined once, with the reasoning next to each one. | Constantly. Read it before you build anything. |
| `packages/fixtures` | Sponsor | Invented data, the states derived from it, and the rules your code has to obey. | Before you call anything done. |
| `tooling/*` | Shared | ESLint, Prettier, Tailwind, TypeScript and CI config. | Rarely, and think before you change it. |

Two of those are worth calling out because they are not what they sound like.

**`packages/fixtures` is not just test data.** It holds an authored log of 64
contributions, four snapshots calculated from it, a list of situations your
interface has to handle, and a suite of rules any scoring implementation has to
pass. See below.

**`packages/db` and `packages/read-model` are two different databases on
purpose.** One is the authoritative store, one is a read model shaped for map
and article queries, and they belong to different teams.
`packages/db/README.md` explains the split.

## The fixtures are the contract

This is the part worth understanding before you write code.

Neither layer waits on the other. Both build against the same fixture data, and
that data is maintained by the sponsor. When work on one layer reveals that the
model is wrong, the fixture changes. The other layer sees it as a versioned
contract change, discussed at a check-in, not as a broken build.

The contract is not the JSON. The contract is
`packages/fixtures/README.md`: an enumerated list of situations the
record can actually be in, and what your code has to do about each one. They are
deliberately awkward. A sparse site with three claims and no corroboration is
harder to render honestly than a rich one, and it is the case a real archive
spends most of its life in.

Read that file before you consider anything done.

It also lists the situations no fixture covers yet. Every gap is a design
decision made by omission, and closing one is a useful pull request.

## Things we know are unfinished

[`docs/DESIGN-QUESTIONS.md`](./docs/DESIGN-QUESTIONS.md) lists the decisions in
this codebase we think are wrong, or haven't settled, or got right for reasons
that may not survive contact with real work.

It's sorted by how much conversation an answer needs. The first section is
things you could fix in a pull request this afternoon; by the last one you're
into problems nobody anywhere has answered.

Read the part that touches your work before you refactor something, because a
few things in there look like sloppiness and aren't. If you find a question we
missed, adding it is as useful as changing the code.

## Getting started

```bash
pnpm install
cp .env.example .env      # then add your own Mapbox token
pnpm fixtures:build       # regenerate derived states, print a readable dump
pnpm acceptance          # check the fixtures against the contract
pnpm dev:web              # the experience layer
```

Node 22, pnpm 9, and Docker. **[SETUP.md](./SETUP.md)** has the rest:
registering a Mapbox token, running the local database, object storage and
ffmpeg for the content layer, and which file to open first depending on which
layer you are on.

**There are no sponsor-provided credentials.** You register your own free-tier
Mapbox token, and Postgres runs locally when it's needed. Nothing in this repo
talks to a service you need our permission to reach. If a task appears to
require a key you don't have, that's a bug in the scaffold. Tell us.

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
  arithmetic that exists so claims have an ordering to render. Do not treat it
  as a baseline to beat. It gets deleted.

If it feels like something is missing, check whether it's on this list before
assuming it's an oversight.

## Working together

Check-ins, office hours, how pull requests are reviewed, and the rules for when
the contract changes are in
[`docs/WORKING-TOGETHER.md`](./docs/WORKING-TOGETHER.md).

The two that matter most on day one: **open pull requests small and early**, and
**your fork is pinned, so nothing changes under you mid-sprint.**

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

## License and credit

Apache 2.0. The full text is in [`LICENSE`](./LICENSE).

Fork it and build on it. Your fork is yours, and work a student writes there
stays theirs — nobody needs permission to put it in front of an employer.

Anything merged upstream is credited by name, and the commit history stands as
the record either way. This is a project about accounts staying attached to the
people who gave them, and that applies to the people writing the code too.

## A note on how this was built

The scaffold was developed with AI assistance. Everything in it was reviewed
before it landed, and the acceptance suite and scoring rules are here so that
correctness is demonstrable rather than taken on trust.

---

Sponsored by Civum PBC · stanton@civum.io
