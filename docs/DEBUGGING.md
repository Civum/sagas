# When the tooling lies to you

Most bugs tell you about themselves. These do not. Every one below has cost
somebody on this project real time, including us.

---

## Turbo told us everything passed. It had not.

Real example from building this repo. `pnpm lint` reported three green tasks.
One of them was a cached result from before the change that broke it, and a
genuine error went unreported. We told the sponsor everything passed. It did
not.

Turbo caches by hashing a task's inputs. When it decides nothing relevant
changed, it replays the previous output — including the previous *success* —
without running anything.

**`FULL TURBO` in the output means nothing ran.** That is the moment to be
suspicious, not reassured.

```bash
pnpm lint                    # may be replaying old results
pnpm lint -- --force         # actually run it
```

When a result surprises you, force it before believing it. Especially before
telling somebody else that it passed.

### ESLint has its own cache underneath

Turbo is not the only layer. ESLint caches per-file in `.cache/.eslintcache`,
so a file you did not touch is not re-linted even when a change elsewhere
made it newly wrong. Changing a type in `packages/contracts` can make code in
`packages/fixtures` invalid without that file changing at all.

```bash
rm -rf packages/*/.cache apps/*/.cache
pnpm lint
```

This is exactly the bug in the story above.

### A green check that verifies nothing

Worse than a stale pass: a task that does not exist.

`turbo run lint` on a package with no `lint` script does nothing and exits
zero. Turbo reports success. CI goes green. Nothing was checked.

We shipped that for a while — no package had a `lint` script, so `pnpm lint`
found zero tasks, exited zero, and CI displayed a passing check that verified
nothing. When it was wired up properly it found 28 real errors.

**If you add a folder of tests or a new package, add the script and add it to
the config.** A test file nobody runs is worse than no test file, because it
looks like coverage.

The same trap caught us with Vitest: `vitest.config.ts` has an `include` list,
and a new `behaviour/` folder full of tests silently never ran until it was
added there.

### When Turbo is behaving strangely

```bash
rm -rf .turbo packages/*/.turbo apps/*/.turbo
```

Then run again. If that fixes it, the cache was the problem and the underlying
code is fine.

---

## Next

### Your new environment variable does nothing

Next reads `.env` at startup. Adding a value while the dev server is running
does nothing at all, and the symptom is a feature that is silently switched off.

Restart the dev server. Every time you touch `.env`.

### `NEXT_PUBLIC_` is not a naming convention

A variable without that prefix is server-only and is `undefined` in the
browser. One with it is compiled into the client bundle and is visible to
anyone who opens devtools.

That is why the Mapbox token is `NEXT_PUBLIC_MAPBOX_TOKEN` — it has to reach the
browser. It is also why you must never prefix anything you would mind a stranger
reading.

### `params` is a Promise now

In Next 15, route parameters arrive as a Promise. The error is confusing if you
have not seen it.

```ts
// Next 14
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

// Next 15
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
```

### "You're importing a component that needs useState"

Components are server components by default. They run on the server, they can
read the database directly, and they cannot use hooks, browser APIs, or event
handlers.

Add `'use client'` at the top of a file that needs those. Add it as far down the
tree as you can: everything a client component imports becomes client code too,
so putting it at the top of a page pulls the whole page into the browser bundle.

Mapbox needs `window`, so anything touching it is a client component.

### Hydration mismatch

The server rendered one thing and the browser rendered another. Almost always
one of: `Date.now()` or `new Date()` in render, `Math.random()`, or reading
`window` or `localStorage` during the first render.

### The build is strange in a way that makes no sense

```bash
rm -rf apps/web/.next
pnpm dev:web
```

---

## Workspace

### CI failed at the install step and nothing else ran

The lockfile is out of sync with a package.json.

CI installs with `CI=true`, which makes `pnpm install` behave as
`--frozen-lockfile`. If a dependency changed and `pnpm-lock.yaml` did not, the
install fails in about thirteen seconds and every check after it is skipped. The
job goes red without a single test having run.

It looks fine locally, because your `node_modules` is already correct.

```bash
pnpm install
git add pnpm-lock.yaml
```

There is a pre-commit hook that catches this, in `.githooks/pre-commit`. It is
enabled automatically by `pnpm install`. It compares the dependency maps before
and after, so renaming a script or editing a description will not stop you —
only an actual dependency change without the lockfile. `git commit --no-verify`
skips it either way.

This one bit us, which is why both the hook and this entry exist.

### An import of a package in this repo will not resolve

Run `pnpm install` from the repo root, not from inside a package. Workspace
links are created at the root, and this is the most common failure after adding
a package or pulling a change that added one.

### A workspace package's changes are not showing up

Packages here ship TypeScript source rather than build output, so `apps/web`
lists them in `transpilePackages` in `next.config.mjs`. A new shared package
that is not in that list will fail at runtime in a way that looks like a module
resolution bug.

---

## The general shape of it

All of these are one mistake: **believing a tool that was not asked to check.**

A cached pass, a script that does not exist, a config that excludes the file, an
environment variable read before you set it. None of them fail loudly, because
from the tool's point of view nothing went wrong.

When a result surprises you — good or bad — force the tool to do the work again
before you build on it.
