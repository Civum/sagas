# P4: Hosting the full app

- **For:** the sponsor's hosting decision on 8 November 2026
- **Workstream:** Platform. **Issues:** P4 #34; the address is P6 #35
- **Status:** Ready for the sponsor's decision on 8 November, conditional on validation before deployment. Two checks validate it: a Worker reaching the database, and CPU time on Cloudflare itself. They need database access, which the sponsor is setting up on 7–8 November. They run in the first days of the following week, under the rule in section 2. The other layers' deployment and sizing are confirmed later, against the teams' real code.
- **Research:** 30 October to 6 November 2026. Retested on `main` at contract 2.7.0 on 6 November
- **Currency:** USD; standard pricing; taxes and currency conversion excluded

## Recommendation

**What's asked on Sunday:**

- **The full app (`apps/web`) on Cloudflare Workers** (items 1 and 5).
- **Cloudflare as the platform for every layer, with Workers Paid as the shared $5 account base** (items 2 and 3). The sponsor asked for the other layers in this write-up, and they share one account, one database and one Workers allowance with the full app.

**What follows, without holding up Sunday's decision:**

- **Validation before deployment.** The test Worker checks the database connection and CPU (section 2). If a connection problem is confirmed, the sponsor looks at the decision again, with Render as the fallback.
- **The other layers' deployment and sizing,** and what the whole project costs to run. These are confirmed against the teams' real code after the week of 16 November.

1. **Host the full app on Cloudflare Workers,** as a second Worker beside `sagas-landing` on the sponsor's account, deployed only by GitHub Actions. At the assumed baseline traffic it fits Workers Free, if its requests stay within Free's CPU limit and the account's busiest day stays under 100,000 requests.
2. **Host the other layers on the same account:**
   - their web apps and APIs as Workers;
   - their files in R2;
   - media processing (`ffprobe`, `ffmpeg`) in a Cloudflare Container.

   Containers need Workers Paid, which gives the account a **shared base of $5 a month.** The total also depends on several things that the account's web traffic can't predict:
   - how long media processing runs;
   - how many files are kept, and how often they're read and written;
   - how much is transcribed and translated;
   - what the other layers' real code needs.

3. **Transcription can avoid a container,** if the content team picks a model that Workers AI runs, such as Whisper, at $0.0005 per audio minute. The content team chooses the models.
4. **Move to Next.js 16** in its own pull request, before the full app is published (P7).
5. **Decide on Sunday, then confirm with the test Worker.** The sponsor decides from this proposal on 8 November. Once database access is up, the test Worker checks that a Worker can reach the database. If a connection problem is confirmed, the decision is looked at again, with **Render** as the fallback. Render's starting prices are known: $7 a month per service. Section 2 gives the rule for Workers Free, Workers Paid or Render.

| What the sponsor asked about                      | Finding                                                                                                                                                                                                                                             | Status                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Cloudflare Workers                                | The full app runs in Cloudflare's runtime after five small changes. Locally, data calls and pre-built pages take 2–3 ms. The `/dev` sandbox (article, map and controls), rendered on every request, takes about 18 ms. Free's limit is 10 ms of CPU | Tested locally on 6 November; CPU on Cloudflare itself waits on the test Worker         |
| Containers for media processing and transcription | Media processing needs a container, on Workers Paid. Transcription can use Workers AI instead, if the chosen model runs there                                                                                                                       | Based on the other teams' starter code; their real code is seen the week of 16 November |
| Whether a Worker can reach the database           | Nothing in principle blocks it. Supabase's Network Restrictions, and the ranges they allow, decide the route: direct, Hyperdrive or Render                                                                                                          | The sponsor answers the settings in #11 this weekend; the test Worker confirms it       |
| Render as a fallback                              | $7 for the full app, which is not tight on bandwidth at the assumed baseline. Each extra service is another $7, and the next instance size is $25                                                                                                   | Rechecked 6 November                                                                    |
| The move to Next.js 16                            | Passes the whole workspace's CI and builds for Cloudflare on 16.4.5                                                                                                                                                                                 | Tested on 6 November; its own pull request before P7                                    |

The app stays portable whichever host is chosen. It reaches the database through `packages/read-model` on standard Postgres, and host settings stay out of feature code, so Render or any other Node host remains possible.

## 1. The full app on Cloudflare Workers

