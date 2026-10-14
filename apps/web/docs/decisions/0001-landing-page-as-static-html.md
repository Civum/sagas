# 0001 · The landing page is static HTML, separate from the Next.js app

**Date:** 14 October 2026 · **Workstream:** Platform · **Story:** P3 (#6)
**Status:** Decided by the team. The sponsor can push back; work carries on
meanwhile (statement of work, "Who decides what").

## What was decided

The landing page is its own small app, `apps/landing`. A build script turns the
copy into one HTML file and one CSS file. No JavaScript is sent to the browser.
It uses the same TypeScript, lint and Tailwind configuration as `apps/web`, so
both apps share one set of design tokens once Design settles them (De1).

It is published to the `sagas-landing` Worker on `sagasproject.org` as static
assets, by the team's pipeline only.

## What else was considered

- **A route inside `apps/web` (Next.js).** One app to run, but the landing page
  would ship with the reading product's framework and dependencies, and could
  only go live once the full app builds and deploys. Where the full app runs is
  a later proposal, with costs.
- **A Next.js static export in its own app.** It would let the page share React
  components with `apps/web` later. It brings React and Next.js to a page with
  no interactive parts.
- **Vite.** A fast development server, but one more tool for a page a short
  script can build.

## Why

- **It matches the hosting the sponsor set up.** The landing page runs on
  Cloudflare Workers Free as static assets, and the deploy token can only edit
  Workers ("Deploying it" in `apps/web/README.md`). Static files are served free
  with no request limit. Server-rendered pages would run code on every visit,
  which the free plan caps at 100,000 requests a day and 10 ms of CPU each.
- **It can go live now,** independently of the reading product.
- **It is one page with no interactive parts.** Plain HTML loads fast on a phone
  and leaves nothing to keep up to date.
- **The words sit in one file and the layout in another,** so Design's copy can
  change without touching layout, and tests can check the copy against the
  model's rules before anything is published.

## What would change it

If the landing page needs interactive parts, or should share components with the
reading product, move it into `apps/web` or a Next.js static export, as part of
the full-app hosting proposal. Its words and tests carry over unchanged.
