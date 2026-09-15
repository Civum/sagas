# Changelog

Every change to `@sagas/contracts` or `@sagas/fixtures` gets an entry here with a
contract version, who it affects, what a consumer has to do, and most
importantly **why it changed and where it came from.**

**One changelog, not one per school.** A change frequently touches two layers,
and more to the point, seeing that the intelligence team found a flaw the
experience team is now working around is the entire reason the contract sits in
the middle. Splitting this file would hide the one thing it exists to show.

Entries name **layers**, not schools. Layers are stable; which university owns
one is not, and this file should still make sense to next year's cohort.

Changes land on Mondays and only on Mondays. See "When the contract changes" in
the root README. Your fork is pinned, so nothing here reaches you until you pull.

**Two kinds of entry.** A contract change carries a version number. A repo change
(a new app, a new guide, tooling) carries a date only, because it does not move
the contract. Both say who they affect, and both are worth a Monday glance.

**Check this file every Monday.** If the **Affects** line doesn't name your
layer, you can stop reading and get on with your week.

## Entry format

```
## vX.Y.Z — YYYY-MM-DD

**Affects:** experience layer · intelligence layer · content layer · none (additive)

**What:** One line. The diff, in English.

**Why:** Where this came from. Which team hit it, or which conversation caused
it. This is the most useful field in the entry.

**You need to:**
- *experience layer* — nothing, or the specific migration.
- *intelligence layer* — nothing, or the specific migration.
```

---

## 2026-09-15 — repo change, no contract movement

**Affects:** experience layer

**What:**

- New guide, `docs/START-EXPERIENCE-LAYER.md`. What to read, what to ignore,
  what to install, and the first task. It completes the set of three.
- `SETUP.md` now points each team at its start guide rather than at an app
  README. The app READMEs were never the right first read and the guides were
  not linked from anywhere somebody would look.

**Why:** The experience layer was the only one without a start guide, because it
was the last team to be assigned. The scope document that went to the department
predates several decisions and contradicts the repository in seven places,
including a synthesis API that does not exist this semester, a trust score the
model deliberately does not have, and two cross-team dependencies that were
never real. A guide built from the current model is the correction.

**You need to:**

- *experience layer* — read `docs/START-EXPERIENCE-LAYER.md` before anything
  else. Where it disagrees with the scope document you were given, it wins.
- *intelligence layer* — nothing.
- *content layer* — nothing.

---

## 2026-09-14 — an image record needs a note

**Affects:** content layer

**What:** a second refine on `sourceRecord`. If any of a record's media is an
image, `note` must be present and non-empty.

**Why:** a recording and a video carry their own account of what they are, and a
written record is text by definition. A photograph does not and cannot.
Submitted with nothing attached it is an artifact rather than a contribution,
and nobody downstream can read a claim out of it. `note` is the field for what
somebody says about the thing they are handing over, so that is where the
requirement lands rather than on `text`, which is the record itself when the
record is writing.

**You need to:**
- *content layer* — the submission form must require a caption when somebody
  attaches a photograph. It is one validation rule and it is worth showing the
  person why rather than only refusing.
- *intelligence layer* — nothing.
- *experience layer* — nothing. No fixture record changed; the one image in the
  fixture already carried a note.


## 2026-09-14 — a profile says whether anyone can prove it is theirs

**Affects:** intelligence layer · experience layer · content layer (additive)

**What:**

- `contributor` gains a required field, `verification`, which is `guest` or
  `verified`. Every profile in the fixtures is `guest`, and `verified` is not
  built this semester.
- `ContributorRegistered` gains an optional `verification`. Omitting it means
  `guest`, so the authored event log did not change.
- Every derived state now carries the field on each contributor. Ninety-two
  additions, no other value moved.

**Why:** guest ids are a way in rather than an end state, and the model had no
word for the difference. Without one, there is no way on the day verification
arrives to say that a verified person is a particular guest, and every
contribution made this year would be stranded. Adding the field later would mean
deciding retrospectively what all of it counted for. Adding it now costs one
enum.

Read the comment on the field before using it. It is a distinctness check, not a
credential. It asks whether this is one person once, which is the same question
`independentLineageCount` asks about families. It must never come to mean that a
verified person's claims are worth more because of who they are.

**Not included, on purpose:** any way to link two profiles. Merging a guest and a
verified profile that turn out to be the same person retroactively invalidates
corroboration the archive has already counted. That is written up in
`docs/DESIGN-QUESTIONS.md` under "A profile has no way to say whether anyone can
prove it is theirs", and nobody should build linking until it has an answer.

