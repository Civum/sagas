# Working together

How the semester runs: when we meet, how pull requests get reviewed, and what
happens when the contract changes.

Read it once at the start. After that it is something to check rather than
something to remember.

### The rhythm

**Check-in, 30 minutes.** Weekly for the first month while scope is still being
worked out, then every other week once you know what you're building. Your
programme's exact day is set with your team.

**Office hours, 30 minutes, every week, right before the check-in.**
Less a meeting than a door left open. It runs if there's an agenda and is
cancelled if there isn't, so most weeks it won't happen. That's fine. It exists so
that "we're stuck" has somewhere to go that isn't an email at eleven at night.

**A short note before each check-in.** There is a template in
[`CHECK-IN-TEMPLATE.md`](./CHECK-IN-TEMPLATE.md), including a different version
for the first one, when nothing is built yet.

It covers what you built, what you're unsure about, and what you assumed. It also
doubles as the office-hours agenda: if the note has open questions in it we use
the slot, and if it doesn't we skip it.

**The assumptions are the most valuable part of that note.** They regularly
become contract changes. Writing down "we assumed X" is a normal engineering
artefact, not an admission, and it's how we find out a spec was unclear before
you've built two weeks on top of it.

**One in-person session** where geography allows, deliberately timed for around
week three or four, while design is still being locked and being in a room
together still changes the outcome.

### Pull requests

**PRs open by the stated cutoff get reviewed before that check-in.** Later ones
roll to the next cycle. That's not a penalty. It's so you can predict when feedback arrives instead of
pushing something rushed at 5:55pm.

**One PR per feature. Open it as a draft early.** We would rather see the shape at 20% and say
"not that direction" than read 800 lines and ask you to start again. If a PR takes more than about fifteen minutes to read, it is probably
two PRs.

This is the single biggest factor in how useful review is to you. Small, early,
frequent beats large, late, and finished.

### When the contract changes

`@sagas/contracts` and `@sagas/fixtures` are sponsor-owned, and they *will*
change during the semester. That is the point. A change here is how a discovery on one team, or a
conversation with someone in the community, reaches everyone else. Four rules make that safe:

1. **Changes land on Mondays and only on Mondays.** The contract cannot move
   mid-week. This is a constraint on us, not a release schedule. Expect three to
   five changes across a semester, not one a week.
2. **Nothing lands cold.** A significant change is raised at a check-in *before*
   it is built, then published the following Monday. You will hear "we might
   change X" before you see X change.
3. **Your fork is pinned to a tag.** A change is *available* to you, never
   imposed. Pulling forward is a decision made together at a check-in, not
   something that happens to you mid-sprint.

   **Awareness is weekly. Adoption is deliberate.** Don't pull every Monday. That
   puts you back on a moving target. Instead, `.github/workflows/upstream-contract-watch.yml`
   runs each Monday morning, compares your pinned contract version against
   upstream, and opens an issue with the changelog if they differ. Nothing in
   your fork changes; you just find out. **Enable Actions on your fork once
   after forking.** GitHub disables them by default, so open the Actions tab and
   click through the confirmation.
4. **Every change carries a version bump, a CHANGELOG entry, and its reason.**
   The reason matters more than the diff. "A translator pointed out that dialect
   can't be recovered from text after the fact, so it has to be captured at
   contribution time" tells you something the diff never will.

   There is **one** changelog, not one per school, and entries name *layers*
   rather than universities. Seeing that the intelligence team hit a problem the
   experience team is now working around is the entire reason the contract sits
   in the middle of three teams.

**Freeze windows.** The contract does not move after your team's design lock
(around week three) except to fix something genuinely broken, and it does not
move at all in the last three weeks of a semester. Anything learned during a
freeze goes into the notes and lands the following term. If a change arrives
outside these rules, that is a mistake on our side. Say so.

### Two standing expectations

**If you're blocked, route around it and flag it. Don't wait.** The scope is
parallelizable by design, and a week spent waiting is a week nobody gets back.
[`docs/GIT.md`](./GIT.md) explains how work actually moves between the three
forks, and why nothing you need from another team should ever stop you.

**Disagree with the design.** These scopes describe where the work looked like it
should go from where we were standing in August. The interesting problems here
are genuinely open, and students routinely see things sponsors don't. The goal is
good engineering, not obedience to an initial guess.

