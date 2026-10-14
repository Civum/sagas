# P2: Hosting and domain proposal

**Project:** Sagas experience layer  
**Status:** Draft for project owner review and sponsor approval  
**Workstream:** Platform. **Issue:** #5 &#x20;  
**Research date:** October 8, 2026  
**Currency:** USD; taxes and currency conversion excluded

## Decision requested

The Platform workstream proposes **Cloudflare Workers Free** for the initial static landing page, using a provider-supplied `*.workers.dev` address. Approval is requested for this initial hosting choice. Expected application hosting cost: **$0/month within the free limits**. Domain purchase would follow the sponsor's selection of a name and extension. **Netlify Free** is the proposed alternative, with **Render Free** retained as a prototype option.

Cloudflare explicitly directs new projects to Workers in its [Pages documentation](https://developers.cloudflare.com/pages/). This proposal uses Workers and Workers Static Assets throughout.

Hosting the later Next.js application and small read API remains a separate implementation decision, informed by the comparison below. Cloudflare is the preferred candidate, conditional on a compatibility and performance check. A free landing page does not establish that the complete application will fit the same tier.

## Scope and ownership

The [statement of work](https://github.com/byui-cse397/2026.3FallCSE397PCP_sagasCustomer/blob/main/apps/web/STATEMENT-OF-WORK.md) makes the sponsor responsible for providing a hosted database in its own project, purchasing the domain from the Platform shortlist, and signing up for approved hosting. The Data workstream owns the database, `packages/read-model`, and `apps/ui-api`.

P2 compares application hosts and domains. Its database assessment is limited to **whether the host can connect to the sponsor-provided PostgreSQL endpoint**. Database provider selection, provisioning, plans, storage, backups, and database costs are outside this proposal. The $0 hosting estimates below are not estimates of the entire project's infrastructure cost.

The sponsor approves services, spending, and public copy before implementation. Team-run infrastructure uses invented or public-record data; real testimony and personal data wait for the sponsor's own hosting, as required by the statement of work. Capture and intelligence services, map-provider usage, email, and other workstreams' infrastructure are not included in the application-host estimates.

## Personal account versus business ownership

The proposed ownership model is a sponsor-owned account with named team access and a clear handover path. The email address used to register an account does not determine whether the application qualifies for a provider's free plan. Actual use, collaboration requirements, and plan terms matter.

| Provider           | Personal account scenario                                                                 | Sponsor/business scenario                                                                                                                                                                                          | Implication for P2                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Workers | Free tier available by default.                                                           | Candidate for a sponsor-owned account; the linked Workers plan documentation does not impose Vercel's personal/noncommercial-only restriction. Required account roles remain subject to confirmation during setup. | Preferred free landing-page host. A paid Cloudflare website/DNS Business plan is not inherently required just to choose Workers. |
| Netlify            | Free supports one dashboard member and unlimited Git contributors on public repositories. | A sponsor-owned Free account is a candidate if one dashboard member is enough. Multiple dashboard members or organization-private repository integration require checking the paid plan.                           | Strong alternative, with collaboration and credit limits.                                                                        |
| Render             | Hobby workspace supports one member.                                                      | A sponsor can own a prototype workspace, but shared dashboard access requires the paid workspace plan. Free web instances have production limitations.                                                             | Prototype option rather than preferred full-app production host.                                                                 |
| Vercel             | Hobby is restricted to personal, noncommercial use.                                       | A personal registration email does not establish eligibility for sponsor/business use. Pro is the paid option.                                                                                                     | Hobby is excluded from the proposed business deployment shortlist.                                                               |

Sources: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Cloudflare Workers roles](https://developers.cloudflare.com/workers/authorization/workers/), [Netlify pricing](https://www.netlify.com/pricing/), [Netlify subscription agreement](https://www.netlify.com/pdf/self-serve-subscription-agreement.pdf/), [Render workspace features](https://render.com/docs/platform-features-by-plan), and [Vercel Hobby rules](https://vercel.com/docs/plans/hobby).

## Application hosting comparison

| Host                        | Static landing page and free address                                                                                                                            | Later Next.js application and small API                                                                                                                                                            | Can reach sponsor-provided PostgreSQL?                                                                                                                                                                                                                                     | Free-tier limits that affect this project                                                                                                                                                                                                        | Paid fallback                                                                                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloudflare Workers Free** | Workers Static Assets; provider address follows `<worker>.<account-subdomain>.workers.dev`. Static asset requests are free and unlimited when served as assets. | Supported deployment paths exist, but Workers is a different runtime from a conventional Node server. Full-app selection depends on validation of the actual scaffold, dependencies, SSR, and API. | **Yes.** Official docs support PostgreSQL drivers over TCP; optional Hyperdrive pools connections to an existing database. Sponsor endpoint and network policy must permit access.                                                                                         | Dynamic execution: **100,000 requests/day**, **10 ms CPU/request**. Runtime: **128 MB memory**, **64 MiB uncompressed bundle**, **1 second startup**. Workers Builds, if used: **3,000 minutes/month**, one concurrent build, 20-minute timeout. | Workers Paid starts at **$5/month per account**, plus excess usage. Includes 10 million requests and 30 million CPU milliseconds/month; excess rates $0.30/million requests and $0.02/million CPU milliseconds. |
| **Netlify Free**            | Static hosting and provider-supplied `*.netlify.app` address, with custom domains and SSL supported.                                                            | Official Next.js adapter supports SSR, React Server Components, and API routes. A separate API must fit its supported Functions runtime or have its own host.                                      | **Yes in principle through Node.js serverless functions and a compatible PostgreSQL driver.** This is an architectural inference from the Functions runtime, not a verified connection to the sponsor's unknown endpoint. Pooling, TLS, and network access must be tested. | **300 credits/month**, one dashboard member. Successful production deploys use **15 credits each**; bandwidth, requests, and compute share the same allowance. Free projects pause at the limit.                                                 | Personal **$9/month**, 1,000 credits, one member. Pro **$20/month** at the base tier, 3,000 credits and unlimited members; usage can add cost.                                                                  |
| **Render Free / Hobby**     | Free static sites and provider-supplied `*.onrender.com` address.                                                                                               | Node web services or Docker can run a conventional Next.js server and API. Separate web/API services share the free allowance.                                                                     | **Yes.** Render documents externally hosted database connections using `DATABASE_URL`. Public-internet traffic initiated by services counts toward outbound usage. Free services can also be suspended for unusually high service-initiated traffic.                       | Hobby: **5 GB outbound/month** and **500 build minutes/month**. Free web services share **750 running hours/workspace/month**, sleep after 15 idle minutes, and take about a minute to restart.                                                  | Paid web compute starts at **$7/month per service**. Pro workspace is **$25/month**, plus compute. Public-internet bandwidth above allowance is **$0.15/GB**.                                                   |

Provider evidence for the table:

- Cloudflare: [pricing](https://developers.cloudflare.com/workers/platform/pricing/), [runtime limits](https://developers.cloudflare.com/workers/platform/limits/), [Workers Builds limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/), [free address](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), and [PostgreSQL connectivity](https://developers.cloudflare.com/workers/databases/connecting-to-databases/).
- Netlify: [plans and prices](https://www.netlify.com/pricing/), [credit accounting](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), [Next.js support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/), and [Functions runtime](https://docs.netlify.com/build/functions/overview/).
- Render: [prices](https://render.com/pricing), [free-service limits](https://render.com/docs/free), [bandwidth allowances](https://render.com/docs/outbound-bandwidth), [build allowances](https://render.com/docs/build-pipeline), [Node/Docker web services](https://render.com/docs/web-services), and [external database configuration example](https://render.com/docs/deploy-redwood).

### What could make a free deployment unsuitable?

**Cloudflare:** The landing page should serve static assets directly. Request handling that invokes Worker code consumes the dynamic allowance. Next.js rendering or API logic must fit the CPU and memory limits. Free-tier dynamic limits can stop requests; upgrading needs sponsor approval. Workers Builds quotas apply only if using that build service; the P1 GitHub Actions workflow has its own build allowances.

The free `workers.dev` address supports an initial launch without buying a domain. Cloudflare [recommends a route or custom domain for production](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) and describes `workers.dev` as intended for projects that are not business-critical. The proposed use is therefore the initial landing-page/demo launch, with the address reviewed before business-critical production.

**Netlify:** At 15 credits per production deployment, 300 credits allow **at most 20 successful production deploys before any traffic or compute**. This is an arithmetic ceiling, not a realistic traffic budget. Bandwidth uses 20 credits/GB, web requests 2 credits/10,000 requests, and compute 10 credits/GB-hour. Under the proposed deployment approach, Platform would budget actual activity against the [credit rules](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/) and exclude unrelated repository changes from deployment.

**Render:** Free web instances have an ephemeral filesystem, cold starts, and shared running-hour limits. Render [advises against using them for production applications](https://render.com/docs/free). If bandwidth exceeds the allowance, a workspace with a payment method incurs charges; without one, services spin down until the next month. Exhausting build minutes can instead stop new builds while existing artifacts continue serving. These limits make Render less attractive for a consistently responsive free full application.

### Vercel as a paid fallback

[Vercel Hobby](https://vercel.com/docs/plans/hobby) is not a safe assumption for this sponsor/business scenario because of its personal, noncommercial restriction. [Vercel Pro](https://vercel.com/docs/plans/pro-plan) starts at $20/month, including one deployment seat and $20 of usage credit; additional deployment seats are $20/month each, and excess usage can be billed, as detailed in [Vercel pricing](https://vercel.com/pricing). Pro is retained as a paid Next.js alternative, subject to sponsor approval of those costs.

## Compatibility check before selecting the full-app host

The reviewed [web package](https://github.com/byui-cse397/2026.3FallCSE397PCP_sagasCustomer/blob/main/apps/web/package.json) declares Next.js `^15.1.6` and depends on the shared read model. Provider-advertised Next.js support does not establish compatibility with this application's dependencies and runtime requirements.

Cloudflare's current [Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) recommends vinext, which is in beta, and describes migration from an existing Next.js 16 app. The [OpenNext guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/) remains documented and supports SSR, React Server Components, and route handlers, with feature caveats. The current Next.js 15 scaffold needs an explicit compatibility decision; this proposal does not authorize a framework migration.

Before recommending a later full-app deployment, Platform would complete the following validation with Data responsible for the database interface:

1. A build of the existing monorepo application using the selected provider's deployment path.
2. Verification of SSR, routes, shared packages, and the intended API runtime. A separate Node service cannot be assumed to run unchanged inside Workers or Netlify Functions.
3. Measurement of bundle/startup size and representative request CPU and memory use against the selected free tier.
4. After sponsor-provided access is available, verification of a server-side, TLS-protected PostgreSQL connection and a representative read through Data's interface. Data would confirm pooling and connection limits; credentials would remain in server-side secrets.
5. Assessment of network-access requirements, including fixed outbound IPs, private networking, or allowlists that the selected free host may not satisfy. PostgreSQL protocol support alone does not prove reachability.

## Domain costs and registrar shortlist

Ordinary standalone registration of `.com`, `.org`, and `.app` is paid, and renewal is recurring. A free host address is a subdomain, not ownership of a custom domain. Promotions may include a domain temporarily with a paid plan; they do not make the combined deployment free indefinitely.

For example, [Vercel Pro](https://vercel.com/docs/plans/pro-plan) offers a first-year domain benefit for eligible extensions including `.app`, with standard renewal pricing afterward. `.com` and `.org` are not among the listed eligible extensions. This does not justify paying for hosting solely to avoid a small annual registration cost.

These are **standard, non-premium, one-year extension prices**, not checkout quotes for the suggested names. Final purchase cost remains subject to an exact-name quote, renewal terms, applicable taxes, and the promotion available at purchase.

| Extension | Spaceship first year, including applicable ICANN fee | Spaceship annual renewal, including applicable ICANN fee | Porkbun first year | Porkbun annual renewal | Direct Spaceship price source                                         |
| --------- | ---------------------------------------------------: | -------------------------------------------------------: | -----------------: | ---------------------: | --------------------------------------------------------------------- |
| `.com`    |                            **$9.08** ($8.88 + $0.20) |                               **$10.18** ($9.98 + $0.20) |             $11.08 |                 $11.08 | [Full .com pricing page](https://www.spaceship.com/domains/gtld/com/) |
| `.org`    |                            **$6.85** ($6.65 + $0.20) |                              **$11.59** ($11.39 + $0.20) |              $7.98 |                 $11.84 | [Full .org pricing page](https://www.spaceship.com/domains/gtld/org/) |
| `.app`    |                                            **$6.21** |                                               **$14.49** |              $8.75 |                 $14.93 | [Full .app pricing page](https://www.spaceship.com/domains/gtld/app/) |

Spaceship lists an additional $0.20 ICANN fee for `.com` and `.org`; its listed fee-bearing extensions do not include `.app`. Porkbun states its prices include ICANN and other fees. Sources: the linked Spaceship extension pages and [Porkbun's complete price table](https://porkbun.com/products/domains).

**Registrar recommendation:** Spaceship has the lowest listed first-year and renewal prices among the two registrars with numeric quotes in this comparison. Porkbun is the alternative. [Cloudflare Registrar](https://www.cloudflare.com/domains/) is also a candidate for a final exact-name quote: it advertises registration and renewal at cost, but no unverified numeric price is included here. This comparison does not establish the cheapest registrar across the entire market.

Cloudflare Registrar requires [Cloudflare nameservers](https://developers.cloudflare.com/registrar/get-started/register-domain/); changing DNS providers requires transferring the registration. Hosting can still be elsewhere. A `.app` domain requires HTTPS, according to [Google Registry](https://www.registry.google/domains/app/), so TLS is a launch requirement for that extension.

### Full URLs for reviewer verification

- Spaceship general pricing/search tab: <https://www.spaceship.com/domain-search/?tab=pricing>
- Spaceship `.com` prices: <https://www.spaceship.com/domains/gtld/com/>
- Spaceship `.org` prices: <https://www.spaceship.com/domains/gtld/org/>
- Spaceship `.app` prices: <https://www.spaceship.com/domains/gtld/app/>
- Render **5 GB/month Hobby bandwidth allowance**, under "Monthly included bandwidth": <https://render.com/docs/outbound-bandwidth>

The individual Spaceship extension pages expose registration and renewal prices directly, providing an alternative to the pricing/search tab's JavaScript-rendered table.

## Suggested names for the sponsor meeting

No preferred name has been supplied. These are suggestions, not an approved identity or registrar-confirmed availability list.

| Suggested name     | Extension-price budget at Spaceship, first year / renewal | Registration evidence from October 8, 2026                                                                                               |
| ------------------ | --------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `sagasarchive.com` |                                            $9.08 / $10.18 | [Verisign registry lookup](https://rdap.verisign.com/com/v1/domain/sagasarchive.com) returned no registration record.                    |
| `sagasarchive.org` |                                            $6.85 / $11.59 | [Public Interest Registry lookup](https://rdap.publicinterestregistry.org/rdap/domain/sagasarchive.org) returned no registration record. |
| `sagasarchive.app` |                                            $6.21 / $14.49 | [Google Registry lookup](https://pubapi.registry.google/rdap/domain/sagasarchive.app) returned no registration record.                   |

Alternative naming direction: `sagasplaces.com`, `sagasplaces.org`, or `sagasplaces.app`. Their registry checks also returned no registration record on the research date.

**Availability remains pending.** A missing registry record does not establish that a registrar will sell a name, that it is unreserved, or that standard pricing applies. The proposed purchase is conditional on exact-name registrar availability and a confirmed checkout/renewal quote. These suggestions do not yet satisfy any P2 acceptance requirement for a registrar-confirmed available-domain shortlist.

## Proposed cost and launch sequence

| Stage                                                |                                                                 Application hosting |                                               Domain | Decision                                                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------: | ---------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------ |
| Initial static landing page on Workers Free          |                                                              $0/month within limits |          $0 using the supplied `workers.dev` address | Preferred initial proposal.                                                                                        |
| Landing page with a purchased standard custom domain |                                                              $0/month within limits | One annual registration/renewal from the table above | Sponsor chooses the name and buys it.                                                                              |
| Later web app and read API on Workers Free           |                                                  Potentially $0/month within limits |               Supplied address or paid custom domain | Conditional on compatibility, performance, and sponsor-PostgreSQL reachability checks; separate full-app proposal. |
| Workers Paid fallback                                |                                                            From $5/month plus usage |                          Separate annual domain cost | Sponsor approval required.                                                                                         |
| Netlify Free alternative                             |                                         $0/month within the shared credit allowance |               Supplied address or paid custom domain | Alternative if integration advantages outweigh its credit and membership constraints.                              |
| Render paid fallback                                 | From $7/month per web service; an additional $25/month if a Pro workspace is needed |               Supplied address or paid custom domain | Service and workspace costs are separate; sponsor approval required.                                               |

Database cost is excluded because the sponsor supplies it and Data owns it. These estimates also exclude map services and infrastructure belonging to other workstreams.

Following project owner review and sponsor approval, the sponsor would create the hosting account. Platform would configure the P1 deployment workflow and keep landing-page deployment disabled until the host and P3 public copy are approved. The proposed production workflow deploys only after successful CI on `main`, with host-managed automatic deployment configured to preserve that gate. Unrelated repository changes would be excluded from deployment to conserve the allowance. Repository Actions variables can be managed with Write access, including Maintain, as documented in [GitHub's repository-variable permissions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables#creating-configuration-variables-for-a-repository).

## Approval scope and implementation conditions

The current approval request covers the initial landing-page host and sponsor-owned account model. It does not authorize paid hosting, a domain purchase, or a later full-app deployment.

- Landing-page deployment is conditional on sponsor approval of the host and public copy.
- A custom-domain purchase is conditional on sponsor selection and approval, with exact-name registrar availability and checkout/renewal prices confirmed beforehand.
- A later full-app deployment remains subject to a separate proposal supported by host compatibility and sponsor-PostgreSQL reachability results.

No accounts have been created, domains purchased, or applications deployed as part of this research. This document records a proposed decision awaiting approval.
