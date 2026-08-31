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
- **Docker Desktop.** Every team needs it. The experience and intelligence
  layers each run a local Postgres for different jobs, and the content layer
  adds object storage alongside it.

**2. Install dependencies**

```bash
pnpm install
```

**3. Create your env file**

```bash
cp .env.example .env
```

Then fill in what your layer needs. The `db:verify` and `storage:verify`
commands below print the values for you, and the only one you have to go and get
yourself is a Mapbox token.

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

The experience and intelligence layers both need this. They run separate
databases for different jobs, and `packages/db/README.md` explains which is
which.

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
pnpm db:reset     # delete the database data, leaves object storage alone
pnpm db:psql      # open a psql shell inside the container
```

**The database is empty on purpose.** There are no application tables. Designing
the schema, the relations, the spatial indexes, and the migrations is a
deliverable, and a scaffold that handed it over would be doing your work. What
you get is Postgres with PostGIS and `pg_trgm` already enabled, so you can start
designing instead of fighting extension installs.

It runs on host port **5433**, not 5432, so it won't collide with a Postgres you
may already have running.

---

## Getting object storage

**Content layer only.** If you are not working on submission or media upload,
skip this.

Files do not go in Postgres. A 600MB recording in a database column makes every
backup, every restore, and every query on that table slow, and you cannot stream
part of it out to let somebody seek in an audio player. Media goes in object
storage and the database keeps a key pointing at it.

```bash
pnpm storage:up        # start it
pnpm storage:verify    # confirm it works, make the bucket, print your env vars
```

`storage:verify` is safe to run repeatedly. It creates the bucket if it is
missing and prints what to paste into `.env`.

Other commands:

```bash
pnpm storage:down      # stop it, keep the data
pnpm storage:reset     # delete the storage data, leaves your database alone
pnpm storage:mc        # list what is in the bucket
```

It runs behind a compose profile, so `pnpm db:up` stays a single container for
the teams who only need a database.

### What it is and why it doesn't matter much

It's MinIO, which speaks the S3 API. That API is the point. Everything you write
against this works unchanged against S3, Cloudflare R2, or Backblaze B2 later,
because your code only ever sees an S3 client pointed at a different endpoint
with different credentials.

One line in `.env` is the exception. `S3_FORCE_PATH_STYLE="true"` is there
because MinIO addresses buckets by path and real S3 addresses them by subdomain.
That flag is the whole difference.

**One thing to know about MinIO.** Its community edition was archived in
February 2026, so it gets no further updates. It still works and the S3 API it
implements has not changed. We are using it because it is the best documented
thing in this category by a wide margin, and because a local container holding
invented fixture data on your own machine is about the lowest-stakes place a
frozen dependency can sit. If it ever gets in the way, swapping it is roughly
fifteen lines of `docker-compose.yml`, and none of your application code moves.

### Before you write any upload code

Read the storage section of [`apps/api/README.md`](./apps/api/README.md) first.
It has the bucket layout and the upload flow, and it explains which of the two
obvious designs is the one that costs you a rewrite in November.

### You also need ffmpeg

Working out how long a recording is, and making a smaller version people can
actually play in a browser, is `ffmpeg` and `ffprobe`. They are ordinary command
line programs, not libraries.

```bash
# macOS
brew install ffmpeg

# Windows, in PowerShell
winget install ffmpeg

# Debian or Ubuntu
sudo apt install ffmpeg
```

Check it with `ffprobe -version`. If that prints something, you are done.

### When object storage will not run

It happens. A locked-down laptop, Docker refusing to start, a port already
taken. You are not blocked, and you should not spend a day on it.

**First, run MinIO without Docker.** It is a single binary and it does not need
a container:

```bash
mkdir -p .minio-data
minio server .minio-data --console-address ":9001"
```

Same ports, same credentials once you set `MINIO_ROOT_USER` and
`MINIO_ROOT_PASSWORD`, same everything from your code's point of view.

**Second, tell us.** If neither route works, say so at the check-in rather than
losing a week to it. We can arrange access to a real bucket through Civum. That
is a slower path because it involves a person, so try the two above first, but it
exists and it is not a favour.

**What not to do:** do not write files to a local folder behind your own
interface and plan to swap it later. It looks like the pragmatic choice and it
is the one that costs you the rewrite, because presigned uploads and
POST-through-the-API are different architectures rather than different
implementations.

---

## Where to start, by team

The repo is the same for everyone. The useful starting point isn't, and the
detail lives next to the code rather than here. This section is a signpost.

| Your layer | What you need running | Read this first |
|---|---|---|
| **Experience** | Postgres | [`apps/web/README.md`](./apps/web/README.md) |
| **Intelligence** | Postgres | [`packages/db/README.md`](./packages/db/README.md) |
| **Content capture** | Postgres, object storage, ffmpeg | [`apps/api/README.md`](./apps/api/README.md) |

Everyone, whatever layer you are on, reads
[`packages/fixtures/conformance/cases.ts`](./packages/fixtures/conformance/cases.ts)
before calling anything done. It is a list of awkward situations the record can
be in and what your code has to do about each one, and it is the closest thing
this project has to a specification.

[`docs/GIT.md`](./docs/GIT.md) covers the parts of git that are particular to
this project: adding the upstream remote, why your fork doesn't update itself,
how to pull a contract change forward, and how to send something back to us. It
is not a git tutorial. Read it once after you fork.

Then [`docs/DESIGN-QUESTIONS.md`](./docs/DESIGN-QUESTIONS.md), which is the list
of things in here we know are wrong or unsettled. Read the part that touches
your work before you refactor something, because a few of them look like
sloppiness and aren't.

## When something doesn't work

In order of likelihood:

- **`pnpm install` fails** — check `node --version` is 22.10+. This is the most
  common one by a wide margin.
- **A workspace import doesn't resolve** — run `pnpm install` again from the
  repo root, not from inside a package.
- **`db:verify` says the container isn't running** — `pnpm db:up`, wait, retry.
- **`db:verify` or `storage:verify` says a port isn't published** — something
  else on your machine is already using 5433 or 9000. Find it with
  `lsof -i :5433`, stop it, and start the container again.
- **Uploads work and then the file 404s** — you stored a presigned URL somewhere
  instead of generating one when it was asked for. See `apps/api/README.md`.
- **`ffprobe: command not found`** — ffmpeg isn't installed. See the object
  storage section above.
- **The map renders grey** — your Mapbox token is missing or malformed. Check
  `.env` has it and restart the dev server; Next only reads env at startup.
- **Anything else** — open an issue on the upstream repo rather than working
  around it silently. A setup problem you hit is one every future student hits,
  and the fix belongs in this file.
