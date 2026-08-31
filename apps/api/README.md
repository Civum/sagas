# apps/api

Home for the server. Nothing here yet.

## What this server is for

Two different jobs end up here, and they belong to different teams.

**Taking things in.** Someone records an account on their phone, uploads a
photo, adds a translation, or flags something that looks wrong. All of that
needs endpoints, file upload, a queue for things waiting to be processed, and
somewhere to put media. This is the content layer's work and it is the part real
people touch.

**Working things out.** Given everything the archive holds about a place, how
much support does each claim have, what's contested, what's missing, and what
should the narrative look like right now. This is the intelligence layer's work.

They share a server and a database. They are not the same work and shouldn't be
scoped as if they were.

## Why it's empty

Same reason as `packages/db`. Designing the API is a deliverable. Handing over a
set of endpoints would be handing over the design decisions that make it
interesting.

## What goes here, roughly

Taking things in:

- Submitting a record and attaching it to a place
- Uploading audio, photos, and documents, including large files and flaky
  connections
- Pulling metadata out of uploads — duration, format, GPS from photo EXIF
- The queue of records waiting for someone to add context or a translation
- Submitting translations and context, with more than one version allowed to
  coexist
- Flagging content, with the reasoning attached, and a queue for reviewing flags

Working things out:

- Reading the graph for a place
- Scoring claims and recomputing when something changes
- Geographic queries — what's near here, what's inside this boundary
- Finding gaps worth filling and turning them into prompts

## Where to start

You need Postgres, object storage, and ffmpeg. `SETUP.md` has all three, and
there are fallbacks there if storage will not start.

```bash
pnpm db:up && pnpm db:verify
pnpm storage:up && pnpm storage:verify
ffprobe -version
```

Then read, in order:

1. `packages/contracts/src/model.ts`, the "Records and media" section. A record
   is a bundle rather than a file type, and that decision shapes everything
   here.
2. `packages/fixtures/fixtures/anduiza/events.ts`. Nine records, and they are
   deliberately different from each other: a written account with no files at
   all, a photograph with a caption and GPS that lands in the middle of the
   street, an audio recording that takes four months and four people to become
   readable, a scanned register page, and a 600MB WAV still being processed when
   the log ends.
3. `packages/fixtures/conformance/cases.ts`, the record cases. That is what your
   work has to survive.

The fixture data has no actual files behind it. The storage keys point at
objects that do not exist, because committing a hundred megabytes of invented
audio to a git repository helps nobody. Putting real bytes behind those keys is
one of the first useful things you can build.

## Storage

### Where things go

One bucket, `sagas-media`, laid out by record:

```
records/<recordId>/<mediaId>/<original filename>
records/<recordId>/<mediaId>/derived/<what it is>.<ext>
```

The keys in the fixture data follow this, so you can read them and see the
shape. Two rules behind it: a key never contains anything a person typed, and a
key never has to change. Filenames from uploads contain spaces, accents, and
occasionally somebody's full name, so the `<mediaId>` segment is what makes the
path safe and the original name is kept as metadata rather than as structure.

Derivatives live under the original they came from because they are disposable.
Anything under `derived/` can be rebuilt by running the job again, and nothing
should ever point at one as though it were the source.

### The upload flow, which is the part to get right

The browser uploads **straight to storage**. Your server never handles the
bytes.

1. The browser asks your API where to put a file, giving a name, a type, and a
   size.
2. Your API decides whether to allow it, invents a `mediaId`, works out the key,
   and asks storage for a **presigned PUT URL** that expires in a few minutes.
   It writes down that this file is expected.
3. The browser PUTs the bytes to that URL. This does not touch your server at
   all.
4. The browser tells your API it finished. Your API checks the object is
   actually there and is the size it was told to expect, marks it `uploaded`,
   and queues a job.
5. A worker probes it with `ffprobe`, builds whatever derivatives it needs,
   fills in duration or dimensions, and marks it `ready`.

Reading works the same way in reverse. **Never store a URL.** Generate a
presigned GET when somebody asks for the file and let it expire. A URL saved in
the database is a URL that stops working, and one that does not expire is a
public link to something a family may not have agreed to make public.

Files big enough to matter need **multipart upload**, which is the same idea
with one presigned URL per part and a call at the end to stitch them together.
That is what makes a 600MB recording survive a phone dropping off wifi halfway
through. Build the single-shot version first, then this.

**The version not to build:** POSTing the file through your own API and having
the API write it onward. It is fewer moving parts and it is the wrong shape.
Your server holds a request open for the length of the upload, memory goes up
with file size, and every timeout in front of it becomes a failed contribution.
It is not a refactor away from the right design, it is a different design.

### Jobs

Probing, transcoding, and thumbnailing are slow and they fail, so they run in
the background rather than in a request.

Put the queue in Postgres. `graphile-worker` and `pg-boss` both do this well.
You get a queue that is transactional with the data it is about, survives a
restart, and needs no extra service. Adding Redis here buys nothing at this size
and costs you a container, a set of credentials, and a new way for the stack to
be half-running.

There are two things called a queue in this project and they are not the same.
The one above is jobs. The other is `submissionState`, records waiting for a
person to add context or write a transcript, and that is a column and a query
rather than machinery.

## How this package fits the repo

pnpm workspace, Turborepo. Every folder under `apps/` and `packages/` is its own
package. To make this a real one:

1. `package.json` named `@sagas/api`, `"private": true`
2. Depend on `@sagas/contracts`, and `@sagas/db` once it exists
3. `tsconfig.json` extending `@sagas/tsconfig/base.json`
4. `lint`, `typecheck`, and `test` scripts so CI runs them
5. `pnpm install` from the repo root

`packages/contracts` is the smallest example to copy from.

## Nothing depends on this yet

The experience layer runs a small local database of its own and a thin read API
inside `apps/web`, so it never calls this server. That's deliberate. The
interface work can't be blocked waiting for this, and this can't be blocked
waiting for that.
