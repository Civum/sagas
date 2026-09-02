# Git, for this repo specifically

This is not a git tutorial. There are thousands of those and they are better
than anything we would write. This covers the parts a tutorial cannot tell you,
because they are about this project's shape: three universities, three forks,
one shared contract, and no shared branch between any of them.

Two things here will catch you out if you have only ever used git on a repository
you own. Your fork does not update itself, and the only route to another team is
through upstream.

---

## The shape of it

There is one upstream repository, `Civum/sagas`. Each team forks it into its own
GitHub organisation. All of your work happens in your fork, and your fork is
what gets graded.

```
Civum/sagas                     upstream, sponsor-owned
   └── YourOrg/sagas            your fork, where you work
          └── your laptop       your clone
```

Two consequences worth understanding before week three.

**Your fork does not update itself.** Upstream can change and nothing happens to
you until you decide it should. That is deliberate. Nothing shifts under you
mid-sprint.

**Upstream changes are available, never imposed.** The contract moves on Mondays
and only Mondays, it is announced at a check-in before it lands, and pulling it
forward is a decision you make together at a check-in. See "When the contract
changes" in the root README for the rules; this file is how to carry them out.

---

## How work reaches the other two schools

You cannot see their repositories and they cannot see yours. There is no shared
branch, no shared database, and no way to pull a change directly from another
team. Every path between the three schools runs through upstream:

```
YourOrg/sagas  ──PR──▶  Civum/sagas  ──Monday──▶  TheirOrg/sagas
                                                  (when they choose to pull)
```

Four things follow from that, and they are the whole reason this project is
organised the way it is.

**A change another layer needs is a pull request, not a message.** If the
content layer works out that dialect has to be captured at contribution time,
telling the experience team at a check-in does not change their code. The
contract change does. Conversation decides it; the pull request delivers it.

**It takes weeks, not days.** Open a PR, we review it, it lands on a Monday, and
the other teams pull it when they decide to at a check-in. Two to three weeks
from idea to it being in somebody else's build is normal and it is not
bureaucracy, it is the cost of nobody's work moving under them mid-sprint. Plan
around it. If you know in week four that you will need something in week nine,
raise it in week four.

**Nobody is ever blocked waiting for it.** That is what the fixtures are for.
Every team builds against the same sponsor-maintained data, so the experience
layer can render disputes that the intelligence layer has not implemented and
the content layer can build submission for a graph nobody is scoring yet. If you
find yourself waiting on another school, something has gone wrong with the
design and we want to hear about it.

**You will disagree with another team's model and that is useful.** The point of
three schools on one contract is that the intelligence layer hits a problem the
experience layer then works around, and the changelog says so. Entries name
layers rather than universities for exactly this reason.

## Two kinds of review, and they are not the same

This trips people up because both involve pull requests.

**Review of your work happens in your own repository.** You open a pull request
inside your fork, teammate to teammate, and the sponsor reads and comments on it
there. Nothing merges into `Civum/sagas`. Your CI runs on your own code, which
is where it is useful.

That is what a check-in is reviewing, and it is what you are graded on.

**A contribution to the scaffold is a separate, deliberate act.** Rare, small,
and reasoned: a contract change, a fixture gap you closed, a correction to these
docs. Maybe a handful across a semester.

If you find yourself cherry-picking commits into a pull request against upstream
so that somebody can look at your week's work, stop. That is the first kind of
review going through the second kind of channel, and it will give you merge
conflicts, an upstream branch nobody wants to merge, and a review that arrives
late.

### The sponsor needs to be able to see your repository

Forks of a public repository are public, so if you forked normally, reading and
commenting works with no setup at all.

If your team created a private repository instead of forking, nobody outside it
can review anything. Add the sponsor as a collaborator in week one, before it is
the reason a check-in is useless.

Either way, add them to your organisation if you want them to see CI logs when a
build fails, or for an approval on a pull request to count towards branch
protection. Neither is required to read your code and leave comments; both are
worth ten minutes.

## Who owns which files

