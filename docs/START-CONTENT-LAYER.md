# Start here — content layer

This repo is bigger than your part of it. Most of what's in here is not yours
and you can ignore it. This page is the short version.

**Treat this as the syllabus for the semester.** Read it through once, then come
back to it. You are not expected to hold it in your head.

## What you're building

People contribute accounts of places. It might be a recording, a photograph, a
scanned document, or just typed text. Your job is the software that receives
all of that, stores it, and makes sense of the files people upload.

Two apps, both yours, both currently empty:

- `apps/capture-api`, the server
- `apps/capture-web`, the screen a person is actually looking at

## What to ignore

Genuinely ignore. It belongs to other teams and nothing you build depends on it.

- `apps/web`, `apps/ui-api`, `packages/read-model`, the reading experience
- `apps/graph-api`, the scoring and claim-graph work
- `packages/fixtures/behaviour/`, scoring rules for a different team
- Anything about claims, disputes, corroboration, weights, or trust scores

If a document starts talking about claim graphs, you're in the wrong section.
Records and media are yours. Claims are not.

## What to install first

Do this before you clone anything. Six things, and two of them catch people out.

| What | Version | Where |
|---|---|---|
| **Node** | 22.10 or later | [nodejs.org](https://nodejs.org), or [nvm](https://github.com/nvm-sh/nvm) if you juggle versions |
| **pnpm** | 9 | `npm install -g pnpm@9`, or `corepack enable` |
| **Docker Desktop** | current | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| **ffmpeg** | current | `brew install ffmpeg` · `winget install ffmpeg` · `sudo apt install ffmpeg` |
| **Git** | current | Usually installed. Windows: [git-scm.com](https://git-scm.com) |
| **VS Code** | current | [code.visualstudio.com](https://code.visualstudio.com) |

**Not yet: Mapbox.** You'll need a free token when you build the map picker, and
that's October. `SETUP.md` covers registering for one. Don't do it today. It is the
only thing here that involves signing up for anything, and it can wait until
there is a map to put on a screen.

Check each one before moving on:

```bash
node -v        # must be 22.10 or higher
pnpm -v        # must start with 9
docker ps      # must print a table, not an error
ffprobe -version
git --version
```

**Two things that will cost you an hour if you skip them:**

**Node version.** Not "Node is installed", but Node 22.10 or later. An older
Node fails in ways that never mention Node. If `node -v` prints 18 or 20, fix that
first. The repo has a `.nvmrc`, so `nvm use` picks the right one for you.

**Docker has to be running, not just installed.** Open the Docker Desktop app
and wait for the whale icon in your menu bar or system tray to stop animating.
`docker ps` printing a table is the test. If it says it can't connect to the
daemon, Docker is not running. That is the whole problem, every time.

**On Windows**, do all of this inside WSL2 rather than PowerShell. Docker
Desktop has a WSL2 setting to enable, Node and pnpm get installed inside the
Linux side, and the repo lives in the Linux filesystem rather than under
`C:\Users`. Working across the Windows/Linux boundary is slow and produces
line-ending problems that look like real bugs. Ask at a check-in if any of that
is unclear. It is a twenty-minute setup that saves a week of confusion.

## Getting the code, before anyone clicks Fork

**One fork for the whole team, not one each.** Three personal forks means three
diverging copies and no single place your work lives.

1. **Create a free GitHub organisation for the team.** Not a personal account.
   If the repo lives in one person's account and that person drops the class,
   the team loses everything, and your instructor needs access for grading.
2. **One person forks `Civum/sagas` into that organisation, once.** That fork is
   now the team's repository.
3. **Everyone clones that fork, including whoever created it.** Nobody forks
   again.

```bash
git clone https://github.com/YOUR-ORG/sagas.git
cd sagas
git remote add upstream https://github.com/Civum/sagas.git
git remote -v    # origin = your fork, upstream = ours
```

So the shape is one upstream, one team fork, three laptops:

```
Civum/sagas              ours
   └── YourOrg/sagas     yours, where all your work happens
          └── laptops    clones
```

Work on branches, open pull requests into your fork's main, review each other.
Pull requests to upstream are for contributing something back, not for daily
work. `docs/GIT.md` has the rest, including what to do when a merge goes wrong.

## Get it running

Everything above installed, and Docker actually running:

```bash
pnpm install
cp .env.example .env

cd apps/capture-api
pnpm db:up && pnpm db:verify
pnpm storage:up && pnpm storage:verify
```

The database and object storage belong to your app, so those commands live in
`apps/capture-api` and run from there. The other two layers have their own, on
their own ports, and nothing you start here touches theirs.

`db:verify` prints the connection string for your database, which is
`sagas_content` on port 5433. Uncomment that line in your `.env` and leave the
other two alone.

`SETUP.md` has the detail, including what to do when object storage won't start.
Everything runs on your own machine. No accounts to create, no keys to request,
nothing that can generate a bill.

## Editor

VS Code, and the repo is set up for it. Open the folder and it will offer to
install the recommended extensions, and you should say yes. That gets you ESLint and Prettier
wired to the repo's own config, Docker container management from the sidebar,
inline error messages, and the test runner.

Formatting and lint-fixing on save are already configured, so nobody's editor
reformats a file somebody else wrote. That one setting prevents most of the
pointless merge conflicts a three-person team hits in the first month.

Use the repo's TypeScript rather than the one bundled with VS Code. It will
prompt you, and you should say yes. Otherwise you get errors that don't exist and miss ones
that do.

## Read these four, in this order

1. `apps/capture-api/README.md`. Start with "This semester", which has the scope.
2. `apps/capture-web/README.md`, shorter, covering the browser side.
3. `packages/contracts/src/model.ts`. Read the **records and media** section
   only. Skip the rest for now.
4. `packages/fixtures/fixtures/example-site/events.ts`, nine example records.
   These are the spec. If your code handles all nine, it handles the real thing.

That's about an hour of reading. Everything else can wait until you need it.

## The plan, month by month

Roughly. Sprints are monthly rather than weekly because the useful unit here is
"a thing that works", and those take more than a week.

**September, setup and the back end for contributions.** Get the stack
running, then get a record from a browser into a database, then get files
uploading to storage and being processed.

**October, the contributing interface.** `apps/capture-web` in earnest.
Recording audio, choosing files, the submission form, and placing an account on
a map. The map is where you will need a free Mapbox token of your own. One each,
registered by you, nothing shared and nothing that costs anything. `SETUP.md`
walks through it when you get there.

**November onward, everything else.** Translation, reporting content, and
whatever the first two months turn out to have missed. We'll scope it when we
get there, with what you've learned by then.

If September takes six weeks, that's fine. Better a working thing late than a
half thing on time.

## Your first task

One week. Small on purpose.

**Accept a text-only account and store it.**

A record does not need a file. Somebody typing what their grandmother told them
is a complete contribution, and `sourceRecord` in the contract allows exactly
that, media *or* text. So the first thing that works end to end does not involve
uploads at all.

Three pieces, one per person:

- **Database.** Get Postgres running and write the migration for a `records`
  table. Shape it from `sourceRecord` in the contract.
- **API.** One endpoint that accepts a record, validates it against the
  contract's schema, and stores it.
- **Web.** One form that submits to that endpoint. Ugly is fine.

When somebody can type a paragraph into a browser and see it come back out of
the database, you've built the spine of everything else. Uploads come next.

Express, a connection pool and a migration runner are already in
`apps/capture-api`, so none of your first week goes on choosing a framework or
wiring configuration. `src/index.ts` is a placeholder with a comment describing
the shape. The endpoint and the migration are the parts you write.

**A note on why you own both sides.** Having the interface and the API on the
same team is deliberate. Building the form is what tells you what the endpoint
actually needs. You find out you are missing a field by trying to fill one in,
not by reading a schema. Use that. When the web side wants something the API
doesn't give it, that's a real finding, and it goes in the check-in note.

## About contributors

There are no user accounts and you should not build any.

A contributor is a **guest id**. It is a random string your web app generates
the first time somebody visits, saves in browser storage, and sends along with
every submission. That's it. No login, no password, no email address, no verification.

So the flow is: someone opens the site, a guest id is created without them
noticing, they contribute, and the record is attributed to that id. If they come
back on the same browser, it's the same id and their contributions are theirs.
If they clear their browser, they're a new person. That's an acceptable loss and
it is not a bug you need to solve.

**Testing with more than one person.** Because the guest id lives in browser
storage, and storage is separate per browser profile, one laptop gives you
several contributors at once. A normal window is one person, a private window is
another, and a second browser is a third. You can also open developer tools and
set the id by hand to become any contributor in the fixture data, which is the
fastest way to reproduce a bug somebody else hit. Real accounts would make this
harder, not easier, since you would have to register and sign in twice to do the
same thing.

This is a deliberate design decision, not a shortcut we're taking because
accounts are hard. The project is trying to work out whether a record can be
trusted based on what it says and how it's corroborated, rather than on who said
it. Real accounts matter eventually. They are not this semester's problem, and
building them would cost you six weeks you need for other things.

## Every Monday

Check `CHANGELOG.md`. If something moved, it's listed there with an **Affects**
line. If that line doesn't name the content layer, you can ignore it entirely.

Your fork never updates itself, so nothing changes under you. There's a GitHub
Action that opens an issue on your fork when upstream has moved, but you decide
when to pull it in. If you're unsure whether a change matters, bring it to the
check-in rather than merging it and finding out.

## How we work

- **Check-in, 30 minutes.** Weekly for the first month, then every other week.
- **Office hours, 30 minutes before it.** Runs only if there's something to
  discuss, so most weeks it won't.
- **A short note before each check-in.** Template is in
  `docs/CHECK-IN-TEMPLATE.md`. The most useful part is what you *assumed*.
  that's how we find out a spec was unclear before you've built two weeks on it.
- **Small pull requests, opened as drafts early.** I would rather see the shape
  at 20% and say "not that direction" than read 800 lines and ask you to start
  over.
- **Between meetings**, expect a reply within a working day rather than the same
  evening. If you are blocked, open a draft pull request or put it in the note.

`docs/WORKING-TOGETHER.md` has the full version.

## What you get from me

- Sample audio, photo and document files behind the fixture data, this weekend
- Pull request review, personally, every week
- Anything merged upstream is credited to you by name. Your fork is yours
  regardless, and what you write in it stays yours.

## What all this stuff actually is

Reference. Skim it now, come back when a name shows up and you're not sure why
it's there. Each of these has proper documentation online; this is just enough
to know why the project uses it.

### The things you install

**Docker** runs programs in isolated containers so everyone's machine behaves
the same way. Instead of installing Postgres directly and fighting your OS about
it, you run a container that already has it. Docker Desktop is the app that
makes that work on Mac and Windows, and it has to be running for any of it to
happen.

**Postgres** is the database. It's a much bigger tool than SQLite, and the parts
that matter here are that it handles many writers at once, has a real type
system, and has a geographic extension called **PostGIS** for questions like
"what accounts are within two kilometres of this building". You'll meet PostGIS
later, not in September.

**MinIO** is file storage that speaks the same API as Amazon S3. Photographs and
recordings don't belong in a database, so they go here instead, and the database
just stores a key pointing at them. Running MinIO locally means you write code
against the same interface a real deployment would use, without an AWS account
or a bill.

**ffmpeg and ffprobe** are command line programs for audio and video. They are
programs, not libraries, which is why they're an install step. `ffprobe` reads a
file and tells you about it without changing it: how long a recording is, what
format it really is, what its bitrate is. `ffmpeg` converts things. You'll use
`ffprobe` to find out that an upload is fourteen minutes long and is actually a
WAV despite being named `.mp3`, and `ffmpeg` to make a small playable version of
a file too big to stream.

**pnpm** installs packages, like npm but faster and stricter about what a
package is allowed to import. This repo is a **workspace**, which means several
packages live in one repository and can depend on each other directly.

**Turbo** runs commands across all those packages at once and caches the
results, so `pnpm lint` doesn't relint things that haven't changed.

### The things already in the code

**Zod** describes the shape of data and checks it at runtime. In this repo it's
the single source of truth: the TypeScript types are derived from the Zod
schemas rather than written twice. When a request arrives, you hand the body to
the schema and either get typed data back or a clear error.

**Vitest** runs the tests.

**Prettier** formats code and **ESLint** catches likely mistakes. Both are
configured already and run on save in VS Code, so you shouldn't have to think
about either.

### Words you'll hit

**Presigned URL.** A temporary link that grants permission to do one specific
thing, usually uploading one specific file, and expires in minutes. It's how a
browser writes directly to storage without your server holding the file or
handing out lasting access.

**Derivative.** A file generated from an uploaded one. A small MP3 made from a
large WAV, a thumbnail from a photo, a waveform from a recording. Derivatives
are disposable by definition: if you lose one you regenerate it from the
original.

**Waveform.** The jagged line you see in any audio player, showing where a
recording is loud and quiet. It's computed by sampling the audio, and it's what
lets somebody scrub to the part they want instead of listening from the start.
For an oral history that's the difference between a recording being usable and
being a wall.

**EXIF.** Metadata cameras and phones bury inside photo files. Date taken,
camera model, and often GPS coordinates. It's how a photograph can disagree with
where somebody said it was taken, which is one of the nine fixture records.

**Migration.** A file describing a change to the database structure, kept in
version control and applied in order. It's how the database on your laptop and
the one on somebody else's stay the same shape.

**Job queue.** A list of work to do later, outside a web request. Probing a
600MB file takes too long to make somebody wait for it, so the upload finishes
immediately and the probing happens afterwards. That's why records have a
`processingState`.

## One thing worth saying plainly

This is an open-source project, which means it's never finished, and you are not
expected to finish it. Whatever you complete is a contribution, and it stays in
the record with your name on it. Build a small thing that works rather than a
large thing that nearly does.