**You need to:**
- *intelligence layer* — nothing required. The field is available if you want it
  and it is not in `ScoringInput`. Read "Why the author is missing from
  `ScoringInput`" in your start guide before you reach for it.
- *experience layer* — nothing. Do not render it. A badge saying verified next
  to somebody's account of their own family is the thing this project avoids.
- *content layer* — nothing. Guest ids work exactly as before.


## 2026-09-14 — one word for each thing

**Affects:** experience layer · intelligence layer · content layer

**What:**

- "Account" is not a term in this project any more. If you find it standing for
  either a contribution or a login, that is a leftover. A **record** is what
  somebody hands over. A **claim** is somebody's reading of a record. A
  **profile** is who a contributor is to the software, which this semester is a
  guest id kept in browser storage. A definition block covering those three,
  plus **site** and **rendering**, now opens the root README and both start
  guides.
- The event kind `account_submitted` is now `claim_submitted`, and the interface
  `AccountSubmitted` is now `ClaimSubmitted`. That event carries a `claimId` and
  the reducer writes it into `claims`, so the old name described the wrong thing
  and did not match its siblings `claim_extended` and `claim_disputed`. No field
  on the event changed.
- The acceptance case `account-outside-the-graph` is now
  `claim-outside-the-graph`.
- Two state labels changed in `packages/fixtures/states`, because labels are
  authored in the event log and the fold copies them through. "Single account,
  no corroboration" is now "Single claim, no corroboration", and "Family
  corroboration and an untranslated account" is now "Family corroboration and
  an untranslated claim". Nothing else in any state moved. No claim, record,
  score, edge, or weight changed.

**Why:** `docs/START-CONTENT-LAYER.md` used "account" for a contribution on one
line and for a login twenty lines later. It said "there are no user accounts and
you should not build any" a few paragraphs before asking "what accounts are
within two kilometres of this building". Anybody reading it carefully would come
away with two meanings for the same word, and no way to tell which was intended.
The word was also a leftover from an earlier framing of this project as an oral
history archive, and it sits badly on a photograph or a deed.

**You need to:**
- *experience layer* — nothing, unless you render a state's `label`. Two of
  them changed wording and no data moved.
- *intelligence layer* — nothing. The scoring rules and their inputs are
  unchanged.
- *content layer* — nothing in code. If you have drafted stories or a plan that
  uses the word "account", check which of those words each one meant.


## 2026-09-08 — scoring rules and the intelligence layer's guide

**Affects:** intelligence layer

**What:**

- New guide, `docs/START-INTELLIGENCE-LAYER.md`. What to read, what to ignore,
  what to install, and the first task.
- `apps/graph-api` now runs tests. There is a `src/scorer.test.ts` with an empty
  scorer and the rules running against it, so `pnpm test` produces failures you
  can work against rather than a configuration problem.
- The scoring rules went from sixteen to ten. Six that asserted on
  `independentLineageCount` were removed, because a family is not something this
  system can currently observe. `lineageId` is hand-authored, nothing derives it,
  and there are no profiles to attach it to. The question moved into the "what
  these rules do not cover" block, which is where open problems belong.
- The remaining ten are prefixed `required` or `open to argument`. Required
  means this project will not merge a scorer that fails one. Open to argument
  means it is a position the sponsor holds and wrote down so it is checkable, and
  disagreeing is a check-in conversation.

**Why:** The suite was over-specified. It constrained the shape of the input as
well as the behaviour of the output, which meant a team designing independence
differently would have been fighting the tests rather than the problem. The
algorithm is the intelligence layer's deliverable and the rules should be a floor
rather than a design.

**You need to:**

- *intelligence layer* — read `docs/START-INTELLIGENCE-LAYER.md`. If you had
  already started against the sixteen rules, six of them are gone and the reason
  is in the file.
- *content layer* — nothing.
- *experience layer* — nothing.

---

## 2026-09-08 — repo change, no contract movement

**Affects:** every layer, but only if you have already run `pnpm db:up`

**What:** Each layer now has its own database, its own container and its own
`docker-compose.yml`, sitting next to the app that owns it.

| Layer | Where | Port | Database |
|---|---|---|---|
| Content | `apps/capture-api` | 5433 | `sagas_content` |
| Intelligence | `apps/graph-api` | 5434 | `sagas_intelligence` |
| Experience | `apps/ui-api` | 5435 | `sagas_read` |

