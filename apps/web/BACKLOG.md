# Experience layer backlog

The work for this layer, grouped into epics. Each epic starts with a few stories
and gains more at each specification meeting, as the earlier ones land. If an
epic looks thin, that is why.

**How to read a story.** Each `###` heading is one story, written so it can be
pasted into a GitHub issue as it is: the heading is the title and everything
under it is the body. Whether your team tracks them as issues is up to you.

- **Goal** says what the story is for.
- **Done when** is what gets checked at the specification meeting.
- **Not in this story** is there so a story does not quietly grow.
- **Status** says whether it can start now, and if not, which stories it waits
  on.
- **Read first** names documents to read before starting, if any.

A story that turns out to be wrong, too big or unclear is normal. Say so in the
check-in note and it gets rewritten.

Status key: **Ready** (can start now), **Later** (written, waiting on the
stories named), **Draft** (direction only, gets detail at a specification
meeting).

When a story says "write down why", put it in the pull request description.

---

## Epic A — Foundations (sprint one)

Five pieces that can run in parallel, one per person. Together they let
everything after this be built by several people at once.

### A1 · Component library for the renderer

**Status:** Ready

**Goal.** The shared building blocks every view uses, so five people build the
same page from the same parts.

**Done when:**
- `src/components/ui` holds the generic pieces the first views need: at least
  text styles, a button, a card or panel, a tag or label, a tooltip, and a
  dialog.
- Colours, spacing and type sizes are defined once, as design tokens (named
  values like `--space-2` or `text-muted`), and components use the tokens rather
  than raw values.
- Every component meets the colour contrast level of the Web Content
  Accessibility Guidelines (WCAG) 2.1, level AA, and every interactive one works
  from the keyboard.
- Nothing in `src/components/ui` imports from `@sagas/contracts`. If it needs to
  know what a claim is, it belongs in `src/features`.
- A short `src/components/ui/README.md` says what exists and how to add to it.

**Not in this story.** Sagas-specific components such as a claim or a dispute.
Those come in epic C and are built from these.

**Worth knowing.** `src/components/ui` already follows the shadcn/ui convention
for where primitives live, as its README explains. You are free to use shadcn/ui
or not. Decide as a team and write down why.

### A2 · Front-end test setup

**Status:** Ready

**Goal.** Components can be rendered in a test, not only the pure functions
beside them.

**Done when:**
- The Vitest setup in `apps/web` is extended so a test can render a React
  component and query what it shows. Testing Library is the usual choice. Pick
  it or something else and say why.
- An automated accessibility check runs in at least one component test. Which
  library does it is your choice. Write down why.
- The existing `IntegrityBadge` and `ConfidenceIndicator` tests still pass, and
  there is one new rendering test for each as an example.
- `pnpm --filter @sagas/web test` runs everything, and the output shows the new
  tests actually ran. A test file outside Vitest's include list is skipped
  silently while the run still reports success, so check the count.

**Not in this story.** End-to-end browser tests. Those can come later.

**Worth knowing.** Test behaviour, not markup. "A thin record is never described
as failing" is worth a test. "This div has this class" breaks every time
somebody improves the design.

### A3 · Storybook investigation

**Status:** Ready. Time-boxed to a few days.

**Goal.** Find out whether Storybook is worth adopting here before anybody
depends on it. `/dev` already does part of its job.

**Done when:** a short write-up, in the pull request or a markdown file,
answering:
- What it takes to run Storybook in this repository: Next 15, Tailwind, a pnpm
  workspace. What had to be installed or configured.
- Whether a Mapbox map can render inside it, and what that needs.
- Whether the fixture states and their acceptance criteria can sit beside each
  component the way they do on `/dev`.
- A recommendation: adopt it, or keep `/dev`.

If adopting is cheap, a working setup with one story for `IntegrityBadge` is a
good end point. If it is not, the write-up alone is a complete result.

**Not in this story.** Stories for every component.

### A4 · Mockups for the first tasks

**Status:** Ready

**Goal.** Agree what the first screens look like before building them.

**Done when:** mockups, sketched or in a design tool, for:
- The map with a search bar, and what happens when you pick a result (see B2).
- A site page at `t0` (one contributor, nothing corroborated) and at `t3`
  (several conversations, a dispute, a translation).
- One conversation: a source record and the claims made from it, including a
  detail that somebody disputes.
- A short note with each screen saying what a person sees when they are the
  only contributor at a place.

**Not in this story.** Final visual design. These are for arguing with.

**Read first.** `docs/HOW-THE-LAYERS-FIT.md` and the fixture README section
"What your interface has to handle".

### A5 · Entity relationship model from the reading side

**Status:** Ready

**Goal.** Decide what your database holds, shaped for drawing a map and a page.

**Done when:**
- A diagram of the entities a page needs (sites, conversations, source and
  evidence records, claims and their details, disputes, extensions, renderings,
  contributors) and how they relate.
- A note on what is stored ready to draw versus worked out per request. Example:
  whether a site's list of conversations is stored or built on each read.
- A first migration in `apps/ui-api` that creates the tables, run against the
  local database started with `pnpm db:up`. There is no migration tool in
  `apps/ui-api` yet, so choosing one is part of this story. Write down why.

**Not in this story.** Loading the fixture data into it (C0), and matching the
other layers' schemas, which is not a goal.

**Worth knowing.** "Conversation" is a working idea, not yet a named object in
the contract. Model it the way you think a page needs it, and bring what you
decide to the specification meeting. That is useful input to the shared design.

