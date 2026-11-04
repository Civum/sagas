# 0002 · The full app opens on the map

**Date:** 3 November 2026 · **Workstream:** Design · **Story:** De10
**Status:** Proposed; team review pending. Sam should review this entry-screen decision.

## Decision

The full app should open directly on the map and its paired site list rather
than add a separate home page first.

The first screen should include a short orientation sentence, a clear place
search or map-area action, and the list view alongside or available immediately
below the map. The list is a first-class reading path, not a fallback for people
who cannot use the map.

The first screen depends on M1 (map and list). M2 (search by name and map area)
is later work that should extend the same entry screen rather than introduce a
separate home page.

## Why

- The product's first job is helping somebody find a meaningful place and read
  what people know about it. A separate home page adds a step before that job.
- A map with a list gives a new or older reader an immediate explanation of
  what to do: choose a place, then read its story.
- The list supports keyboard and screen-reader users from the first screen.
- The existing fixtures and De7 component designs already describe the map pin,
  site list item, and narrative transition needed for this entry point.
- A short orientation sentence preserves the welcoming function of a home page
  without introducing a second navigation concept.

## Alternatives considered

### Separate home page first

This would provide more room for explanation and featured places, but it adds a
decision before the reader can reach the map and creates another page whose
content would need sponsor approval and maintenance.

### Straight to a map without orientation

This is fast, but it risks making the product unclear to a first-time or older
reader. The proposed orientation sentence and explicit list avoid that problem.

## Boundaries

- No scores, rankings, agreement counts, or winner treatment appear on the
  entry screen.
- Thin records remain readable and are not labelled as failures.
- Place, record, claim, detail, and contributor labels follow the project
  vocabulary.
- This is a design decision, not an implementation claim.
- The orientation sentence is public copy. It requires sponsor approval before
  it is added to the landing page or other public entry point, under the
  statement of work's sponsor-approval rule.

## Review status

**Awaiting team review.** The team should confirm the map-first entry point,
orientation sentence, and relationship between the map and list before De10 is
marked done.
