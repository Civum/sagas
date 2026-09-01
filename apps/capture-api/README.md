# apps/capture-api — the content layer

Yours. It ships empty on purpose.

This is the part real people touch. Somebody records an account on a phone,
uploads a photograph, types up a letter, adds a translation, or reports
something that should not be public. All of it arrives here.

Designing this is the deliverable. Handing over a set of endpoints would hand
over the decisions that make it interesting.

## What goes here, roughly

- Submitting a record and attaching it to a place
- Uploading audio, photos and documents, including large files on bad
  connections
- Pulling metadata out of uploads: duration, format, dimensions, GPS from photos
- The queue of records waiting for somebody to add context or write a transcript
- Submitting translations and transcripts, with more than one allowed to coexist
- Reporting content, with reasoning attached, and a queue for reviewing reports

## Where to start

You need Postgres, object storage and ffmpeg. `SETUP.md` covers all three, and
there are fallbacks there if storage will not start.

```bash
pnpm db:up && pnpm db:verify
pnpm storage:up && pnpm storage:verify
ffprobe -version
```

Then read, in order:

1. `packages/contracts/src/model.ts`, the records and media section. A record is
   a bundle rather than a file type, and that decision shapes everything here.
2. `packages/fixtures/fixtures/example-site/events.ts`. Nine records, deliberately
   unalike: a written account with no files at all, a photograph whose embedded
   GPS lands in the middle of the street, an audio recording that took four
   months and four people to become readable, a scanned register page, and a
   600MB upload still being processed when the log ends.
3. The acceptance criteria for records in `packages/fixtures/acceptance/`.

The fixture data has no actual files behind it. The storage keys point at
objects that do not exist, because committing a hundred megabytes of invented
audio to a git repository helps nobody. Putting real bytes behind those keys is
a good first job.

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

## Who owns what

This app is yours alone. `apps/graph-api` belongs to the intelligence layer and
`apps/ui-api` to the experience layer. They are separate apps so that no two
teams edit the same files, and so each can be deployed on its own terms.

You share a database with the intelligence layer and a contract with everyone.
The contract is the thing to be careful about: a change to `@sagas/contracts` or
`@sagas/fixtures` reaches every team, so it goes through a pull request and a
check-in rather than into your fork. See `docs/GIT.md`.

## Making it a real app

It is a package with a placeholder in `src/index.ts` and no framework, because
picking one is your call. To turn it into a server:

1. Add whatever you are using to `dependencies`
2. Add a `dev` and a `start` script so `pnpm dev` picks it up
3. Add a `test` script so CI runs it
4. `pnpm install` from the repo root

`packages/contracts` is the smallest example of a package in this repo to copy
patterns from.