**It works in Cloudflare's runtime.** On 6 November, `main` was moved to Next.js 16.4.5. It was built with the OpenNext adapter for Cloudflare (1.20.16) and run in `workerd`, Cloudflare's runtime, against Postgres seeded with the fixtures. The results:

- **Every route answered:** `/`, `/dev`, `/api/sites` and `/api/sites/[slug]`, which are all the routes the app has. The site pages (`/sites/<slug>`) aren't built yet.
- **Twelve simultaneous first requests** to a fresh Worker all succeeded.
- **In a browser,** the pages behaved exactly as under plain Node.
- **The bundle** is 5.0 MiB, against a 64 MiB limit.
- **Earlier runs** on Next.js 15.5.28 (30 October), and on a second machine, gave the same picture.

| Route (Next.js 16.4.5, contract 2.7.0)                                                                                            | Median / p95, local | What to watch                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| `/`, built ahead of time and served from the cache                                                                                | 2 / 3 ms            | Likely within Free                                                              |
| `/api/sites`                                                                                                                      | 2 / 3 ms            | Likely within Free                                                              |
| `/api/sites/freight-depot`                                                                                                        | 3 / 4 ms            | Likely within Free                                                              |
| `/dev`, the development sandbox: article, map, controls and acceptance criteria, rendered on every request (freight depot, t0–t3) | 18 / 22 ms          | Shows the cost of rendering on each request; not the future article page's cost |

**These are local wall times, not Cloudflare's CPU time.** Wall time includes waiting on the database, which Cloudflare doesn't count as CPU. The times were also measured on a shared machine, not Cloudflare's. So they show which routes to measure once deployed, and the test Worker measures the real CPU. Cloudflare ends a Worker that keeps going over 10 ms of CPU. If pages rendered on each request do, there are two remedies:

- **Build site pages ahead of time.** Fixture data changes only on deploy, so stored pages cut the rendering work.
- **Use Workers Paid,** which raises the limit to 30 seconds per request. The containers need Paid anyway, so once the other layers arrive, the 10 ms limit stops mattering.

**A reminder about `/dev`:** `apps/web/README.md` and the SRS draft call it a development tool, and the page itself says to replace it once there's something better. So we propose:

- **On the fixture preview (P7):** keep `/dev` available. It's where the article can be shown to the sponsor.
- **On the eventual public site:** disable it, with the setting and the check in change 3 below. A line in the README says where it runs.
- **The article's public home is the site pages (M4).** We plan to prerender the shared fixture site pages; their rendering and cache behaviour will be verified when M4 is implemented.
  - Views as of a chosen time, and personalised interactions, need their own design.
  - Passover writes can stay separate dynamic requests. They don't need the whole article rendered again.

**Passovers will need writes.** The planned passover interaction stores passovers with anonymous guest IDs, in the experience layer's own tables (Da8). Recording them isn't built yet: Da10 leaves it to that interaction. So:

- the app's database user will need write access to those tables;
- each passover is a request that runs when someone acts, and can't be built ahead of time. Its CPU and database time remain to be measured, and it isn't in the cost model yet.

**What the app needs before it's published (P7):**

1. **Versions:** Next.js 16.4.5 or later, with adapter `@opennextjs/cloudflare` 1.20.16. The adapter's minimum Next.js version rises with Next.js security releases, so Next.js has to be kept patched.
2. **The database driver:** `pg` and `pg-cloudflare` as the app's own dependencies, and in `serverExternalPackages`. Without this, every database call fails in a Worker.
3. **`/dev`:**
   - **On the preview:** it reads the fixture index from the repository on every request, and a deployed Worker doesn't have that file. Bundle the index, or read the list from the read model.
   - **For the public site:** a setting that rejects `/dev` requests on the server, before any fixture loads. A test requests `/dev` directly with the setting off, rather than only checking that its links are hidden.
4. **The static-assets cache:** pages built ahead of time are served from it, in about 2 ms instead of about 16. It is read-only, so changed pages need a redeploy, which suits fixture data.
5. **Ignore files:** `.open-next/` and `.wrangler/` stay out of git and lint.

**The build needs a database,** because `next build` renders the home page from Postgres. CI starts its own Postgres and seeds it, which is the CI database job already planned. CI's database ends with the job, so at runtime the Worker uses the hosted database. The read model loads once, inside the first request, and closes its connection, which Workers allow. Anything that queries on every request, such as a passover or Da5's map data, must create its database client inside that request.

## 2. Can a Worker reach the database?