---

## Epic B — Finding a place

The map and the list. Concrete work that can start as soon as A1 has a few
components.

### B1 · Mapbox map with the fixture sites as pins

**Status:** Ready

**Goal.** Replace the TODO in `src/features/map/MapView.tsx` with a real map.

**Done when:**
- With `NEXT_PUBLIC_MAPBOX_TOKEN` set, the map renders every site from
  `listSites()` as a pin, centred on the sites.
- With no token, `MapUnavailable` still renders the list. Both paths work.
- Pins show at a glance whether a place is thinly or well documented, using the
  band from `IntegrityBadge`, not a number.
- Clicking a pin opens that site's page.

**Worth knowing.** `mapbox-gl` is already a dependency. Coordinates are
`[longitude, latitude]`. Each person registers their own free token, and nobody
commits one.

### B2 · Search bar that finds an address and drops a pin

**Status:** Later. Needs B1.

**Goal.** Somebody types an address or a place name and the map goes there.

**Done when:**
- A search field on the map suggests matches as you type.
- Choosing one moves the map there and drops a pin.
- The fixture sites in view stay visible as pins after the search, so a site
  near the result is one click away.
- It works from the keyboard and with a screen reader.

**Part of the story:** find out which Mapbox service does address search, what
its free allowance is, and whether results may be stored. Write down what you
found and where you found it.

**Not in this story.** Creating a new site from the dropped pin. Creating sites
is not part of this layer's work.

### B3 · The list view has everything the map has

**Status:** Ready

**Goal.** Somebody who cannot use the map loses nothing.

**Done when:**
- A list view shows every site the map shows, and it is reachable whether or not
  a Mapbox token is set. `MapUnavailable` is where it starts.
- A search field filters the list by site name, other names (`aka`) and address.
  This searches the fixture data, not Mapbox, so it works with no token.
- Each entry says in words how well documented the place is.

### B4 · Only load the sites in view

**Status:** Later. Needs A5 and C0.

**Goal.** The map asks for the sites inside the visible area, not all of them.

**Done when:** `listSites()` takes a bounding box, the database answers it with
a spatial index, and panning the map loads new sites. See `docs/GIS.md`.

---

## Epic C — The narrative page

How the claims at a site become a page. `apps/web/DIRECTION.md` has what is
decided and what is open. These first stories render what the fixture already
has.

### C0 · Load the fixture states into your database

**Status:** Later. Needs A5.

**Goal.** `packages/read-model` reads from Postgres, not JSON files.

**Done when:** a seed script loads every fixture state, the read functions query
the database, and `/dev` looks the same as before.

### C1 · Render one conversation

**Status:** Later. Needs a few A1 components and the A4 conversation mockup.

**Goal.** The source record and the claims made from it, readable in order.

**Done when:**
- A component takes a source record and its claims and renders them, using A1's
  components.
- Each claim shows who made it and when.
- It renders against all four states on `/dev` without looking broken at `t0`.

### C2 · Disputes on a detail

**Status:** Later. Needs C1.

**Goal.** When somebody disputes one detail of a claim, the disagreement shows
at that detail and the rest of the claim reads as undisputed.

**Done when:**
- `src/features/article/DetailDisputes.tsx` shows every reading of the disputed
  detail, each with its reasoning and who gave it.
- The claim's own reading stays in place in the sentence, and the competing
  readings sit visibly beside it. Nothing marks either as the answer, and there
  is no vote count.
- A dispute with reasoning but no proposed value still shows, as an objection
  to the detail with its reasoning.

See "Disagreement lands on a part, not the whole" in
`packages/fixtures/README.md`. The corner shop site at `t2` has a clean example.

### C3 · Where a claim comes from

**Status:** Later. Needs C1.

**Goal.** Every claim reaches the person who made it, its source record, and any
evidence records attached to it.

**Done when:** `src/features/article/SourcePanel.tsx` shows these, and a claim
whose author is not the person who handed over the record makes that clear.

### C4 · Translations and transcripts side by side

**Status:** Later. Needs C1.

**Goal.** A claim with no English rendering is readable in its original, and a
claim with several renderings shows all of them, credited.

**Done when:** `src/features/article/TranslationPanel.tsx` handles no rendering,
one, and several, as its own comment describes.

---

## Epic D — Suggestion

**Status:** Draft. Starts with a design exercise, not code.

How a reader is pointed at what to read next and what they could add. The
routing that decides this belongs to the intelligence layer and does not exist
yet, so this epic designs the interface against invented signals first. The
passover interaction joins this epic once the design exercise is done.

### D1 · Design exercise: the suggestion interface

**Status:** Draft. Gets detail at the first specification meeting.

**Goal.** A proposal for how the interface suggests content to a reader,
worked through the way a product design exercise is: who the user is, what they
are trying to do, what the system knows, and what the screen does about it.

**The brief.** Think of designing a site like Reddit, with the
constraints this project adds. There are no vote counts and no scores shown to
anyone. Agreement is not evidence. A claim nobody has responded to is not
doubted, it just has not reached anyone who knows. What does a reader see that
makes them want to read on, and makes somebody who knows something want to
add it?

**Done when:** mockups plus a page of reasoning, brought to a specification
meeting. Stories to build it come out of that meeting.

---

## Epic E — References

**Status:** Draft.

How claims, records and renderings cite each other on the page, and how
somebody links to one claim. See `apps/web/DIRECTION.md`. Stories get written
once C1 and C3 exist.
