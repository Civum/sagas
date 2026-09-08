# packages/db

Home for the database schema and migrations. Nothing here yet.

## One database per layer, not one for everybody

Three databases, one per team, and none of them reads another's tables.

The experience layer runs a small Postgres seeded from the fixtures, so the
interface is built against a database rather than a file. That one is a read
model, shaped for map queries and article pages, and it lives with `apps/web`.

The content layer runs its own, for what people hand over. Records, media,
transcripts, translations, flags. Those tables live with `apps/capture-api`.

This package is the third: the store for claims, edges, contributors and the
graph derived from them. Designing it is the intelligence layer's deliverable.

These are three different problems and forcing them into one schema this
semester would make all three worse. It also means no team can be blocked by
another team's migration. What has to line up is the contract between them,
never the tables.

## Why it's empty

Designing how this data is stored is a deliverable, not something the scaffold
should decide for you. The types in `@sagas/contracts` describe the data. How it
gets persisted, indexed, and queried is the work.

You will also find the types in `@sagas/contracts` are wrong in at least one
interesting way. Finding out which one is part of this too.

## What goes here

- A schema for places, records, contributions, and the people who made them
- Spatial indexing, so "everything within 2km of here" is fast. Read
  [`docs/GIS.md`](../../docs/GIS.md) first
- Migrations, so the schema can change without anyone losing data
- A seed script that loads the fixtures into a running database

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

## The rules your scorer has to obey

`packages/fixtures/behaviour/scoring-contract.ts` is a test suite you run
against your own implementation. It says nothing about how to score a claim and
everything about what a correct scorer may not do, so it still holds after
`weight.ts` is deleted.

```ts
import { runScoringRules } from '@sagas/fixtures/behaviour';
import { myScorer } from '../src/my-scorer';

runScoringRules('my scorer', myScorer);
```

`pnpm rules` runs it. Ten rules, and each is prefixed. Seven say `required`,
meaning any model worth having satisfies them and a failure is a bug. Three say
`open to argument`, meaning we picked a calibration and wrote it down so it is
checkable rather than assumed, and a failure there might be you disagreeing with
us. If you think one of those three is wrong, that is a check-in conversation
and a good one.

The rules exist because this is a system that can go quietly wrong while every
ordinary unit test passes. A scorer that buries anything somebody argued with is
not buggy in any way a normal test would catch. It just produces an archive
where the uncontested version wins by default, which is the opposite of the
point.

Read the block at the top of that file about what the rules do not cover before
you treat a green run as a sound algorithm. Every rule is a property of one
claim's own numbers. None of them know what an edge is.

Look at what the scorer is given, and more importantly what it is not. There is
no author in the input: no name, no id, no standing, no join date. That absence
is the strongest guarantee in the file and it is structural rather than tested. A
scorer cannot weigh a claim by its author's reputation because it is never told
who the author is.

If a rule is wrong, and some of them may be, open a pull request against it with
your reasoning rather than editing it in your fork. Every team is held to the
same list, and a rule only some teams follow is not a rule.

## Getting a database running

```bash
cd apps/graph-api

pnpm db:up        # Postgres 16 with PostGIS, on port 5434
pnpm db:verify    # confirms it works and prints your connection string
pnpm db:psql      # a psql shell inside the container
```

`db:verify` tells you what to do if something's wrong instead of printing a
stack trace. See [SETUP.md](../../SETUP.md).

## How this package fits the repo

This is a pnpm workspace managed by Turborepo. Every folder under `packages/`
and `apps/` is its own package with its own `package.json`. They refer to each
other by name, so once this package exists other packages can `import` from
`@sagas/db` without any path juggling.

To make it a real package rather than a folder with a readme:

1. Add a `package.json` named `@sagas/db` with `"private": true`
2. Add `"@sagas/contracts": "workspace:*"` to its dependencies
3. Add a `tsconfig.json` extending `@sagas/tsconfig/base.json`
4. Add `lint`, `typecheck`, and `test` scripts so CI picks them up
5. Run `pnpm install` from the repo root

Copy `packages/contracts` as a starting point. It's the smallest example.

## Where to start

Read these in order:

1. `packages/contracts/src/model.ts` — the data, as the fixtures describe it
2. `packages/fixtures/fixtures/example-site/events.ts` — what real input looks like
3. `packages/fixtures/src/reduce.ts` — how a snapshot is calculated today, in
   memory, with no database at all
4. `packages/fixtures/src/weight.ts` — the scoring. It is deliberately naive
   arithmetic that exists so claims have an ordering to render. It is not a
   baseline to beat and not a specification. You are replacing it.

Then work out what that would look like with actual tables behind it. The
in-memory version recalculates everything from scratch every time, which is fine
for 64 contributions and useless at any real size.
