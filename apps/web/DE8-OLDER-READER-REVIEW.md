# De8 older-reader review

**Status:** Review record drafted; outside-team usability session pending.

**Story:** De8 — Readable for an older reader

## Acceptance criteria

De8 is complete when the team has documented what it checked and changed, and
one person outside the team who is over sixty has tried the landing page while
the team watched. This record covers the first part. It does not claim that the
second part happened.

## What was checked

### Type and reading distance

- Landing-page body copy uses a large reading size and relaxed line height.
- Section headings use a consistent serif treatment and are limited in width so
  lines do not become difficult to track.
- The hero headline wraps at a short measure on small screens.
- De7 examples keep long names readable by wrapping instead of truncating them.
- Labels such as “How it works,” “Why Sagas exists,” and “Where Sagas stands”
  describe their destination or purpose in plain language.

### Contrast and focus

- The landing token tests check normal text/background pairs against WCAG 2.1
  AA contrast requirements.
- Links and buttons have visible keyboard focus treatment through the shared
  focus-ring classes.
- Invented material is labelled in visible text, not by colour alone.

### Touch targets and orientation

- The primary “Why Sagas exists” action has a padded target suitable for touch.
- The navigation link now uses an inline-flex layout with a minimum 44px height;
  its label remains visibly separate from surrounding text at phone widths.
- The skip link provides keyboard orientation before the page content.
- The map/list direction in De7 keeps the list available as the readable route
  for people who cannot use a map.

## Changes made or required

- Kept the landing page's plain-language section labels and visible invented
  example label.
- Kept De7's long-name examples as wrapping layouts rather than ellipses.
- Kept source and contributor labels explicit in the De7 sketches.
- The navigation link's touch target was increased to the 44px starting target
  recommended for this older-reader review. The physical-phone check remains
  part of the external usability session.
- De7 uses the same tested token names; map-pin and site-list tap sizes will be
  checked when M1 implements those components.

## External usability session

**Pending.** A person outside the team who is over sixty must try the landing
page while a team member observes. Record the date, device, tasks attempted,
where the person hesitated, and the resulting changes here before marking De8
complete. Do not record the person's name or any personal information.

## Current status

**In review**, not done. The written inspection is complete; the required
external session and any changes it identifies remain outstanding.
