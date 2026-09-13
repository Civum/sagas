# Start here — intelligence layer

This repository is bigger than your part of it. Most of what is here is not
yours and you can ignore it. This page is the short version.

**Treat this as the syllabus for the semester.** Read it through once, then come
back to it. You are not expected to hold it in your head.

## What you're building

People contribute claims about places. Somebody says their great-grandmother
cooked in a boarding house from 1922, somebody else says the register shows
1914, and a third person adds that the building had a different name before the
war. Your layer is what decides how much any of that is worth, and it has to do
it without ever being told who is speaking.

One app, yours, currently empty:

- `apps/graph-api`, the server, and the schema and migrations behind it

## Five words used carefully

- **Site.** A place somebody has designated as meaningful. Records and claims
  attach to a site. A site does not attach to them.
- **Record.** What somebody hands over. A recording, a video, a photograph, a
  scanned document, or typed text. Nothing in the graph argues with a record.
  Disagreement lands on claims instead.
- **Claim.** Somebody's reading of a record. This is where disagreement lands.
  One record can produce several claims.
- **Rendering.** A transcript or a translation. One person's version of a
  record or a claim, attributed, with more than one allowed to exist.
- **Profile.** Who a contributor is to the software. This semester a profile is
  a guest id kept in browser storage, and there are no logins.

"Account" is not a term in this project. It used to be, and it was doing two
jobs at once: a contribution in some sentences and a login in others. If you
find it still standing for either, that is a leftover and worth a pull request.

## What to ignore

Genuinely ignore. It belongs to other teams and nothing you build depends on it.

- `apps/web`, `apps/ui-api`, `packages/read-model`, the reading experience
- `apps/capture-api`, `apps/capture-web`, how contributions arrive
- Anything about uploads, media, transcoding, storage, or file processing
- The object storage and ffmpeg sections of `SETUP.md`

You do not need MinIO, ffmpeg, or a Mapbox token. Those are other people's
problems and the setup instructions mention them because one document covers
three teams.

## What to install first

Fewer things than the other teams need.

