# Landing page

A small public page for Sagas (backlog story **P3**). Static HTML and one CSS
file, with no JavaScript sent to the browser.

**Status: draft.** The page follows the Design wireframe
(`LANDING-PAGE-WIREFRAME.md`) and uses the draft copy from
`LANDING-PAGE-COPY.md` (story De2). The copy is not approved, a banner says so,
and nothing is deployed. Deploying waits on the hosting proposal (P2) and the
sponsor's approval of the copy.

## Run it

```bash
pnpm --filter @sagas/landing preview   # builds, then serves http://localhost:4321
pnpm --filter @sagas/landing build     # writes dist/index.html and dist/styles.css
pnpm --filter @sagas/landing test
```

## Where things live

| File | What it holds | Who changes it |
|---|---|---|
| `src/content.ts` | The page's words: the page copy from `LANDING-PAGE-COPY.md`, plus a link-preview description (a Platform addition, reviewed with the copy) | Platform, after Design changes the copy document |
| `src/model.ts` | The shape of the content | Platform |
| `src/render.ts` | Layout and markup | Platform |
| `src/approval.ts` | The copy fingerprint and the release guard | Platform |
| `src/tokens.css` | Colour and spacing values (**temporary**, until De1) | Design decides, Platform implements |

Words and layout are kept apart, so changing the wording never requires a
layout change. `content.ts` is still code, so a wording change is a small pull
request, and a new kind of section needs layout work too.

## How copy gets onto the page

1. Design writes or changes the copy in `LANDING-PAGE-COPY.md`, the source of
   truth.
2. Platform copies that text into `src/content.ts`.
3. The sponsor approves the copy, as rendered, in the "Questions for the
   sponsor" issue.
4. Platform sets `status: 'approved'` and records the approval's link, its
   date, and the copy's fingerprint (`pnpm --filter @sagas/landing copy-hash`).

If any word changes after that, the fingerprint no longer matches: the tests
fail and a release build refuses to run until the new wording is approved.

## What the tests check

- **No known organisation is named.** This is a safety net for slips, not a
  consent check. For this release the rule is simply to name none.
- **A draft looks like a draft:** visible banner, and `noindex` so search engines
  skip it.
- **Invented material is labelled** in visible text, with the labels from the
  copy document ("Illustrative example — invented for this draft", and so on).
- **On-page links point at sections that exist.**
- **Accessibility basics:** `lang`, one `h1`, no skipped heading levels, a skip
  link, and WCAG 2.1 AA contrast for every text colour on its background. The
  tests also check that every link carries a focus style; whether focus is
  actually visible, keyboard use, and the phone layout are checked in a browser
  before approval.
- **Scores, rankings and agreement counts** (the model's rules) are not
  something a test can reliably catch in prose. They are part of the copy
  review.
- **The build works.** CI runs tests but not builds, so a test runs the real build.
- **A draft can't be released.** `build --release`, which the deploy uses,
  refuses unless the copy is approved and unchanged since approval.