**Nothing in principle blocks it:**

- Worker sockets reach public addresses over TCP, with TLS.
- Supabase's pooler accepts IPv4 connections, on every plan.

**What depends on the sponsor's settings:**

- **Network Restrictions.** If they're on, the ranges they allow decide the route. Cloudflare's published IP ranges can't be used to reliably allow-list direct Worker socket connections. Hyperdrive works if Cloudflare's published ranges are allowed, and Render works once its outbound ranges are.
- **"Enforce SSL on incoming connections."** It doesn't change the route. The app connects encrypted either way; the setting only decides whether the database also refuses unencrypted connections.

| Way to connect                                                             | Works when                                                   | Notes                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`pg` over a Worker socket** to Supabase's transaction pooler (port 6543) | Network Restrictions are off                                 | Supabase recommends this pooler for serverless code                                                                                                                                                                            |
| **Hyperdrive**, Cloudflare's connection pool                               | Restrictions are off, or allow Cloudflare's published ranges | Cloudflare's guide uses Supabase's direct connection, which is IPv6-only on Supabase Free and Pro unless the IPv4 add-on is bought, so that is part of the test. Included in Free (100,000 queries a day) and Paid (unlimited) |
| **Render** (the fallback)                                                  | Restrictions are off, or allow Render's outbound ranges      | Render services use regional outbound IP ranges, shown in its dashboard. `pg` connects exactly as it does locally, from Oregon, next to `us-west-2`                                                                            |

**The test Worker validates the decision before the full app is deployed.** It runs in the first days of next week, once access is up:

- it's the full app as built for P7, with `/dev` included, since the preview serves it;
- it has fixture data only, no route, and runs on Workers Free;
- it's removed afterwards.

Those are the sponsor's conditions (#11, 2 November).

