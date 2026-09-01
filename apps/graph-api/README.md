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
- Working out whether two accounts in different languages are about the same
  thing

## Start with the rules, not the code

There is a placeholder scorer in `packages/fixtures/src/weight.ts`. It is
throwaway arithmetic that exists so claims have an order to render in. Do not
read it as a baseline to beat or a shape to preserve. You delete it.

What survives it is `@sagas/fixtures/behaviour` — a suite of rules any scoring
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
no author in the input: no name, no id, no standing, no join date. That absence
is the strongest guarantee in the file and it is structural rather than tested. A
scorer cannot weigh a claim by its author's reputation because it is never told
whose claim it is.

If you think a rule is wrong, and some of them may be, open a pull request
against it with your reasoning rather than editing it in your fork. Every team
is held to the same list, and a rule only some teams follow is not a rule.

**Sixteen passing rules is not a sound algorithm.** Every one of them is a
property of a scalar function over one claim's own inputs, and none of them know
what an edge is. Whether support travels along extensions, whether a cycle can
let a claim corroborate itself, whether two people who heard it from the same
source count as independent — all untested, all listed at the top of
`scoring-contract.ts`.

That gap is deliberate. Writing those tests means fixing what a propagation
algorithm looks like, and that is your design decision rather than ours. Bring
your model to a check-in when you have one and we will write the graph rules
together.

## Where to start

```bash
pnpm db:up && pnpm db:verify
```

Then read, in order:

1. `packages/db/README.md` for what a derived state actually contains, which
   decides what your algorithm can possibly be good at.
2. `packages/contracts/src/model.ts` for the shapes.
3. `packages/fixtures/src/reduce.ts` for how a snapshot is calculated today, in
   memory, with no database at all. It recalculates everything from scratch every
   time, which is fine for 64 contributions and useless at any real size.
4. `docs/DESIGN-QUESTIONS.md`, starting with "How do you tell a good source from
   a bad one?". That is your headline deliverable and everything else in that
   section is downstream of it.

## Seeing what your changes do

Change the scorer, run `pnpm fixtures:build`, then `git diff` on
`packages/fixtures/states/`. Every claim in the archive that moved shows up in
the diff: which one now leads the article, how integrity shifted, whether the
only untranslated account just got buried.

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

## Who owns what

This app is yours alone. `apps/capture-api` belongs to the content layer and
`apps/ui-api` to the experience layer. They are separate apps so that no two
teams edit the same files, and so each can be deployed on its own terms.

You share a database with the content layer: they capture records, you read the
graph built from them. `packages/db` is the authoritative store and designing it
is your deliverable.

## Making it a real app

It is a package with a placeholder in `src/index.ts` and no framework, because
picking one is your call. To turn it into a server:

1. Add whatever you are using to `dependencies`
2. Add a `dev` and a `start` script so `pnpm dev` picks it up
3. Add a `test` script so CI runs it
4. `pnpm install` from the repo root