| Path | Change it in your fork? | How to change it for everyone |
|---|---|---|
| Your layer's apps and packages | Freely. They're yours. | Nothing to do. |
| Another layer's app | **No.** You will never need to. | Raise it at a check-in. |
| `packages/contracts` | **No.** | PR upstream, raise at a check-in first. |
| `packages/fixtures` | **No.** | PR upstream. Closing a known gap is welcome. |
| `docs/`, `README.md`, `SETUP.md` | Corrections, yes | PR upstream. Setup problems you hit are ones everyone hits. |
| `tooling/`, root `package.json`, `docker-compose.yml` | Yes, but it costs you | PR upstream, or carry the conflict on every pull. |

That last row is the one to think about. Nothing stops you changing shared
tooling in your fork, and nothing will break immediately. What happens is that
every future upstream pull conflicts on the same file, forever, and by week ten
somebody is resolving the same conflict for the fifth time. If a change to
shared tooling is worth making, it is worth sending upstream so it stops being
your problem.

## Once, after you fork

**Add upstream as a remote.** Your clone knows about your fork. It does not know
about ours until you tell it.

```bash
git remote add upstream https://github.com/Civum/sagas.git
git remote -v          # origin = your fork, upstream = ours
```

`origin` is yours and you push to it. `upstream` is ours and you only ever fetch
from it.

**Turn on Actions.** GitHub disables workflows on new forks. Open the Actions tab
in your fork and click through the confirmation. Without this, the Monday
contract watch never runs and you will not hear when the contract moves.

**Give the sponsor access.** If you forked a public repository, this is already
done and there is nothing to do. If your team made a private repository, add
them now. See "Two kinds of review" above for why this bites in week two rather
than week one.

**Note which version you are on.**

```bash
cat packages/contracts/src/version.ts
```

That number is your pin. It does not change on its own.

---

## Finding out that upstream moved

You do not have to remember to check. `.github/workflows/upstream-contract-watch.yml`
runs every Monday morning, compares your contract version against ours, and opens
an issue in your fork if they differ, with the changelog in it.

Nothing in your fork changes. You just find out.

If you want to check by hand:

```bash
git fetch upstream --tags
git log --oneline HEAD..upstream/main    # what we have that you don't
```

---

## Pulling upstream forward

**Do this deliberately, at a check-in, not on a Monday morning reflex.** Pulling
every week puts you back on a moving target, which is the thing being pinned was
supposed to prevent. Skipping a version is often the right call.

When you have decided to:

```bash
git checkout main
git pull origin main                   # make sure your main is current
git fetch upstream --tags
git merge upstream/main                # or the specific tag you agreed on
```

Merge, do not rebase. Rebasing rewrites history that your teammates have already
pulled, and on a shared `main` that is how a team loses an afternoon.

Then, before you trust it:

```bash
pnpm install                           # dependencies may have moved
pnpm fixtures:build                    # regenerate derived states
pnpm lint && pnpm typecheck && pnpm test
```

If `fixtures:build` produces a diff in `packages/fixtures/states/`, that is
expected after a contract change and the regenerated files should be committed.
CI checks that the committed states match what the log produces, so a stale
state file fails the build.

### If the merge conflicts

Conflicts in `packages/contracts` or `packages/fixtures` mean somebody on your
team edited sponsor-owned files. Take ours:

```bash
git checkout --theirs packages/contracts packages/fixtures
```

Then work out why the edit happened, because it is usually a real need that
should have been a pull request to us. Bring it to the check-in.

Conflicts anywhere else are ordinary conflicts in your own work.

---

## Sending something back to us

Contributions upstream are welcome and reviewed. A pull request that fixes a
design question, closes a fixture gap, or corrects something we got wrong is
part of the point of the project, not an imposition.

```bash
git checkout -b fix/whatever-it-is     # branch in YOUR fork
# ... work, commit ...
git push origin fix/whatever-it-is
```

Then open the pull request on GitHub with the base set to `Civum/sagas` and the
compare set to your branch.

**Keep it small and open it early as a draft.** We would rather look at the shape
at twenty percent and say "not that direction" than review eight hundred lines
and ask you to redo it. If a pull request takes more than about fifteen minutes
to read, it is probably two pull requests.