The commands are unchanged, but they run from your app's directory rather than
the repository root. Object storage moved into the content layer's compose file,
so the other two layers never start it. The root `docker-compose.yml` is gone.

**Why:** The documentation already said each layer has its own database and the
scaffold only ever made one, so nothing enforced it. Sharing also meant object
storage sat behind a compose profile purely because one team needed it and two
did not, and both start guides spent a paragraph telling people which parts were
not theirs. One team's setup will grow over the semester and two will not, which
is the case where sharing costs the most.

**You need to:** If you have not started a database yet, nothing. If you have,
`cd` into your app, run `pnpm db:reset`, then `pnpm db:up`, and update
`DATABASE_URL` in your `.env` to the line for your layer.

---

## 2026-09-07 — repo change, no contract movement

**Affects:** content layer

**What:** `apps/capture-api` is set up so that nothing stands between you and
writing an endpoint.

- Express 5 and `pg` added, with `dev`, `start` and `migrate` scripts.
- `src/db.ts` holds a shared connection pool.
- `scripts/migrate.ts` applies numbered SQL files from `migrations/` in order,
  once each, inside a transaction, recording what it applied. Small enough to
  read.
- `src/index.ts` is a placeholder describing the shape of the first endpoint.
- The README covers the three decisions now made: Express 5, `pg` with SQL
  written out, and numbered migration files.

The endpoint itself and the first migration are not here. Those are yours.

**Why:** Choosing between server frameworks is a week of research that produces
a decision nobody on a first project is equipped to make, and configuration is
not the interesting part. The parts that are interesting stay yours.

**You need to:**

- *content layer* — `pnpm install`. Then read `src/index.ts`, which describes
  what to build.
- *intelligence layer* — nothing.
- *experience layer* — nothing.

---

## 2026-09-04 — repo change, no contract movement

**Affects:** content layer · everyone, lightly

**What:**

- New app, `apps/capture-web`, the contributing interface. It ships empty with a
  README, and the framework choice belongs to the content team.
- New guide, `docs/START-CONTENT-LAYER.md`, covering what to read, what to
  ignore, what to install, the first task, and how the months are shaped.
- `apps/capture-api/README.md` gains a "This semester" section: ordering, table
  ownership, no authentication, no hosting, how translation works.
- Editor config committed. `.vscode/extensions.json` recommends the extensions
  this repo expects; `.vscode/settings.json` turns on format-on-save and points
  TypeScript at the workspace version.
- `docs/DESIGN-QUESTIONS.md`. Part 3 is now "Open by design" and Part 4 is "Not
  for this project to answer". Four new entries on inherited trust, reference
  edges, the split between a person as record subject and as platform profile,
  and naming people who can't consent.
- Root README notes the licence and how contributions are credited.

**Why:** The content team started, and the repo had a domain description without
an ordering. Everything here is about making the first week smaller.

**You need to:**

- *content layer* — read `docs/START-CONTENT-LAYER.md`. It replaces guessing.
- *intelligence layer* — nothing yet. Your equivalent guide is coming.
- *experience layer* — nothing yet.

---

## v1.0.0 — unreleased

**Affects:** all layers. This is the starting point.

**What:** Initial contract, covering all three layers.

Claim graph: sites, contributors, claims with typed addressable elements,
dispute / extension / reference edges, affirmations, passover signals,
translations.

Content capture: records, media references with processing state and
derivatives, transcripts, captured location with the method that produced it,
and flags. A record is a bundle rather than a file type, and every claim points
at the record it was read out of.

Intelligence input: every derived state carries what each contributor has
actually done, as counts and never as a score, and every claim carries the
record it was read out of.

Anduiza fixture: 64 authored contribution events, four derived states, nine
records. Twenty acceptance criteria covering granular disputes, corroboration
independence, untranslated claims, coexisting renderings, one record producing
several claims, media still processing, an embedded location that contradicts
the place, an open flag on a published record, and a contributor who has
authored nothing and is one of the most useful people in the record.

No period field on a claim. What somebody said about time is kept in their
words, on date elements, and `datedClaims` in the integrity score counts how
much of a record is anchored in time from those rather than from a bucket
chosen at entry.

**Why:** Written by the sponsor in August 2026, before any team existed and
before anyone from the Basque community had reviewed it. Expect it to be wrong
in at least one interesting way. `packages/fixtures/README.md` carries a list of
known gaps, and closing one is a welcome PR.

**You need to:** Nothing. This is the first one.
