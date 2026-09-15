# Start here — experience layer

This repository is bigger than your part of it. Most of what is here is not
yours and you can ignore it. This page is the short version.

**Treat this as the syllabus for the semester.** Read it through once, then come
back to it. You are not expected to hold it in your head.

## What you're building

Somebody drags a map around and finds a place. They open it and read what people
know about that place: who was there, what happened, which parts two families
remember differently. Your layer is everything that person sees, and the hard
part is not the map. It is rendering a record that is thin, contested, half
translated and still arriving, without any of that reading as failure.

Three things, all yours:

- `apps/web`, the interface
- `apps/ui-api`, the read API the browser talks to
- `packages/read-model`, where every read goes through

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

- `apps/capture-api`, `apps/capture-web`, how contributions arrive
- `apps/graph-api`, the scoring and claim-graph work
- `packages/fixtures/behaviour/`, scoring rules for a different team
- The object storage and ffmpeg sections of `SETUP.md`

You do not need MinIO or ffmpeg. Those are other people's problems and the setup
instructions mention them because one document covers three teams.

## What to install first

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

**Not yet: Mapbox.** You need a free token when you build the real map, and that
is October. `SETUP.md` covers registering. Do not do it today. Without a token
the map area renders a list of the same places, and that path is not a fallback:
it is how the map's information reaches somebody using a screen reader, so it
ships either way and it has to be good.

## Getting the code, before anyone clicks Fork

**One fork for the whole team, not one each.**

1. **Create a GitHub organisation for the team**, not a personal account. If the
   repository lives in one person's GitHub account and that person drops the
   class, the team loses everything, and your instructor needs access for
   grading.
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
pnpm dev:web
```

Two routes exist:

- `/` — a map and one article, wired end to end and looking like nothing.
- `/dev` — the same components rendered against all four fixture states, with
  the acceptance criteria for each state listed underneath.

`/dev` is where you will spend the semester. A component that looks right
against `t3` and falls apart against `t0` is the normal failure, and `t0` is the
state most real places sit in for a long time.

## The database, and it is not a later problem

Every read goes through `packages/read-model`. Today those three functions read
fixture JSON off disk. That is a starting point, not a design.

**Putting Postgres behind them is the first infrastructure job on this layer**,
and it belongs to whoever holds the back end and data roles on your team. Your
own schema, shaped for the two things this layer does, which are drawing a map
and rendering an article. That is not the same shape as the authoritative store
the intelligence layer keeps and it should not try to be.

```bash
cp .env.example .env      # then uncomment the sagas_read line

