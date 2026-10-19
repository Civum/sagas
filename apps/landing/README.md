# Landing page

A small public page for Sagas (backlog story **P3**). Static HTML and one CSS
file, with no JavaScript sent to the browser.

**Status: draft.** The page follows the Design wireframe
(`landing-page-wireframe.html`) and uses the draft copy from
`LANDING-PAGE-COPY.md` (story De2). The copy is not approved, a banner says so,
and nothing is published: until the sponsor approves the copy, each merge runs
the deploy as a dry run (see "Deploying" below).

## Run it

```bash
pnpm --filter @sagas/landing preview   # builds, then serves http://localhost:4321
pnpm --filter @sagas/landing build     # writes dist/index.html and dist/styles.css
pnpm --filter @sagas/landing test
pnpm --filter @sagas/landing exec wrangler deploy --dry-run   # after a build; publishes nothing
```

## Where things live

| File              | What it holds                                                                                                                              | Who changes it                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `src/content.ts`  | The page's words: the page copy from `LANDING-PAGE-COPY.md`, plus a link-preview description (a Platform addition, reviewed with the copy) | Platform, after Design changes the copy document |
| `src/model.ts`    | The shape of the content                                                                                                                   | Platform                                         |
| `src/render.ts`   | Layout and markup                                                                                                                          | Platform                                         |
| `src/approval.ts` | The copy fingerprint and the release guard                                                                                                 | Platform                                         |
| `src/tokens.css`  | Colour and spacing values (**temporary**, until De1)                                                                                       | Design decides, Platform implements              |

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

The fingerprint covers every word a visitor can see or hear: the copy, the
invented-material label shown beside the corner shop (`INVENTED_LABELS` in
`src/model.ts`), and the few words the layout adds, like "Skip to content"
(`FIXED_TEXT` in `src/model.ts`). If any of them changes after approval, the
fingerprint no longer matches: the tests fail and a release build refuses to
run until the new wording is approved.

Step 2 is a copy, not a live link: the page never reads the copy document. So
the tests compare the two **field by field**: each piece of text in
`content.ts` against the matching field in the copy document's "Draft page"
section (for example `nav.link.label` against "Navigation link"), ignoring
capitals and punctuation. CI fails, naming the field, if:

- a field differs between the two, including two fields swapped;
- the copy document gains a field the page doesn't use;
- a field the page uses disappears from the copy document.

The pairing lives in `fieldMap` in `src/copy-doc.ts`, which also lists the few
visible words that are deliberately not in the copy document, such as the
link-preview sentence. If Design restructures the document, update that map in
the same pull request. `turbo.json` here makes a change to the copy document
alone re-run these tests instead of reusing an old result.

## What the tests check

- **No known organisation is named,** except the sponsor's contact address
  (`info@civum.io`), which he asked for in the questions issue (#11). Only that
  exact address is allowed. This is a safety net for slips, not a consent check.
- **The words the sponsor asked us to avoid don't appear:** "account",
  "settled" and "reading product".
- **The page and the copy document match, field by field** (see "How copy gets
  onto the page"). The comparison itself is tested on a small fixed document,
  so those tests don't depend on today's wording.
- **Every field reaches its part of the page,** for both a draft and an
  approved page, down to each step's own list item, so a layout change can't
  silently drop, move or swap text.
- **Why comes before how:** the "Why Sagas exists" section sits above "How it
  works", as the sponsor's brief asks.
- **A draft looks like a draft:** visible banner, and `noindex` so search engines
  skip it.
- **Invented material is labelled** in visible text, with the labels from the
  copy document ("Illustrative worked example - invented for this draft", and
  so on). The corner shop caption carries its name and that label.
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

## Deploying

The page is served from Cloudflare Workers (free plan) as static files, on the
sponsor's account, at `sagasproject.org`. `www.sagasproject.org` redirects to it;
the sponsor set that up in Cloudflare. Only the pipeline publishes.

| Piece                                   | Where                                        | Notes                                                                                                          |
| --------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Worker name, account ID, what to upload | `wrangler.jsonc`                             | Uploads `dist/`. No routes: the sponsor connected the domain in the dashboard. The account ID is not a secret. |
| The pipeline                            | `.github/workflows/deploy-landing.yml`       | Starts after CI passes on `main`, for every merge. Publishes only the newest commit on `main`.                 |
| The token                               | Repository secret `CLOUDFLARE_API_TOKEN`     | From the sponsor. It can only edit Workers. It lives nowhere else: never in a file, a chat or a log.           |
| The on/off switch                       | Repository variable `LANDING_DEPLOY_ENABLED` | Unset means off.                                                                                               |

### While the switch is off

Every merge to `main` builds the page and runs `wrangler deploy --dry-run`. That
validates `wrangler.jsonc` and the build output without contacting Cloudflare,
so it needs no token. It does **not** prove that the token works or that the
domain is set up; the first real deploy is the test of those. You can see each
run in the Actions tab, under "Deploy landing".

### Going live

Once the sponsor approves the copy in the questions issue:

1. Set `status: 'approved'` in `src/content.ts` with the approval's link, its
   date and the copy fingerprint (see "How copy gets onto the page").
2. Set the repository variable `LANDING_DEPLOY_ENABLED` to `true` (Settings →
   Secrets and variables → Actions → Variables; write access is enough).
3. Merge the pull request from step 1. After CI passes, the pipeline runs
   `build --release`, which refuses unapproved or changed copy, then
   `wrangler deploy`.

Do step 2 before step 3: setting the variable alone deploys nothing, because
only a merge starts the pipeline.

### Checking a deploy

1. **The run.** Actions → "Deploy landing" → the run for your merge. The last
   step, "Deploy to Cloudflare Workers", should be green and print the Worker
   name and a version ID. If the step "Is this still the newest commit on
   main?" printed a notice, a newer merge published instead; check that run.
2. **The root domain.** `curl -sI https://sagasproject.org` answers `200`.
   Open it in a browser: the approved copy is there, and there is no draft
   banner.
3. **The redirect.** `curl -sI https://www.sagasproject.org` answers with a
   redirect (`301` or `308`) whose `location` is `https://sagasproject.org/`.
4. **Search engines.** View the page source: an approved page has no
   `noindex` line. A draft always has one.
5. **A phone.** Open the site on a phone: the layout fits, and the text is
   readable without zooming.

Post the result in the questions issue, so the sponsor knows it is live.

### Rolling back

- **Normal way: revert and merge.** On the pull request that caused the
  problem, click **Revert**. GitHub opens a pull request that undoes it; one
  teammate approves, you merge, and the pipeline publishes the previous
  content. Everything stays in the history.
- **Faster, through the sponsor.** Cloudflare keeps the last 100 published
  versions. The sponsor, as the only dashboard user, can roll back under
  Workers & Pages → `sagas-landing` → Deployments → the version's ⋯ menu →
  Rollback. Follow up with a revert on GitHub anyway, or the next merge
  publishes the bad content again.
- **To stop further deploys** while you sort it out, unset
  `LANDING_DEPLOY_ENABLED`. That does not take down what is already live.

Cloudflare's own Git publishing stays off, so nothing reaches the site without
passing CI and this pipeline. Nobody on the team signs up for or pays for
anything; the sponsor owns the account.
