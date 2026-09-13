# apps/graph-api — the intelligence layer

Yours. It ships empty on purpose.

Given everything the archive holds about a place: how much support does each
claim have, what is contested, what is missing, and what should the narrative
look like right now.

## What goes here, roughly

- Reading the graph for a place
- Scoring claims, and recomputing when something changes
- Geographic queries: what is near here, what is inside this boundary
- Finding gaps worth filling and turning them into prompts
- Working out whether two claims in different languages are about the same
  thing

## Start with the rules, not the code

There is a placeholder scorer in `packages/fixtures/src/weight.ts`. It is
throwaway arithmetic that exists so claims have an order to render in. Do not
read it as a baseline to beat or a shape to preserve. You delete it.

What survives it is `@sagas/fixtures/behaviour`, a suite of rules any scoring
implementation has to obey, whatever it is built from.

```ts
import { runScoringRules } from '@sagas/fixtures/behaviour';
import { myScorer } from '../src/my-scorer';

runScoringRules('my scorer', myScorer);
```

`pnpm rules` runs it.

They have teeth. A scorer that ranks by how many people showed up fails three of
them. One that buries anything anyone argued with fails two. A sign error on
disputes fails two more. Every one of those is a way this archive could go
quietly wrong while ordinary unit tests stayed green.

Look at what the scorer is given and, more importantly, what it is not. There is
no author in the input: no name, no id, no standing, no join date. What it gets
instead are facts derived from who contributed, such as whether three
affirmations came from three independent family lines or from one. The system
knows who is speaking. The scorer does not, and cannot use it as a credential.
Weight comes from what somebody has done, not from who they are. That is
enforced by the missing field rather than by a test.

If you think a rule is wrong, and some of them may be, open a pull request
against it with your reasoning rather than editing it in your fork. Every team
is held to the same list, and a rule only some teams follow is not a rule.

**Ten passing rules is not a sound algorithm.** Every one of them is a
property of a scalar function over one claim's own inputs, and none of them know
what an edge is. Whether support travels along extensions, whether a cycle can
let a claim corroborate itself, whether two people who heard it from the same
source count as independent. All of it is untested, and all of it is listed at
the top of `scoring-contract.ts`.

That gap is deliberate. Writing those tests means fixing what a propagation
algorithm looks like, and that is your design decision rather than ours. Bring
your model to a check-in when you have one and we will write the graph rules
together.

## What you are given to work with

The derived states carry more than claims. Before you design anything, load one
and look at what is in it, because the shape of your input decides what your
algorithm can possibly be good at.

- `claims` — each with its author, the record it was read out of, translations,
  disputes per element, competing readings ordered by independent family line,
  affirmations, passover signals, and a placeholder weight.
- `records` — what people actually handed over, with media, processing state,
  and where each one says it was made and how that location was determined.
- `transcripts` — what somebody wrote down from a recording, attributed, with
  more than one allowed per record.
- `flags` — reports, with reasoning, open and resolved together.
- `standings` — what every contributor has actually done, as counts.

That last one is yours. It records behaviour and judges none of it, and turning
it into something that means anything is the deliverable. Read the comment on
`contributorStanding` in `packages/contracts/src/model.ts` and then the entry in
`docs/DESIGN-QUESTIONS.md` called "How do you tell a good source from a bad
one?" before you write a line of scoring code. The failure modes there are not
hypothetical.

If a signal you need is missing, that is a contract change rather than something
to work around. Raise it early, because everyone else is building on the same
shapes.

## Where to start

```bash
pnpm db:up && pnpm db:verify
```

Then read, in order:

1. `packages/contracts/src/model.ts` for the shapes.
2. `packages/fixtures/src/reduce.ts` for how a snapshot is calculated today, in
   memory, with no database at all. It recalculates everything from scratch every
   time, which is fine for 64 contributions and useless at any real size.
3. `docs/DESIGN-QUESTIONS.md`, starting with "How do you tell a good source from
   a bad one?". That is your headline deliverable and everything else in that
   section is downstream of it.

## Seeing what your changes do

Change the scorer, run `pnpm fixtures:build`, then `git diff` on
`packages/fixtures/states/`. Every claim in the archive that moved shows up in
the diff: which one now leads the article, how integrity shifted, whether the
only untranslated claim just got buried.

That is a regression test and a visualisation at once, and it is the only way to
reason about the source-quality question. You cannot see "this quietly discounts
small families" in a unit test.

To ask why one claim scores what it does:

```bash
pnpm inspect cl-boarding
```

That prints the inputs next to the outputs. A weight on its own is not evidence
of anything; a weight next to "zero independent family lines and three disputes
on the date" is.

## The database

Your schema and migrations live in this app, next to the code that uses them.
`apps/capture-api` is laid out the same way and is worth copying from: it has a
`migrations/` folder of numbered SQL files, a `scripts/migrate.ts` that runs
them in order inside a transaction, and a `src/db.ts` that holds the connection.

None of it is written yet, and that is on purpose. Designing how this data is
stored is a deliverable rather than something the scaffold should decide for
you. The types in `@sagas/contracts` describe the data. How it gets persisted,
indexed and queried is the work.

You will also find that the types in `@sagas/contracts` are wrong in at least
one interesting way. Finding out which one is part of this too.

What it needs to grow:

- A schema for places, records, contributions, and the people who made them
- Spatial indexing, so "everything within two kilometres of here" is fast. Read
  [`docs/GIS.md`](../../docs/GIS.md) first
- Migrations, so the schema can change without anyone losing data
- A seed script that loads the fixtures into a running database

```bash
pnpm db:up        # Postgres 16 with PostGIS, on port 5434
pnpm db:verify    # confirms it works and prints your connection string
pnpm db:psql      # a psql shell inside the container
```

`db:verify` tells you what to do if something is wrong instead of printing a
stack trace. See [SETUP.md](../../SETUP.md).

## Who owns what

This app is yours alone. `apps/capture-api` belongs to the content layer and
`apps/ui-api` to the experience layer. They are separate apps so that no two
teams edit the same files, and so each can be deployed on its own terms.

Three databases, one per layer, and none of them reads another's tables. Yours
is the store for claims, edges, contributors and the graph derived from them,
and designing it is your deliverable. The content layer runs its own for what
people hand over: records, media, transcripts, translations, flags. The
experience layer runs a small Postgres seeded from the fixtures, shaped for map
queries and article pages, so the interface is built against a database rather
than a file.

These are three different problems and forcing them into one schema this
semester would make all three worse. It also means no team can be blocked by
another team's migration. What has to line up is the contract between them,
never the tables.

## Your first week

`src/scorer.test.ts` holds an empty `Scorer` whose methods throw `not
implemented`, with the ten rules from `packages/fixtures/behaviour` running
against it. Every rule fails until you fill it in.

```bash
pnpm --filter @sagas/graph-api test
```

Fill in `weight` and `confidence` until nothing fails. Read the rules first,
because they are the closest thing to a specification you will get and each
failure names what it thinks you got wrong.

There is no database work in this. That is October.

## Making it a real app

There is a placeholder in `src/index.ts` and no server framework, because that
is not a September question: your first month has no HTTP in it. Decide it at a
check-in in October. The content layer is on Express 5 and copying that is a
perfectly reasonable answer. To turn this into a server:

1. Add whatever you are using to `dependencies`
2. Add a `dev` and a `start` script so `pnpm dev` picks it up
3. Add a `test` script so CI runs it
4. `pnpm install` from the repo root