**Say why in the description.** For a change to the model, the reasoning matters
more than the diff. "A translator pointed out that dialect cannot be recovered
from text after the fact, so it has to be captured at contribution time" tells us
something the diff never will.

---

## Working inside your own team

How you run branches is your team's call and part of what you are graded on. We
are not going to prescribe a workflow. What follows is the set of things that
actually go wrong when five to seven people share one repository for a semester,
which is a different problem from anything you have hit on a solo project.

### The one that costs the most: long-lived branches

A branch that lives for three weeks is the single biggest source of pain in a
team project. The longer it lives, the further it drifts, and the conflict when
it lands is not one conflict but every conflict at once, in code you wrote a
fortnight ago and no longer remember.

```bash
git checkout main && git pull
git checkout your-branch
git merge main            # do this most days, not at the end
```

Merging main into your branch often means you meet conflicts one or two at a
time, while the change is still fresh. It feels like more work and it is much
less.

### Feature folders exist so you stop colliding

`src/features/<feature>/` is not an aesthetic choice. With five to seven people
each owning a few features, a directory per feature means two people editing
different things are editing different files, and git never has to guess.

Where collisions still happen is the shared edges: `src/components/ui/`,
`src/lib/`, route files that compose several features. Those are worth a word in
your team channel before you start, not because it is a rule but because it is
cheaper than the merge.

### Three files never to hand-merge

**`pnpm-lock.yaml`.** Never resolve this by picking lines. It is generated, it is
enormous, and a hand-merged lockfile installs something nobody has tested.

```bash
git checkout --ours pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
```

**`packages/fixtures/states/*.json`.** Also generated. Regenerate rather than
resolve:

```bash
pnpm fixtures:build
git add packages/fixtures/states
```

CI checks that these match what the event log produces, so a hand-edited state
file fails the build even if the conflict markers are gone.

**`.env`.** It should never be in a conflict because it should never be
committed. If it is, that is the thing to fix.

### Review each other before you send anything to us

Open pull requests inside your own fork, team member to team member. A capstone
team that reviews its own work catches most problems days before a sponsor
check-in would, and it is the habit the course is actually trying to teach you.

The same rule we use applies to you: small and early beats large and finished.

### The pre-commit hook

There is one, in `.githooks/pre-commit`, and `pnpm install` turns it on for you.
No husky, no dependency, and you can read it.

It checks a single thing: whether you are committing a *dependency* change
without the lockfile. That combination fails CI at the install step before any
check runs, which is a confusing way to go red.

It compares the dependency maps rather than the whole file, so editing a script
or a description will not trigger it. `git commit --no-verify` skips it if it
ever gets something wrong.

### Two things not to commit

**`.env`.** It's gitignored. If a token does get committed, rotate it rather than
deleting the commit, because it is already in the history and in every clone
anybody has pulled.

**`node_modules` or `.next`.** Also gitignored. If your diff is four thousand
files, stop and look at what you staged.

---

## When it has gone wrong

**"I committed to main and I meant to branch."** Nothing is lost.

```bash
git branch my-work                 # save the commits on a new branch
git reset --hard origin/main       # put main back
git checkout my-work
```

**"I have a merge in progress and I want out."**

```bash
git merge --abort
```

**"I pulled upstream and now nothing builds."** Usually dependencies.

```bash
pnpm install
```

Then `pnpm lint && pnpm typecheck && pnpm test` to find out what actually broke.
If it is the contract, that is a conversation rather than a thing to fix
yourself. Say so at the check-in.

**"I have lost work."** Probably not.

```bash
git reflog
```

Every commit you have made is in there for weeks, including ones on branches you
deleted. Find the hash and `git checkout` it.

---

## What not to do

**Do not force push to a shared branch.** `--force` on `main` will delete
somebody else's work and there is no undo they will find easily.

**Do not edit `packages/contracts` or `packages/fixtures` in your fork.** They
are sponsor-owned, and a local edit turns every future upstream pull into a
conflict. If something in there is wrong, and it will be, open a pull request or
raise it at a check-in. That is a contribution and we want it.
