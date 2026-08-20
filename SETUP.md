# Setup

Everything you need to run this is on your own machine. **There are no sponsor
credentials to request.** If something appears to need a key you don't have,
that's a bug in the scaffold — tell us at the weekly sync and we'll fix it.

---

## Everyone: the base setup

**1. Install the toolchain**

- **Node 22.10 or later.** Check with `node --version`. If you need to install
  or switch versions, [nvm](https://github.com/nvm-sh/nvm) is the usual way —
  this repo has a `.nvmrc`, so `nvm use` picks the right one.
- **pnpm 9.** `npm install -g pnpm@9`, or `corepack enable` if you'd rather not
  install it globally.
- **Docker Desktop** — only needed if you're working on the intelligence layer.
  Skip it otherwise.

**2. Install dependencies**

```bash
pnpm install
```

**3. Create your env file**

```bash
cp .env.example .env
```

Two variables. See below for how to fill them in.

**4. Confirm it works**

```bash
pnpm fixtures:build   # regenerates the derived graph states, prints a dump
pnpm conformance      # checks the fixtures against the contract
```

If both pass, your environment is correct. That takes about two minutes and is
worth doing before you write anything.

---

## Getting a Mapbox token

You register your own. The free tier is far more than a semester of development
uses, and having your own means nobody else's usage can exhaust your quota.

1. Sign up at [account.mapbox.com](https://account.mapbox.com/) — free, no card.
2. Go to **Account → Tokens**. There's a **Default public token** already
   created for you, starting `pk.`.
3. Copy it into `.env`:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_token_here"
   ```

Notes:

- The `pk.` token is a **public** token. It's designed to be visible in
  browser code — that is what it's for. Do not commit your `.env` anyway;
  it's gitignored, and the habit matters more than this particular secret.
- Do **not** create or use a secret token (`sk.`). Nothing here needs one.
- If you plan to deploy anywhere public, add a URL restriction to your token in
  the Mapbox dashboard so someone else can't use your quota.

---

## Getting a database

Only needed for the intelligence layer. The experience layer reads fixtures off
disk and never touches Postgres.

```bash
pnpm db:up        # start Postgres 16 with PostGIS
pnpm db:verify    # confirm it's actually working
```

`db:verify` prints your Postgres and PostGIS versions and the connection string
to paste into `.env`. If something's wrong it tells you what to do rather than
printing a stack trace.

Other commands:

```bash
pnpm db:down      # stop it, keep the data
pnpm db:reset     # stop it and delete the volume — data is gone
pnpm db:psql      # open a psql shell inside the container
```

**The database is empty on purpose.** There are no application tables. Designing
the schema — tables, relations, spatial indexes, migrations — is the
intelligence layer's deliverable, and the scaffold handing it to you would be
the scaffold doing your work. What you get is a database with PostGIS and
`pg_trgm` enabled so you can start designing immediately instead of fighting
extension installs.

It runs on host port **5433**, not 5432, so it won't collide with a Postgres you
may already have running.

---

## Where to start, by team

The repo is the same for everyone. The useful starting point isn't.

### Experience layer

You don't need Docker or a database. Skip that section entirely.

```bash
pnpm dev:web
```

Then, in order:

1. Read `packages/fixtures/README.md` — what the four graph states are and what
   each one is designed to break.
2. Read `packages/fixtures/conformance/cases.ts`. This is the actual contract:
   situations the record can be in and what your interface has to do about each.
   They are deliberately awkward.
3. Open `apps/web/src/app/page.tsx`. It's a placeholder and it is **wrong on
   purpose** — its comment names three conformance cases it violates. Deleting
   it is your first commit.

Your data layer is one function:

```ts
import { loadState } from '@sagas/fixtures/conformance';
const state = loadState('t3'); // 't0' | 't1' | 't2' | 't3'
```

There is no API to call this semester. That's deliberate — see the root README.

### Intelligence layer

You need Docker. Start with `pnpm db:up && pnpm db:verify`.

Then:

1. Read `packages/contracts/src/types.ts`. These shapes are the constraint. They
   are also a starting point written by a non-specialist and are wrong in at
   least one interesting way — finding out which is part of the work.
2. Read `packages/fixtures/fixtures/anduiza/events.ts` — the authored
   contribution log, and the closest thing here to what real input looks like.
3. Read `packages/fixtures/src/reduce.ts` and `weight.ts`. The weight model is
   deliberately naive arithmetic. It is not a baseline to beat; it exists so
   claims have an ordering to render. You are replacing it.
4. `packages/db/README.md` for what's expected there.

### Content layer

Not scaffolded yet. If your team has selected this project, tell us at the first
sync and we'll build the content-layer scaffold around your sprint one rather
than guessing at it in advance.

---

## When something doesn't work

In order of likelihood:

- **`pnpm install` fails** — check `node --version` is 22.10+. This is the most
  common one by a wide margin.
- **A workspace import doesn't resolve** — run `pnpm install` again from the
  repo root, not from inside a package.
- **`db:verify` says the container isn't running** — `pnpm db:up`, wait, retry.
- **The map renders grey** — your Mapbox token is missing or malformed. Check
  `.env` has it and restart the dev server; Next only reads env at startup.
- **Anything else** — open an issue on the upstream repo rather than working
  around it silently. A setup problem you hit is one every future student hits,
  and the fix belongs in this file.
