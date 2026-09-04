# apps/capture-web — the contributing interface

Yours. It ships empty on purpose, same as `apps/capture-api`.

This is the screen somebody is looking at when they hand over something that
matters to them. Recording an account, uploading a photograph, typing up what
their grandmother said, adding a translation to somebody else's.

It is separate from `apps/web` on purpose. That app is the reading experience
and belongs to another team. Reading and contributing are different problems,
with different users in different states of mind, and merging them means two
teams editing the same files.

## Why this exists

Because you can't put a REST API in front of a person. The reason this layer is
at Boise State is that you can walk to the community this is being built with
and watch somebody actually use it — see where they hesitate, what they don't understand, what they
decide not to say. None of that is visible from a test suite.

## What goes here, roughly

- Recording audio in the browser, with playback before submitting
- Choosing photographs and documents, and uploading them
- The submission form: what happened, where, who said so, in what language
- Attaching an account to a place on a map
- Adding a translation or a transcript to somebody else's record
- Reporting something, with the reason attached

## Framework is your call

There is a placeholder in `src/index.ts` and nothing else. `apps/web` is Next,
but you are not obliged to match it and there are decent arguments for something
lighter. Pick, write down why in this README, and move on. It is not worth a
week.

To turn it into a real app: add your dependencies, add `dev` and `start`
scripts so `pnpm dev` picks it up, add a `test` script so CI runs it, then
`pnpm install` from the repo root.

## Identity

There isn't any, and you should not build any.

A contributor is a **guest id** — generated on first visit, kept in browser
storage, sent with every request. No login, no password, no email. Somebody who
clears their browser is a new person, and that is an acceptable loss for now.

Accounts matter eventually and they are not this semester's problem. Whether a
guest can later claim what they contributed, and how anybody proves who they
are, are open questions written up in
[`docs/DESIGN-QUESTIONS.md`](../../docs/DESIGN-QUESTIONS.md).

## Language

Somebody contributing in a language other than English must be able to finish
and submit. Their record exists the moment they hand it over — pinned to the
place, attributed to them, visible on the map — with no English anywhere.

This is worth being precise about, because it is easy to build the version that
blocks. A record has no language requirement. A *claim* does, and claims are
another team's concern. So the interface never tells somebody their contribution
is incomplete because it is not in English. It is complete. Something further
downstream is waiting, and that is not their problem to solve.

See `apps/capture-api/README.md` for how translation gets proposed and confirmed.
