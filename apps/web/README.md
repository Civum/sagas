# apps/web — the experience layer

This is yours. It ships close to empty on purpose.

The design system, the component library, the map, the article renderer,
heritage trails, badges, and the contributor dashboard are all your scope. There
are no design tokens and no component library in here. Handing those over would
take away the most interesting work in the project.

What you get instead: a working Next + TypeScript + Tailwind setup, the fixture
data, a place for every read to go through, and a list of situations your
interface has to survive.

## Run it

```bash
pnpm install
cp .env.example .env      # add your own Mapbox token, or don't. See below.
pnpm dev:web
```

Two routes exist:

- `/` — a map and one article, wired end to end and looking like nothing.
- `/dev` — the same components rendered against all four fixture states, with
  the acceptance criteria for each state listed underneath.

Use `/dev` while you build. A component that looks right against `t3` and falls
apart against `t0` is the normal failure, and `t0` is the state most real places
sit in for a long time.

**You do not need a Mapbox token to work on this.** With no token, the map area
renders a list of the same places instead. That path is not a fallback. It is how
the map's information reaches someone using a screen reader, so it ships either
way and it needs to be good. See `src/features/map/MapUnavailable.tsx`.

## Where the data comes from

Every read goes through `src/lib/queries.ts`:

```ts
import { getSiteState, listSites } from '@/lib/queries';

const state = getSiteState('t3'); // 't0' | 't1' | 't2' | 't3'
```

Today those functions read fixture JSON off disk. That is a starting point, not
the design.

**Your first infrastructure job is to put a database behind them.** Run Postgres
locally, design a schema for reading, seed the fixture states into it, and make
`queries.ts` query it instead. That is real work and it belongs to whoever holds
the back end and database roles: schema design, spatial indexing so "everything
within 2km of here" is fast enough to drive a map, and working out what is held
in memory versus fetched per request.

Do it early. If the whole interface is built against a file and the database
arrives in November, November is when you find out which components assumed data
was free to fetch.

It stays local. Nothing here talks to a server anyone else runs, and nothing
deploys until you decide to.

`src/app/api/sites/` holds HTTP routes over the same functions. That is your read
API and it is the seam a client-side map fetches through. Server components can
call `queries.ts` directly and mostly should.

There is no synthesis API this semester. The intelligence layer builds that
later, and a derived graph state is enough for every view in your scope. If you
find yourself wanting to fetch narrative state from a service that does not
exist, stop and bring it to a check-in. It means the contract is missing
something, which is worth knowing early.

## How the files are organised

```
src/app/          routes. Pages read data and hand it down.
src/features/     components that know what Sagas is.
src/components/ui/ generic pieces. Nothing in here knows what Sagas is.
src/lib/          data access and helpers.
```

Two rules hold this together:

**Components take props. They do not fetch.** A page or route handler calls
`queries.ts` and passes the result down. This is what lets the same components
render against four different states on `/dev`.

**`components/ui` stays generic.** A button, a dialog, a tooltip. If a file in
there imports from `@sagas/contracts`, it belongs in `features` instead. This is
the shadcn convention and it is worth keeping. It is the difference between a
component library you can reuse and one that only works on one page.

## Start here: one worked example, then the stubs

**Three components are finished.** They go from data to rendered pixels, they
are commented as examples rather than specifications, and they have tests.

- `src/app/page.tsx` — how data gets from `@sagas/read-model` to the screen
- `src/features/site/IntegrityBadge.tsx` — and its test
- `src/features/article/ConfidenceIndicator.tsx` — and its test
- `src/features/map/MapUnavailable.tsx`

**Everything else under `src/features` is one line and a TODO.** Each carries a
comment saying what it has to become and what is easy to get wrong, and several
name the acceptance case they are worried about.

Read the finished ones, then do the next five. That is a well-shaped first task
and it is roughly how the job works.

Two things to copy from the examples, and one not to.

**Copy the split.** The judgment lives in a pure function, `bandFor` or
`supportSummary`, separate from the markup, so it can be tested without
rendering anything. A test that a div has a class fails every time somebody
improves the design. A test that a sparse record is never described as failing
is worth keeping.

**Copy the data flow.** The page reads, components take props. That is what lets
the same components render against four fixture states on `/dev`.

**Do not copy the styling.** Grey text and system fonts are a placeholder. The
design system is your deliverable, and nothing in there is a suggestion.

The most important idea in the model is in `ConfidenceIndicator`: an affirmation
is not corroboration. A claim can have five people agreeing and no independent
support, because all five are from the author's family.

## When something is behaving strangely

[`docs/DEBUGGING.md`](../../docs/DEBUGGING.md) covers the failures that do not
announce themselves: Turbo replaying a cached pass, an environment variable that
needs a restart, `params` being a Promise in Next 15, and the server-versus-client
component error that confuses everyone once.

## Before you call a view done

Read `packages/fixtures/README.md` for what the four graph states are and what
each one is designed to break.

Then read `packages/fixtures/README.md`. Each case is a situation the
record can be in and what your interface has to do about it. They are the
awkward ones on purpose.

The file also lists situations no fixture covers yet. If you hit one, say so.
Adding fixture coverage for a gap is a useful pull request.

## Deploying it

This is yours to own, including the choice of where. We are not picking for you,
because picking would remove the part of this that looks like a real job.

What we need from it, whatever you choose:

- **A URL that works**, from early on. Deploy in week two, before there is
  anything interesting to see. A pipeline that exists before it matters is a
  pipeline that works when it does.
- **A preview per pull request.** This is the one that changes how review feels.
  Reviewing your work becomes opening a link rather than pulling your branch and
  running it, which means feedback comes back in an evening rather than a week.
- **No sponsor credentials.** Whatever it runs on is a hosting account your team owns.

Vercel is the path of least resistance for Next and gives you both of the first
two out of the box. Two things to know before you commit to it.

Its free Hobby plan is **non-commercial personal use only**, and their
definition is broad: any deployment "used for the purpose of financial gain of
anyone involved in any part of the production of the project". Asking for
donations counts. A student capstone with no payment path is fine. That is a
reason to keep the deployment under your own hosting account rather than a sponsor's,
and a reason not to build anything load-bearing on Vercel-specific behaviour.

The Hobby CPU allowance is also small, measured in a handful of CPU-hours a
month. Spatial queries are the expensive part of this layer, which is one of the
reasons `apps/ui-api` is a separate app: a server on ordinary hosting does not
have that ceiling.

Nothing about the local setup changes for any of this. `pnpm dev:web` is the
same either way.

## Things you might add

None of these are required. All of them are yours to decide.

- **Storybook.** `/dev` is a rough version of what it does. If you want the real
  thing, add it. Keep the acceptance criteria visible next to the components,
  because that pairing is the point of the page.
- **Rendering tests.** Vitest is wired up and there are tests for the pure
  functions, but nothing renders a component. Testing Library is the usual
  choice if you want that, and it is worth having before the design starts
  moving.
- **Real accessibility checks in CI.** The target is WCAG 2.1 AA. Nothing
  currently enforces it.