cd apps/ui-api
pnpm db:up && pnpm db:verify
```

That starts your layer's Postgres with PostGIS enabled, on port 5435, in a
container defined by that app's own `docker-compose.yml`. The other two layers
have their own on 5433 and 5434 and nothing you start here touches theirs.

Do it early. If the whole interface is built against a file and the database
arrives in November, November is when you find out which components assumed data
was free to fetch.

Three things that will bite, all in `packages/read-model/README.md`: coordinate
order is `[longitude, latitude]` and getting it backwards silently puts Boise in
the Indian Ocean, `listSites()` has to start taking a bounding box once the map
has more than one place on it, and the obvious `getSiteState()` runs one query
per claim. Read `docs/GIS.md` before you write the map query.

## Editor

Open the folder in VS Code and say yes when it offers the recommended
extensions. Formatting and lint fixing on save are configured already, so
nobody's editor reformats a file somebody else wrote. Use the repository's
TypeScript rather than the bundled one when it prompts.

## Read these four, in this order

1. **`packages/fixtures/README.md`, the section called "What your interface has
   to handle."** Ten situations a real archive spends its life in and what your
   interface must not do about each. This is the closest thing to a
   specification you will get and it is the best hour you can spend. They say
   what must not happen. How you satisfy them is your design, and most of what
   you build is things that list says nothing about. The nineteen one-line
   versions in `acceptance/cases.ts` are what `/dev` shows beside your
   components. The reasoning is in the README.
2. **`apps/web/README.md`.** Your app: how it is organised, which three
   components are finished, and which are one line and a TODO.
3. **`packages/contracts/src/model.ts`.** The shapes you render. The media and
   processing fields on a record belong to another team and you can skim those.
4. **`docs/DESIGN-QUESTIONS.md`.** Things we know are wrong or unsettled. Four
   of them are yours before you design anything: "What does an interface do with
   'sometime in the fifties, probably'?", "Silence is not doubt", "What should a
   disagreement look like to the people in it?", and "Maria the subject and
   Maria the profile."

## What is in this layer

The scope document your department has lists more than this, and some of it is
cut. Here is the current list with the reasoning, so you are not working from
two documents that disagree.

**The core. This is what the semester is about.**

- **The living article renderer.** What people have said about a place, read as
  something a person can actually read, with the disagreements intact. This is
  the flagship and the hardest part.
- **Inline confidence indicators.** How well supported a thing is, shown without
  turning the page into a dashboard. Somebody should be able to glance at a
  paragraph and know which parts are corroborated and which are single source.
- **The map, and the list that stands in for it.** Finding a place at all.
- **The read model and the schema under it.** Covered above, and it is the job
  that gets forgotten.

**Next, and all three are real work.**

- **Dispute visualization.** Two readings, both shown, with their support. No
  winner, nothing hidden behind an interaction, and never a vote tally. The
  count is distinct families rather than people, and labelling it wrong turns
  evidence into a poll.
- **Source attribution.** Every claim reaches the person it came from and the
  record it was read out of. Attribution is never optional and never anonymous.
- **Version history.** What changed between two states and which contributions
  caused it. The fixture log is append-only and every state carries
  `eventIdsSincePrevious`, so this is a real answer rather than one you
  reconstruct.

**If you get to these, good. I would be pleased rather than surprised.**

- **The passover UI.** `sounds_right`, `dont_know` and `dont_care` on a claim,
  rendered so somebody reading casually can leave a signal without breaking
  their reading. This is one of the more interesting design problems in the
  layer, because the interaction has to be light enough that people actually
  use it and honest enough that it does not become a rating.

  What the three of them do is worth being exact about, because the easy
  mistake is to render them as inert and they are not. All three compose into
  how much a claim gets surfaced. `sounds_right` adds a little. `dont_care`
  adds nothing to the claim and still records that somebody saw it, which is
  information about reach. `dont_know` adds nothing and says the claim has not
  reached anybody able to judge it. None of them create edges and none of them
  are votes. What they add up to is how far a claim travels, not how true it
  is, and that number is not a quality score and is never shown as one. A pile
  of `dont_know` must never read to a contributor as their claim being
  rejected.
- **Heritage trails.** Ordered sequences of sites that tell one story, with the
  narrative between stops written by somebody and attributed like anything else.
  The trail builder, where somebody composes one, is a further step again.
- **Exploration prompts.** "This place has twelve accounts about the boarding
  house era and one about before 1940." Whether the unit of work is a task at
  all is an open design question rather than something I can hand you. See
  `docs/DESIGN-QUESTIONS.md`, "Is the unit of work a task?"
- **Citation and export.** Formatted citations, and stable permalinks so
  somebody can cite one claim rather than a page.

**Last, and not in the shape the scope document gave them.**

- **Contributor milestones**, which the scope document called badges.
  Buildable, and not the work. `contributorStanding` already holds the countable
  ones: first contribution, first translation, first transcript, the first
  dispute that proposed an alternative rather than only objecting. None of that
  needs a score and none of it needs a login, because a guest profile
  accumulates history server-side against its id. So the reason these are last
  is priority, not impossibility. The hard problem in this layer is rendering a
  contested record, and a small team will not get past it. If you finish the
  renderer, disputes, version history and source attribution, come and talk to
  me about milestones. What you must not build is one tied to a score, because
  the score does not exist and is not going to.
- **The contributor dashboard.** Most of what the scope document put in it was
  a trust score with a category breakdown, plus notifications and task routing
  from services that do not exist. A view of your own contributions is a
  reasonable thing to want and you can build one. Do not build it around a
  number the model refuses to compute.

Nothing on this list is fixed. If you get four weeks in and think the order is
wrong, that is a check-in conversation.

## The plan, month by month

**September, the four states.** Get it running, read the acceptance list, and
work through the stub components on `/dev` until all four states render. No
design system yet, and the next section says why.

**October, the database and the map.** Postgres behind `read-model`, a real
schema, spatial indexing so "everything within 2km of here" is fast enough to
drive a map, and Mapbox on the front of it.

**November onward, the rest of the interface.** Dispute visualization, source
attribution and version history first, then as far down the list above as you
get, plus whichever of the open questions you decide to take on.

## Why the design system is not sprint one

The scope document I sent your department put the design system in the first
three sprints. Having built the worked examples I think that is the wrong order,
and here is the reasoning rather than just the instruction.

A design system built before you have rendered anything is a set of guesses
about what you will need. A design system extracted from five working views is a
record of what you actually needed. The second one is smaller, and every token
in it has a reason you can point at.

So: build three or four views against all four fixture states first, tolerate
the duplication, and then pull the system out of what you wrote. The typography
scale and the colour tokens will be better for having been earned. It is also
the order that gets you something to look at in week three instead of week six.

If you disagree, that is a check-in conversation and a good one. You are the
people who will live with the answer.

## Why there is no design system in the repository

There are no design tokens, no component library, and no brand guidelines in
here, and that is deliberate rather than an omission. Handing those over would
take away the most interesting work in your scope. The grey text and system
fonts in the finished components are a placeholder. Do not copy the styling.

Two things in those examples are worth copying.

**The split.** The judgment lives in a pure function, `bandFor` or
`supportSummary`, separate from the markup, so it can be tested without
rendering anything. A test that a div has a class fails every time somebody
improves the design. A test that a sparse record is never described as failing
is worth keeping.

**The data flow.** Pages read, components take props, nothing fetches. That is
what lets the same components render against four states on `/dev`.

## Where the renderer's data comes from

The living article renderer is yours and it is the centre of this layer. That
has not changed. What changed is where it reads from.

The scope document describes a narrative state endpoint from the intelligence
layer that the renderer consumes. There is no such endpoint this semester and
you should not build against one. What you render from instead is the four
derived graph states, reached through `packages/read-model`. They carry
everything the renderer needs: claims with their support, disputes landing on
single elements, renderings that coexist, and what changed between one state and
the next.

If you find yourself wanting to fetch narrative state from a service that does
not exist, stop and bring it to a check-in. It means the contract is missing
something, which is worth knowing early.

Nothing you build is blocked on either of the other two schools, in either
direction, and that is the point of the fixture data.

## There is no trust score

`contributorStanding` holds counts. Records submitted, claims written, claims
other people backed, disputes raised, translations and transcripts contributed.
It has no score in it and it is not going to get one.

The reason is in the acceptance list and it is worth reading in full, but the
short version is that a score gets displayed, and then somebody's account of
their own family has a rating beside it. Adding the counts up invents a number
the model deliberately does not have.

The counts themselves are yours to use, and a view built on them is fine. What
you cannot do is rank contributors by them, sort them into tiers, or put one
number in front of a person. The scope document referred to a trust framework
specification in the scaffold that defines weighting and badge criteria. There
is no such specification, and the reason there isn't is this one.

Two more things the scope document named that do not exist: there is no
WebSocket notification service, and there is no media layer you fetch
attachments from. Both of those were cross-team dependencies I should not have
written down.

## Your first task

Make `t0` look like a real place with a thin record.

That is the hardest judgment in your layer and it is also the common case. Most
places, most of the time, have three claims from one family and nothing
corroborated. That scores about 23 out of 100. An interface that renders it in
red, or as an empty state, or as an error, tells the person who just contributed
that their family's claim failed. It did not. It is early.

Concretely, for the first check-in:

Read `src/app/page.tsx`, `IntegrityBadge.tsx` and `ConfidenceIndicator.tsx`,
which are the three finished components. `IntegrityBadge` is how well documented
a *place* is, and it is the one that solves `t0` already. It has nothing to do
with the contributor milestones above, which is why this repository does not
call those badges. Then take the next two stubs under `src/features/article/`
and make them render against all four states on `/dev`.

Then bring one screen, sketched or built, and tell me what a person sees when
they are the only contributor at a place. Not the design system. One screen and
the reasoning.

The most important idea in the model is already in `ConfidenceIndicator`: an
affirmation is not corroboration. A claim can have five people agreeing and no
independent support, because all five are from the author's family. The model
counts family lines, not heads. If your interface ever presents an affirmation
count as support, it is lying, and it is the easiest lie in this project to tell
by accident.

One thing to know before you render that number, because it is not written down
anywhere else yet. Independence is counted from `lineageId` on a contributor,
which is a hand-authored string. Nothing derives it, and with no logins there is
nothing to derive it from. In the fixtures it is filled in by hand, which is how
`t1` demonstrates a cousin affirming a cousin. Outside the fixtures it is empty,
and `reduce.ts` falls back to treating every contributor as their own family
line, so `independentLineageCount` quietly becomes a count of distinct
affirmers. That is the exact thing the field exists to prevent.

So the mechanic is right and its input has no source yet. Build against the
mechanic, because the mechanic is what the archive actually needs. Just know
that "Backed by 3 other families" is a sentence this system cannot currently
justify about real people, and that closing that gap is one of the open problems
rather than a detail. `docs/DESIGN-QUESTIONS.md` has "Can vouching carry what
lineage cannot?" and it is worth reading even though it is not your layer's
problem to solve.

## Roles, and the one the scope document left out

Three named roles were in it: design system, living article, trails and
progression. There is a fourth and it is not optional.

Somebody owns the data. `packages/read-model` and `apps/ui-api` are both yours,
the schema does not exist yet, and the spatial query is the part that decides
whether the map feels fast or slow. `apps/ui-api` is a separate app precisely so
that the people who own the back end own a thing, rather than owning some files
inside somebody else's app.

How you split four jobs across your team is yours to decide, and with a small
team one person may hold two. Just decide it out loud rather than discovering in
October that nobody owns the database.

## One thing not to do

Do not make `apps/web` fetch from `apps/ui-api` in server components.

A server making an HTTP request to its own API to render a page adds a network
hop, a new failure mode, and latency, and buys nothing. Server components import
`@sagas/read-model` directly. The API exists for the browser, and for whatever
else consumes the archive later.

## Deploying it

Yours to own, including the choice of where. We are not picking for you, because
picking would remove the part of this that looks like a real job. Whatever you
choose needs three things: a URL that works from early on, a preview per pull
request, and no sponsor credentials. Deploy in week two, before there is
anything interesting to see. A pipeline that exists before it matters is a
pipeline that works when it does.

`apps/web/README.md` has the detail, including two things worth knowing about
Vercel's free plan before you commit to it.

## Every Monday

Check `CHANGELOG.md`. Anything that changed is listed there with a line saying
which team it affects. If it does not say experience layer, skip it. Your fork
never updates itself, so nothing changes underneath you.

## How we work

- **Check-in, 30 minutes.** Weekly for the first month, then every other week.
- **Office hours, 30 minutes before it.** Runs only if there is something to
  discuss, so most weeks it will not.
- **A short note before each check-in**, template in
  `docs/CHECK-IN-TEMPLATE.md`. The most useful part is what you *assumed*.
- **Small pull requests, opened as drafts early.** I would rather see the shape
  at twenty percent and say not that direction than read eight hundred lines and
  ask you to start over. A deployed preview link makes this much faster.
- **Between meetings**, expect a reply within a working day rather than the same
  evening.

## What you get from me

- Pull request review, personally, every week
- Anything merged upstream is credited to you by name. Your fork is yours
  regardless, and what you write in it stays yours.

## One thing worth saying plainly

This is an open source project, which means it is never finished and you are not
expected to finish it.

Your layer has the most visible work in the project and the least settled. The
patterns for rendering a contested, multi-source, still-arriving record do not
really exist anywhere, which is the good news and also why several of the design
questions have no answer in them. Open there means I do not have one.

Build a small thing that works rather than a large thing that nearly does.