| Check      | How                                                                                                                                                                                                                                                                                                              | Result                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Connection | A query with `$1` parameters, as passover writes will use. First direct through the transaction pooler; then through Hyperdrive, once its configuration and any allow-listing are set up                                                                                                                         | **Passes:** either route returns the expected rows. **Fails:** both routes are set up and checked, and neither connects. **Pending:** a route can't be tried yet, such as Hyperdrive without its configuration                                                                                                                                     |
| CPU        | Each route the preview serves, requested 100 times, one route at a time. The first, cold requests are reported apart from the warm ones. CPU time comes from Workers Logs, which records it for each invocation; it's turned on in the test Worker's configuration, and the sponsor can read it in the dashboard | Reported per route: whether every response was the expected one, any invocations with the status `exceededCpu` (Cloudflare's CPU-limit outcome; error 1102 alone can also mean other resource limits), and the observed p99 CPU. **Our acceptance target is a p99 under 8 ms:** headroom we chose below Free's 10 ms limit, not a Cloudflare limit |

`pg`'s ordinary parameterized queries are expected to work through the transaction pooler. Named prepared statements aren't supported there, so the app doesn't use them.

**The decision rule:**

1. **The connection fails** (both routes set up and checked): the sponsor looks at the decision again, with Render as the fallback (#11, 6 November).
2. **The connection is pending:** finish setting up the route and retest. Nothing is decided on a route that couldn't be tried.
3. **A route returns unexpected responses,** such as an HTTP 500 or the wrong data: diagnose and retest before P7, however fast it was.
4. **The connection passes, and every route returns the expected responses, with no `exceededCpu`, and meets the CPU target:** the full app can run on Workers Free until the containers arrive.
5. **The connection passes and the responses are right, but a route misses the target.** Missing 8 ms doesn't by itself make Free unsuitable: Cloudflare tolerates occasional overruns. Two responses are reasonable:
   - optimise the route, or build it ahead of time, and retest;
   - or choose Workers Paid ($5) for margin, which the containers need anyway.

   Invocations that end as `exceededCpu` mean Paid, or a change to that route, before deployment.

**The results are recorded on #34 before P7:**

- the commit and configuration tested, and the connection route used;
- for each route: its responses, any `exceededCpu`, and the cold and warm p99.

`/dev`, at 18 ms locally, is the route most likely to miss. If it needs Paid, that's a requirement of the preview's configuration. The public article pages are measured separately, when M4 builds them.

**The database layout** (sponsor, #11, 6 November):

- **One Supabase project, with one shared model:** the one in `packages/contracts/src/model.ts`.
- **Tables a layer needs only for itself** go in that layer's own Postgres schema, beside the shared tables.
- **On Supabase Free, the 500 MB limit is shared by all three layers,** so media files belong in R2, not the database.

**Still open, answered by the sponsor in #11 when he sets up access this weekend:**

- [ ] Network Restrictions: on or off, and which ranges they allow.
- [ ] "Enforce SSL on incoming connections": on or off.
- [ ] The plan. Free projects pause after a week without activity.
- [ ] How the connection details reach the team. They have two destinations:
  - **CI:** a GitHub repository secret, for the deploy job;
  - **the running Worker:** a Worker secret or a Hyperdrive configuration. The pipeline can set a Worker secret with the existing token.

## 3. Hosting all three layers

Sunday's decision covers the platform for these layers; their deployment and sizing are confirmed later. Nothing in this section blocks the decision on the full app. This lists each layer's parts, from the upstream starter code. The other teams' real code is seen at the meetings in the week of 16 November, so this is a plan to confirm, not a commitment.

| Part                                 | What it is (upstream)                                                                    | On Cloudflare                                                                                                                                                                                      | Cost                                                                                                                                                                                                                                                      |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Experience: `apps/web`               | Next.js                                                                                  | Worker (tested, section 1)                                                                                                                                                                         | Within the account's allowance                                                                                                                                                                                                                            |
| Content: `apps/capture-web`          | Empty upstream                                                                           | Worker or static assets                                                                                                                                                                            | Within the account's allowance                                                                                                                                                                                                                            |
| Content: `apps/capture-api`          | Express 5 and `pg`                                                                       | Worker, using `nodejs_compat` and `httpServerHandler`. Not yet tried with their code. Its module-level `pg.Pool` would need a client created per request instead                                   | Within the account's allowance                                                                                                                                                                                                                            |
| Intelligence: `apps/graph-api`       | Express 5 and zod                                                                        | Worker, the same way                                                                                                                                                                               | Within the account's allowance                                                                                                                                                                                                                            |
| Files: the `sagas-media` bucket      | S3 API, presigned uploads, recordings of about 600 MB                                    | R2, which speaks the S3 API                                                                                                                                                                        | Free each month: 10 GB-months of storage, 1 million Class A (write) and 10 million Class B (read) operations. Then $0.015 per GB-month, plus per-operation charges. No egress fees                                                                        |
| Media worker: `ffprobe` and `ffmpeg` | Probes each upload and makes derived files                                               | **Can't run in a Worker.** A Cloudflare Container, started when there's work. Sizes run from `lite` (1/16 vCPU, 256 MiB) to `standard-4` (4 vCPU, 12 GiB); `basic` (¼ vCPU, 1 GiB) is a likely fit | Paid includes 25 GiB-hours of memory, 375 vCPU-minutes and 200 GB-hours of disk a month. Memory and disk are charged while the container runs, CPU only for what it uses. For example, 100 hours a month of `basic`, using its full ¼ vCPU, adds about $2 |
| Jobs for the media worker            | Upstream expects them in Postgres, with a library such as `graphile-worker` or `pg-boss` | A job in Postgres doesn't start a sleeping container by itself. Something has to dispatch it: the API Worker on upload, a scheduled Worker, or Queues                                              | Queues on Free: 10,000 operations a day, with 24-hour retention; more on Paid                                                                                                                                                                             |
| Transcription                        | Whisper is named upstream as a place to start                                            | **Workers AI, if the chosen model runs there:** `whisper-large-v3-turbo` costs $0.0005 per audio minute                                                                                            | 10,000 Neurons a day are free on Free and Paid, shared by every model on the account; Whisper alone would get about 214 audio minutes from them. Beyond that, $0.011 per 1,000 Neurons, on Paid only                                                      |
| Translation                          | NLLB-200 and `opus-mt` are named upstream                                                | Workers AI has `m2m100-1.2b`; otherwise a container                                                                                                                                                | $0.342 per million tokens, in and out, from the same Neurons                                                                                                                                                                                              |
| Database                             | One Supabase project (section 2)                                                         | Not on Cloudflare                                                                                                                                                                                  | The sponsor's Supabase plan                                                                                                                                                                                                                               |

**Checks to agree with the content team:**

- **Dispatch:** how a job reaches the media container, with retries and shutdown. Queues would be a design choice to make with them, not a given.
- **Long recordings** probably need `ffmpeg` to extract and split the audio before transcription. The model's input limit has to be checked.
- **The model choice is theirs.** Upstream says checking each model's licence is part of their job (`apps/capture-api/README.md`). A model not on Workers AI would run in a container, on CPU only: Cloudflare's container limits list no GPUs, so it would be slower than Workers AI.

**Workers Paid is per account.**

- **Workers:** every Worker on it shares one allowance of 10 million requests and 30 million CPU-milliseconds a month.
- **Containers:** billed separately, against their own included amounts (above). The Worker and Durable Object in front of each container count as Workers and Durable Objects usage.

Usage shows per Worker in the dashboard, and each Worker's CPU can be capped. The landing page is on the same account, and its static files cost nothing.

## 4. Render, rechecked

- **Instances:** $7 a month for 0.5 CPU and 512 MB. The next size is $25, for 1 CPU and 2 GB.
- **Bandwidth:** since 1 August 2026, the Hobby workspace includes 5 GB of outbound a month (it was 100 GB). Each GB beyond costs $0.15.
- **The full app:** at the assumed baseline, $7 is not tight on bandwidth: 1.6 GB of the 5 GB. Whether 0.5 CPU keeps up at peaks is untested. At 100×, it's about $30, and the extra is bandwidth, not a bigger instance.
- **All layers, as a sizing scenario:** every always-on service is its own $7. The app, `capture-api`, `graph-api` and the media worker come to $28 a month before bandwidth.
  - This assumes each fits in 512 MB and that `capture-web` needs no server of its own. The media worker's size is untested.
  - Render has no object storage, so files would still need R2.
  - A transcription model needs more than 512 MB; Workers AI can be called from Render instead.
- **Free web services:**
  - they sleep after 15 idle minutes, and take about a minute to wake;
  - Render may suspend one that sends unusually high traffic over the internet, including to an external database.
- **Deploying from GitHub Actions:** build a container image in Actions, where the CI database is, push it to a registry, and deploy that image to Render with a deploy hook stored as a repository secret. Render's Auto-Deploy stays off. If Render built the app from Git instead, its own build would need a database it can reach.
- **Why it's the fallback:** it runs the app as it is, as a plain Node server with no adapter, and its outbound IP ranges can be allow-listed.

## 5. The move to Next.js 16

- **Agreed** at the 6 November meeting. Next.js 15 gets security releases until 31 January 2027, extended from 21 October 2026.
- **Its own pull request, before P7,** with a decision record, since it affects every workstream.
- **Tested on 6 November on `main`** (contract 2.7.0), with 16.4.5:
  - typecheck, lint, acceptance and every test pass (web 28, landing 109, fixtures 162, graph-api 8);
  - the Cloudflare build needs no override;
  - the browser check matches plain Node.

  The 30 October run on 16.4.2 agreed. Node isn't a concern: CI uses 22.10.0, and 16 needs 20.9 or later.

- **Before merging,** repeat those checks on the 16.x that's current then, including cold starts.
- **Question for the sponsor: does upstream move to 16 too?** If the fork moves first, every upstream sync conflicts on `package.json` and the lockfile.

## 6. Alternatives considered

At standard pricing, as the sponsor asked (#11, 6 November). Vercel is excluded by #34.

| Option                       | What it offers                                                                                                                                              | Why it wasn't chosen                                                                                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Workers Free only | $0 for everything except the media worker                                                                                                                   | Free only while traffic and CPU stay inside it; the media worker still needs Paid or another host                                                                                                                                                               |
| Render                       | Runs the app as it is                                                                                                                                       | Kept as the fallback. About $28 a month for four services, plus bandwidth and R2 for files                                                                                                                                                                      |
| Google Cloud Run             | Every layer as a container, `ffmpeg` included. Free each month for request-based services: 2 million requests, 180,000 vCPU-seconds and 360,000 GiB-seconds | Jobs, which the media worker would be, have their own allowance, and outbound data isn't part of either. Needs a billing account, and free usage counts across everything on it. Idle services sleep, so there are cold starts. A new account, pipeline and DNS |
| Oracle Cloud Always Free     | One VM with 2 OCPUs and 12 GB, 200 GB of disk and 10 TB of outbound a month: the whole stack in Docker Compose                                              | Cut in half on 15 June 2026, so its free terms can change. Reclaims instances it considers idle: over 7 days, CPU, network and (on Arm) memory all under 20% at the 95th percentile. Someone has to patch and secure the server after the semester              |
| Netlify                      | Next.js through its adapter                                                                                                                                 | Every project pauses when the month's credits run out. About $60 a month at 100× for the full app. Fixed outbound addresses, which a restricted database would need, are an Enterprise add-on                                                                   |

**Bottom line:** on current evidence and standard prices, Cloudflare is the preferred platform:

- it's a low shared base on the sponsor's existing account, where the deploy token and the domain already are: $5 a month for every layer's Workers;
- the free options trade money for server work (Oracle), or are free only until traffic grows (Cloud Run, Cloudflare Free).

## 7. Cost

**The full app.** It isn't published, so the cost model uses an **assumed baseline:** the sponsor's whole Cloudflare account over 30 days, 12,110 requests, each treated as one page view of the app. That's about 400 views a day at 1×, and 40,000 at 100×. One page view was measured at 7 Worker requests and about 129 KiB on a first visit. So the table below is a planning scenario, not measured app traffic. Appendix B has the model and its assumptions.

|                            | Cloudflare Workers                                                                                                                                                          | Netlify                                                                            | Render                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1× (assumed baseline)      | **$0** on Free, if requests stay within its CPU and daily limits; otherwise $5 on Paid                                                                                      | $0 at 7 deploys a month; $9 at 20                                                  | $7                                                               |
| 100×                       | **About $5–6** on Paid                                                                                                                                                      | About $60 (Pro's base plus four $10 packs)                                         | About $30                                                        |
| Free ends                  | When the account's busiest day passes 100,000 requests (about 30–35× the assumed baseline, if traffic is spread evenly), or with requests that keep going over 10 ms of CPU | When the month's 300 credits run out; then every project pauses                    | Free sleeps and isn't meant for production, so $7 from the start |
| Reaches Supabase           | Direct, or through Hyperdrive (section 2)                                                                                                                                   | Through the pooler, if the database has no allow-list                              | Through the pooler; allow-listable ranges                        |
| Deployed by GitHub Actions | `wrangler deploy` with the existing token, as for the landing page                                                                                                          | `netlify deploy --prod --no-build`, with a token and site ID as repository secrets | An image built in Actions, deployed by a deploy hook             |

Reading the 12,110 as requests rather than page views lowers every figure, but the order stays the same: Cloudflare $0–5, Render $24.85, Netlify $30. The numbers are recalculated once the preview gives real traffic.

**All three layers: starting prices.**

|                  | Cloudflare                                                                                         | Render                                           |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Hosting          | $5 account base                                                                                    | About $28 (four $7 services, if each fits)       |
| Media processing | Inside the included container amounts at light use; 100 hours of `basic` at full CPU adds about $2 | One of the four services                         |
| Transcription    | Workers AI, if the chosen model runs there: free within 10,000 Neurons a day across all models     | Workers AI through its API, or a bigger instance |
| Files            | R2: free within 10 GB-months and the included operations                                           | R2 too                                           |
| Database         | One Supabase project, on the sponsor's plan                                                        | The same                                         |

These are starting points. The total depends on the media processed, the files kept, the audio transcribed and the text translated, and on what the other layers' real code needs.

## 8. What happens next

| When                       | What                                                                                                               | Who                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------- |
| 7–8 Nov                    | Database access, and answers in #11: the settings, the plan, and how the connection details arrive                 | Sponsor             |
| 8 Nov                      | Decision on the full app's host, and on Cloudflare with the $5 account base for every layer                        | Sponsor             |
| Early in the week of 9 Nov | The test Worker, under the decision rule in section 2. Then it's removed                                           | Platform, with Data |
| Week of 9 Nov              | The CI database job, and the Next.js 16 pull request                                                               | Platform            |
| After both pass            | P7 publishes the full app; P6 gives it its address on `sagasproject.org`                                           | Platform            |
| Week of 16 Nov             | Meet the other teams. Turn section 3 into a plan for their real code, including how jobs reach the media container | Team                |

If the test Worker confirms a connection problem, the sponsor looks at the decision again, with Render as the fallback.

---

## Appendix A: Evidence

**Next.js 16.4.5, adapter 1.20.16, `main` at contract 2.7.0 (6 November).** Local `workerd`, against Postgres 16 seeded with the 24 fixture states. Warm requests, after the first:

| Route                       | Median / p95 | Max   |
| --------------------------- | ------------ | ----- |
| `/` (from the cache)        | 2 / 3 ms     | 4 ms  |
| `/api/sites`                | 2 / 3 ms     | 6 ms  |
| `/api/sites/freight-depot`  | 3 / 4 ms     | 6 ms  |
| `/dev`, freight depot t0–t3 | 18 / 22 ms   | 28 ms |

- **Twelve simultaneous first requests:** all succeeded, in 0.02–0.38 s.
- **Bundle:** 5,083 KiB uncompressed (1,070 KiB gzip), against a 64 MiB limit. Cloudflare removed the compressed limit on 4 September 2026.
- **CI:** a clean install, the fixtures, typecheck, lint, acceptance and tests across the workspace all passed.

**Earlier runs:**

| Run                                                               | `/`                                            | APIs       | `/dev` article          |
| ----------------------------------------------------------------- | ---------------------------------------------- | ---------- | ----------------------- |
| Next.js 15.5.28, adapter 1.20.13 (30 October)                     | 2.5 / 4 ms; 16 / 20 ms when rendered each time | 3 / 4–5 ms | 15 / 22 ms              |
| Next.js 16.4.2, adapter 1.20.12 (30 October)                      | 2 / 4 ms                                       | 2 / 4–5 ms | 18 / 22 ms              |
| Second machine (WSL, the team's Docker database), Next.js 15.5.28 | 4–6 ms                                         | 4–6 ms     | 11–16 ms (median 12–13) |

**What the runs show:**

- **Data barely matters.** On the second machine, `/dev` took nearly the same time for the lightest fixture (corner shop at t0) and the richest (freight depot at t3): 12 against 13 ms. Most of the time goes to rendering the page, not its data.
- **The browser check matched plain Node,** on both 15.5.28 and 16.4.5:
  - the pages render, and query parameters choose the site and state;
  - client-side navigation, refresh and the back button work;
  - a missing page and an unknown site both give 404.

  Both runtimes showed the same 404s for prefetches of `/sites/<slug>`, links to pages that aren't built yet (M4 adds them).

**How it was run:**

1. Postgres 16 on port 5435, seeded with `pnpm --filter @sagas/ui-api db:seed`.
2. The five changes in section 1, with `open-next.config.ts` and a local-only `wrangler.jsonc` (flags `nodejs_compat` and `global_fetch_strictly_public`).
3. `opennextjs-cloudflare build`, then `opennextjs-cloudflare populateCache local`.
4. The bundle measured with `wrangler deploy --dry-run`, which uploads nothing.
5. The app served with `wrangler dev`. The timings came from its request traces, and the browser check used Playwright's Chromium.

Nothing was deployed, and no account was used.

## Appendix B: Cost model

**Inputs:**

- **Traffic (sponsor, #11, 2 November):** 12,110 requests, 4,990 Worker invocations, no errors, and a CPU p90 of 569 µs over 30 days, for the whole account.
  - Cloudflare can't show `sagas-landing` alone, and the busiest day (11 October) was before the landing page went live.
  - These are not page views, and the p90 is not an average to multiply. Treating each request as a page view is a planning assumption.
- **Per page view (measured locally):**
  - 7 Worker requests: the page, plus Next.js prefetching the 6 site links on it (8 on the home page);
  - 14 requests in all on a first visit;
  - about 129 KiB on a first visit (0.4–10 KiB on a repeat).

  The 6 prefetches are of site pages that don't exist yet, so today they return 404. Once those pages exist, and as interactions such as passovers arrive, the requests and bytes per view will change.

- **Assumed CPU per view, for pricing:**
  - 35 ms with pre-built pages: 7 requests at 5 ms each (5 ms rounds up the local p95 for a cached page or an API call);
  - 46 ms with one page rendered on each request: 16 ms (the local median for the home page rendered each time), plus 6 requests at 5 ms.

  These are assumptions, not measured limits. Twice as much CPU would add about $1 a month at 100×.

- **Deploys:** 7 merges changed app code from 3 October to 2 November; 20 is also shown.

|            | 1× (about 400 views a day)                                     | 100× (about 40,000 views a day)                                                                                   |
| ---------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Cloudflare | $0 on Free: about 2,800 Worker requests a day, against 100,000 | $5.25–5.51 on Paid: 8.5 million requests (10 million included); 42–56 million CPU-ms (30 million included)        |
| Netlify    | 183 credits at 7 deploys (Free, 300); 378 at 20 (Personal, $9) | About 7,900–8,100 credits: Pro's base ($20 when checked on 3 November) plus four packs of 1,500 at $10, about $60 |
| Render     | $7: 1.6 GB of the 5 GB included                                | About $30: $7 plus 160 GB at $0.15 beyond 5 GB                                                                    |

- **Netlify's compute** assumes its default 1 GB and an unmeasured 50 ms per call.
- **Second reading,** with the 12,110 as the app's requests rather than page views (100 KiB each, 4 deploys, 100 ms per Netlify call):
  - Cloudflare: the average day fits Free even at 100×, at about 40,000 Worker requests. That holds only if the whole account's busiest day also stays under 100,000 requests, and every request within Free's CPU limit, which a low monthly volume can't settle.
  - Netlify: 91 and 3,119 credits, so $0 and $30.
  - Render: $7 and $24.85.

## Appendix C: Sources

- **Sponsor:**
  - #11 on 2 November: the database, the account traffic, and the test Worker.
  - #11 on 6 November: the decision on 8 November, one project with a shared model, and standard pricing.
  - The 6 November meeting and email.
- **Upstream starter code (Civum/sagas):**
  - `SETUP.md`;
  - `apps/capture-api/README.md` (jobs, models and licences), `src/db.ts` and `package.json`;
  - `apps/graph-api/package.json`;
  - `packages/contracts/src/model.ts`.
- **The fork:** `apps/web/BACKLOG.md` (Da8, Da10), `apps/web/README.md` and the SRS draft (`/dev`).
- **Cloudflare:**
  - [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).
  - [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
  - [The 4 September size-limit change](https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/).
  - [Static assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).
  - [TCP sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/).
  - [Hyperdrive pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/).
  - [Hyperdrive networking](https://developers.cloudflare.com/hyperdrive/configuration/firewall-and-networking-configuration/).
  - [Hyperdrive with Supabase](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/supabase).
  - [Containers pricing](https://developers.cloudflare.com/containers/platform/pricing/).
  - [Containers limits](https://developers.cloudflare.com/containers/platform/limits/).
  - [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
  - [Queues on Free](https://developers.cloudflare.com/changelog/2026-02-04-queues-free-plan/).
  - [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
  - [Express on Workers](https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/).
- **OpenNext:**
  - [Adapter overview](https://opennext.js.org/cloudflare).
  - [Release 1.20.13](https://github.com/opennextjs/opennextjs-cloudflare/releases/tag/@opennextjs%2Fcloudflare@1.20.13).
  - [Caching and performance](https://opennext.js.org/cloudflare/perf).
  - [Databases](https://opennext.js.org/cloudflare/howtos/db).
  - [Packages with workerd-specific code](https://opennext.js.org/cloudflare/howtos/workerd).
- **Next.js:** [support policy](https://nextjs.org/support-policy).
- **node-postgres:** [queries and prepared statements](https://node-postgres.com/features/queries).
- **Supabase:**
  - [Pricing](https://supabase.com/pricing).
  - [Connecting to Postgres](https://supabase.com/docs/guides/database/connecting/connecting-to-postgres).
  - [Network restrictions](https://supabase.com/docs/guides/platform/network-restrictions).
  - [Project pausing](https://supabase.com/docs/guides/platform/project-pausing).
  - [Production checklist](https://supabase.com/docs/guides/deployment/going-into-prod).
- **Render:**
  - [Pricing](https://render.com/pricing).
  - [New workspace plans](https://render.com/docs/new-workspace-plans).
  - [Free instances](https://render.com/docs/free).
  - [Outbound IP addresses](https://render.com/docs/static-outbound-ip-addresses).
  - [Deploy hooks](https://render.com/docs/deploy-hooks).
  - [Deploying an image](https://render.com/docs/deploying-an-image).
  - [Regions](https://render.com/docs/regions).
- **Netlify:**
  - [Pricing](https://www.netlify.com/pricing/).
  - [Credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/).
  - [Paused projects](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/).
  - [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/overview).
  - [Private connectivity](https://docs.netlify.com/security/private-connectivity).
- **Alternatives:**
  - [Cloud Run pricing](https://cloud.google.com/run/pricing).
  - [Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm).
  - [InfoQ on the Oracle change](https://infoq.com/news/2026/07/oracle-cloud-free-tier-limits/).
- **Earlier proposal:** [P2](./P2-hosting-and-domain-proposal.md).
