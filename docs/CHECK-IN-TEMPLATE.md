# Check-in note

Copy this into a new file for each check-in. Your team fills the top before the
meeting. We fill the bottom after it.

Keep it short. A note that takes forty minutes to write stops getting written
around week five, and then nobody has a record of anything. Ten minutes is the
target.

The assumptions section is the most valuable part. It is regularly where
contract changes come from.

---

```
# Check-in — <team> — <date>

## Before the meeting (your team writes this)

**What we built**
-

**What we're unsure about**
-

**What we assumed**
Things we took as true that nobody actually told us.
-

**What we want from this meeting**
Questions, decisions we need, things we're blocked on.
-

**Contract version we're on**
(from packages/contracts/src/version.ts)


## After the meeting (sponsor writes this)

**Decided**
-

**Open, and who is thinking about it**
-

**Changing in the contract, and why**
-

**Next check-in**
```

---

## First check-in only

Nothing is built yet, so the first note is about how you read the project rather
than what you made. Write this **before** we talk, so it isn't shaped by
anything we say in the room.

```
**What we think this project is, in our own words**


**Which design question interests us most**
(docs/DESIGN-QUESTIONS.md)


**What we assumed that the documentation never actually says**


**What we'd each like to own**
```

That third one is the one we care about most. It tells us where the
documentation failed, from people reading it cold, which is a test we cannot run
ourselves.

## Where to keep these

In your fork, in a folder of your choosing. They are your record, not a
deliverable to us, and nobody is grading the formatting.

Bring the link to the meeting.