| What | Version | Where |
|---|---|---|
| **Node** | 22.10 or later | [nodejs.org](https://nodejs.org), or [nvm](https://github.com/nvm-sh/nvm) if you juggle versions |
| **pnpm** | 9 | `npm install -g pnpm@9`, or `corepack enable` |
| **Docker Desktop** | current | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Git** | current | Usually installed already |
| **VS Code** | current | [code.visualstudio.com](https://code.visualstudio.com) |

Check each before moving on:

```bash
node -v        # must be 22.10 or higher
pnpm -v        # must start with 9
docker ps      # must print a table, not an error
```

**Two things that cost an hour if you skip them.** Node has to actually be 22.10
or later, and an older one fails in ways that never mention Node. And Docker has
to be running, not just installed. `docker ps` printing a table is the test.

**On Windows**, work inside WSL2 rather than PowerShell, with the repository in
the Linux filesystem. Crossing the boundary is slow and causes line ending
problems that look like real bugs.

## Getting the code, before anyone clicks Fork

**One fork for the whole team, not one each.**

1. **Create a GitHub organisation for the team**, not a personal account. If the
   repository lives in one person's GitHub account and that person drops the class, the
   team loses everything, and your instructor needs access for grading.
2. **One person forks `Civum/sagas` into it.** Once.
3. **Everyone clones that fork**, including whoever created it.

```bash
git clone https://github.com/YOUR-ORG/sagas.git
cd sagas
git remote add upstream https://github.com/Civum/sagas.git
```

Work on branches, open pull requests into your fork's main, review each other.
`docs/GIT.md` has the rest.

## Get it running

```bash
pnpm install
pnpm rules
pnpm inspect cl-boarding
```

That is the whole setup for now. `pnpm rules` runs ten rules against a
deliberately bad placeholder scorer. `pnpm inspect` prints one claim with its
inputs beside its outputs, so you can see what a score is actually made of.

## The database, when you need it

Not in September. Your first month is the scorer, which is arithmetic over
numbers the fixtures already hold, so there is nothing to store and nothing to
query. The database work starts in October when you design the schema.

It is ready whenever you want it:

```bash
cp .env.example .env      # then uncomment the sagas_intelligence line

cd apps/graph-api
pnpm db:up && pnpm db:verify
```

That starts your layer's Postgres container with PostGIS enabled and an empty
database called `sagas_intelligence`, on port 5434. `db:verify` prints the
connection string for your `.env`. The tables are absent on purpose, because
designing them is your work.

It belongs to your app, defined by a `docker-compose.yml` sitting next to it.
The other two layers have their own on their own ports, and nothing you start
here touches theirs.

**Worth running it once this week anyway**, even though you will not use it. If
Docker is going to give you trouble on your machine, finding that out now while
nothing depends on it is much better than finding out in October when it is
blocking you. Start it, see three ticks, stop it again, and forget about it
until you need it.

## Editor

Open the folder in VS Code and say yes when it offers the recommended
extensions. Formatting and lint fixing on save are configured already, so
nobody's editor reformats a file somebody else wrote. Use the repository's
TypeScript rather than the bundled one when it prompts.

## Read these four, in this order

1. `packages/fixtures/behaviour/scoring-contract.ts`. Ten rules any scorer
   has to obey, written as executable tests. This is the closest thing to a
   specification you will get and it is the best hour you can spend.
2. `packages/contracts/src/model.ts`, the claims and edges sections. Skip
   records and media, those are another team's.
3. `packages/fixtures/src/reduce.ts`, which calculates a snapshot in memory with
   no database at all. It recomputes everything from scratch every time, which
   is fine for 64 contributions and useless at any real size. That gap is your
   work.
4. `docs/DESIGN-QUESTIONS.md`, starting with "How do you tell a good source from
   a bad one?" That is the headline problem and Part 3 is where the project gets
   interesting.

## The plan, month by month


**September, understand the data and pass the rules.** Get the stack running,
read the ten rules, then write a scorer of your own that satisfies them. No
database work yet.

**October, the schema.** Design the tables for claims, edges, contributors and
lineage, write the migrations, and move the graph out of memory and into
Postgres. Spatial indexing lives here too.

**November onward, propagation.** How weight actually moves through the graph,
and whichever of the open questions you decide to take on.

If September takes six weeks, that is fine. All of the autumn is scoring, and
scoring is the bounded half of your layer. You will finish it. The other half is routing: working out which
claim to put in front of which person, and why. That is spring work. It has no
known answer, and it will need signals the contract does not record yet, such as
what somebody tends to contribute and where they keep coming back to. Asking for
those is expected rather than a sign something went wrong.

## Your first task

One week. There is already a worked example in the repository.

**Write a scorer that satisfies the rules.**

`apps/graph-api/src/scorer.test.ts` is already there. It holds an empty scorer
whose two methods throw `not implemented`, with the ten rules running against
it, so every rule fails until you write something.

```bash
pnpm --filter @sagas/graph-api test
```

Seven of them are marked **required**, which means I will not merge a scorer
that fails one. Most are closer to definitions of a working function than
positions on anything. The same input has to give the same answer, the output
has to be a real number, and more disagreement must not raise a score.

The other three are marked **open to argument**. Those are things I currently
think, written down so they are checkable instead of assumed. Whether a claim
people argue about should outrank one nobody has touched is a position rather
than a law. A failure there might be a bug in your scorer, and it might be you
disagreeing with me.

So the week is not "make ten tests green". It is: satisfy the seven, then come
to the check-in with which of the three you would change and why. The second
half is the more interesting half and it is the one I actually want.

If you want to see what a filled-in one looks like,
`packages/fixtures/behaviour/placeholder.test.ts` is nineteen lines and does the
same thing for the throwaway arithmetic the fixtures ship with. That scorer is
bad on purpose and it still passes, which tells you something about what the
rules do and do not pin down.

Then make the failures go away. The rules tell you what is wrong and
they are specific: one of them will tell you that you are counting heads instead
of family lines, another that you are treating disagreement as damage.

Do not aim for a good scorer. Aim for one that satisfies the ten, then read
your own implementation and work out why it is not good enough. That gap is the
project.

I wrote those rules before any of this had been tried against a real claim, and
I have not solved the problem they are circling. Treat them as a starting point
rather than a description of how scoring ought to work.

**And read the "what these rules do not cover" block at the top of that file.**
Every rule is a property of one claim's own numbers. None of them know what an
edge is. Whether support travels along extensions, what happens when a chain of
them feeds back on itself, and whether two people who heard the same story from
the same person are really independent, are all untested and all yours. They are
missing on purpose rather than by neglect, because testing them would mean
deciding them, and deciding them is the deliverable.

When you do build a traversal, test that it does not silently skip a path. That
is the kind of test only you can write, because it asserts against a model that
does not exist yet.

## Why the author is missing from `ScoringInput`

`ScoringInput` is never given an author. No name, no identifier, no standing, no
institution. What it gets instead are facts derived from who contributed:
whether three affirmations came from three independent family lines or from one
family. So the system knows who is speaking. The scorer does not, and cannot use
it as a credential.

Weight comes from what somebody has done, not from who they are. That is
enforced by the missing field rather than by a test.

An affirmation, in that sentence, is what a reader clicks to agree with a claim.
Worth knowing before you build on it: it is currently stored as its own object,
separate from a passover, even though a passover with the kind `sounds_right`
means the same thing. That duplicate is going to be removed and
`affirmationCount` will become a count of passovers. Nothing you write against
the ten rules breaks when it does, because the number itself does not move.

Two different things are going on here.

**Permanent.** A claim must never be worth more because of who is taken to have
made it. Not their name, not their reputation, not the institution they
mention. The missing field is how this project makes that promise checkable
instead of merely stated. Anybody can open the file and see it.

**Not permanent.** Weighing what a person has actually done is a different
thing, and that is where this is going. `contributorStanding` exists to hold
exactly that. Records submitted, claims written, claims other people backed,
disputes raised, how many of those proposed an alternative rather than only
objecting. None of it reaches `ScoringInput` today, and the reason is that
nobody has worked out how to use it without the first thing sneaking in through
it.

Working that out is the deliverable. It is not something the project has ruled
out, and if you read the absent field as a closed door you will skip the most
interesting problem you have been handed.

When you get there, it is a conversation at a check-in rather than a widened
interface in a pull request. Read "How do you tell a good source from a bad
one?" first.

## Every Monday

Check `CHANGELOG.md`. Anything that changed is listed there with a line saying
which team it affects. If it does not say intelligence layer, skip it. Your fork
never updates itself, so nothing changes underneath you.

## A note on frameworks

`apps/graph-api` has no server framework yet and that is not a September
question, because your first month has no HTTP in it. Decide it at a check-in in
October. Express 5 is a perfectly good answer if you want the path of least
resistance, and it is what the rest of this repository uses.

## How we work

- **Check-in, 30 minutes.** Weekly for the first month, then every other week.
- **Office hours, 30 minutes before it.** Runs only if there is something to
  discuss, so most weeks it will not.
- **A short note before each check-in**, template in
  `docs/CHECK-IN-TEMPLATE.md`. The most useful part is what you *assumed*.
- **Small pull requests, opened as drafts early.** I would rather see the shape
  at twenty percent and say not that direction than read eight hundred lines and
  ask you to start over.
- **Between meetings**, expect a reply within a working day rather than the same
  evening.

## What you get from me

- Pull request review, personally, every week
- Anything merged upstream is credited to you by name. Your fork is yours
  regardless, and what you write in it stays yours.

## One thing worth saying plainly

This is an open source project, which means it is never finished and you are not
expected to finish it.

The questions in Part 3 of `docs/DESIGN-QUESTIONS.md` are where the work is.
Open there means I do not have an answer. I have not looked into whether anyone
else does, and your faculty advisor would know more about that than I do.

Build a small thing that works rather than a large thing that nearly does.
