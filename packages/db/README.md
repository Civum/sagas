# packages/db

Home for the database schema and migrations. Nothing here yet.

## Two databases, not one

The experience layer runs its own small Postgres, seeded from the fixtures, so
the interface is built against a database rather than a file. That one is a read
model. It is shaped for map queries and article pages, it lives with `apps/web`,
and it is that team's own work.

This package is the other one: the authoritative store for records,
contributions, and the graph derived from them. Designing it is the intelligence
layer's deliverable, and the content layer's capture work lands in it.

These are different problems and forcing them into one schema this semester
would make both worse. What has to line up is the contract between them, not the
tables.

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

`pnpm rules` runs it. Sixteen rules, and they have teeth: a scorer that ranks by
how many people showed up fails three of them, one that buries anything anyone
argued with fails two, and a sign error on disputes fails two more.

The rules exist because this is a system that can go quietly wrong while every
ordinary unit test passes. A scorer that lets a large family outrank a
better-supported account from a small one is not buggy in any way a normal test
would catch. It just produces an archive that agrees with whoever was already
loudest.

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
pnpm db:up        # Postgres 16 with PostGIS, on port 5433
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
