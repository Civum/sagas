# Software Requirements Specification

## Sagas — Experience Layer

| Document control     | Value                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| Course / team        | CSE 397; BYU–Idaho Experience team                                       |
| Sponsor              | Civum PBC                                                                |
| Version              | 0.1 — review draft                                                       |
| Prepared             | 2026-10-07 (America/Edmonton)                                            |
| Approval status      | Unapproved; for classmate review and sponsor clarification               |
| Semester             | Fall 2026                                                                |
| Sponsor baseline     | `Civum/sagas`, `main`, commit `e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a` |
| Class fork baseline  | `byui-cse397/2026.3FallCSE397PCP_sagasCustomer`, `main`, same commit     |
| Shared contract      | 2.1.0 [S14]                                                              |
| Branch / publication | Not created or published as part of this draft                           |

> **Evidence rule:** This draft restates documented sponsor expectations. It does not authorize new features, resolve open sponsor questions, or certify that the scaffold implements the requirements. Every requirement has a source; unresolved details remain gaps.

## Contents

1. [Introduction](#1-introduction)
2. [Overall description](#2-overall-description)
3. [External interfaces and data](#3-external-interfaces-and-data)
4. [Functional requirements](#4-functional-requirements)
5. [Quality requirements and constraints](#5-quality-requirements-and-constraints)
6. [Delivery and acceptance](#6-delivery-and-acceptance)
7. [Gaps and questions](#7-gaps-and-questions)
8. [References](#8-references)
9. [Review and change record](#9-review-and-change-record)

## 1. Introduction

### 1.1 Purpose

Specify the sponsor-documented behavior and constraints for the Experience layer of Sagas so the CSE 397 team can review scope, implement work, and agree on acceptance. This is a layer SRS, not a specification of the entire three-university system.

### 1.2 Standards approach

This document uses an IEEE-style SRS organization: introduction, overall description, interfaces, identifiable requirements, quality constraints, verification, and traceability. ISO/IEC/IEEE 29148:2018 is the requirements-engineering reference. IEEE 830-1998 is a historical SRS-outline reference and is superseded. See [N01] and [N02].

This is an adapted draft, not a claim of full standards conformance. No course-specific template or edition has been supplied. The requesting teammate confirmed that no sponsor material outside the repository is currently available. The standards inform document organization; they do not supply product requirements.

### 1.3 Product purpose and scope

Sagas is a map-based archive of what people know about places. Contributions remain attributed and attached to a place. Differences in recollection remain part of the record. [S01]

The Experience team builds the reading product: component library, map and discovery, narrative page and claim exploration, suggestion interface, references, read model, browser read API, pipeline, hosting work, and landing page. The team may design contributing against invented data; real submissions use the Content layer's API. [S01, S02, S05]

Scope exclusions and deferred work:

| Item                                                                                                          | Boundary                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Uploads, audio recording, media processing, record submission, claim intake, translation workflow, moderation | Content owns the working implementation. Experience displays their results and may prototype contributing against invented data. [S01, S02, S05] |
| Claim scoring, trust, independence calculations, suggestion routing, section grouping, synthesis              | Intelligence owns these decisions/algorithms. Experience consumes the contract and fixture stand-ins. [S01, S02, S05, S13]                       |
| Contracts and shared fixtures                                                                                 | Sponsor-owned; changes require an upstream PR and sponsor decision. [S02]                                                                        |
| Heritage trails                                                                                               | Later; outside current semester scope. [S01, S10]                                                                                                |
| Contributor milestones and score dashboards                                                                   | Cut this semester. [S01, S09, S10]                                                                                                               |
| Creating a site from an address-search pin                                                                    | Explicitly outside Experience work. [S03, B2]                                                                                                    |
| Authentication / logins                                                                                       | This semester uses guest profiles, not logins. [S01, S09]                                                                                        |
| Mailing-list form, PR previews, Kubernetes/Helm, second service language, full-app hosting                    | Later by proposal; not approved deliverables in this draft. [S02]                                                                                |
| Researcher search across sites, citation formatting, export, record ratings                                   | Open design work; no invented implementation requirement. [S02, S06]                                                                             |

### 1.4 Terminology and conventions

| Term            | Meaning                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| Site            | A place designated meaningful; records and claims attach to it.                               |
| Record          | Material somebody hands over; may contain text and several media items.                       |
| Claim           | A person's reading of a record; disagreement targets claims.                                  |
| Detail          | One assertion within a claim, such as a date, person, or place.                               |
| Source record   | The single record the claim's conversation started from.                                      |
| Evidence record | An optional record attached to support a claim.                                               |
| Rendering       | An attributed transcript or translation; several can coexist.                                 |
| Renderer        | Experience code that displays contract data; distinct from a rendering.                       |
| Profile         | This semester, a guest ID held in browser storage.                                            |
| Passover        | A light reading signal: `sounds_right`, `dont_know`, or `dont_care`; not a vote.              |
| Corroboration   | Support from independent records, not agreement headcount.                                    |
| t0–t3           | Fixture snapshots for development and verification; not a required production history format. |

Definitions are from [S01, S05, S09, S13]. “Account” is not a project domain term. “Conversation” is a working idea; group by source record rather than making it a committed domain entity. [S01, S06]

**Shall** below denotes an obligation extracted from sponsor material, pending review of this SRS. **Should** preserves a source recommendation. **TBD** means the evidence does not settle a detail. Sources [Sxx] link to the inspected commit. Story IDs retain the sponsor's scheduling meaning: “Later” means waiting on dependencies; “Draft” means direction requiring refinement. These are not invented priority ratings.

## 2. Overall description

### 2.1 Product context and three-university ownership

| Layer / owner                          | Responsibility                                            | Repository areas                                                                             |
| -------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Experience / this team                 | Reading product and its infrastructure                    | `apps/web`, `apps/ui-api`, `packages/read-model`; landing app location remains a team choice |
| Content / another university team      | Working contribution interface and media/record pipeline  | `apps/capture-api`, `apps/capture-web`                                                       |
| Intelligence / another university team | Claim graph, scoring, synthesis, exploration intelligence | `apps/graph-api`                                                                             |
| Sponsor                                | Shared schemas and development fixtures                   | `packages/contracts`, `packages/fixtures`                                                    |

Each layer has its own database and schema. A layer does not read another layer's tables. Shared contracts and fixtures allow development without waiting for another team's implementation. [S01, S02, S11]

The other universities' names, contacts, integration dates, and agreed API handoffs are not supplied here; see G01 and G06.

### 2.2 Users and characteristics

The sponsor identifies readers who know something about a place and may add to it, and historians/archivists who may eventually use the archive for research. Readers may use phones, keyboards, screen readers, and languages other than English. These are described audiences, not a new roles/permissions model. [S02, S03, S07]

### 2.3 Operating environment

The supplied web scaffold uses Next.js, React, TypeScript, Tailwind, and a pnpm workspace. Local setup specifies Node 22.10 or later, pnpm 9, Docker, and Postgres/PostGIS for the Experience read model. Mapbox rendering requires a developer token; the list works without one. [S01, S03, S09–S12, S17]

Hosting provider, domain, migration tool, database schema, and API framework are not chosen by this SRS. The sponsor's decision process is in §6.1. Browser support, phone viewport criteria, deployment sizing, and runtime service levels are TBD.

### 2.4 Dependencies and known limitations

- Only the corner-shop fixture currently has authored sections and passages. Other sites may have claims but no sections; no-section rendering must remain useful. [S07, S13]
- Fixture media keys do not refer to actual files. Media bytes are Content work; metadata-based demonstrations must not be mistaken for working playback. [S07]
- There is no synthesis endpoint this semester. The page can be built from derived fixture states; an undocumented narrative service is not a dependency. [S07, S10]
- Fixture weight arithmetic is a rendering stand-in, not the real scoring algorithm. [S01, S07]
- Several closed decisions are not in contract 2.1.0 yet. The draft distinguishes current shapes from intended changes in §7.2. [S13–S15]
- A hosted database and approved service sign-ups are sponsor-provided. “Provided” is a documented commitment, not a verification that access is ready. [S02]

No additional product assumptions have been adopted.

## 3. External interfaces and data

### 3.1 User interfaces

Required interface areas are the map and equivalent list, site narrative page, phrase-to-claim exploration, detail disputes, attribution/source display, transcripts/translations, suggestion design, and landing page. The component library supports these views. The page model is informational, not a prescribed visual style. [S02–S06]

The fixture-state control may live on `/dev`; it is a development/verification tool. This draft does not require a production timeline. [S03, N3]

### 3.2 Software interfaces

| Interface                  | Documented contract or constraint                                                                        | Unresolved detail                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Web server → read model    | Server components directly import `@sagas/read-model`. [S11, S12]                                        | Database/query implementation                             |
| Browser → read API         | `apps/ui-api` serves read-only archive/map/search data; current web API routes also exist. [S10, S11]    | Route ownership, paths, payloads, versioning, errors; G06 |
| Read model → Experience DB | `listSites()` and `getSiteState()` migrate from fixtures to Postgres; shared query home. [S03, Da1; S12] | Async/signature changes for spatial filtering; G06        |
| Experience → shared data   | Contract 2.1.0 shapes and fixture states. [S13, S14]                                                     | Contract adoption and changes under §7.2                  |
| Map → Mapbox               | Map renders with a token; list remains usable without it. [S03, B1/B3]                                   | Address-search service, allowance, storage terms; G05     |
| Experience → Content       | Real submissions go through Content's API. [S02, S05]                                                    | Endpoints and handoff behavior; G06                       |
| Intelligence → Experience  | Shared shapes and invented signals now; real scoring/routing later. [S05–S07]                            | Delivery/update mechanism; G06                            |

No unprovided endpoints, event buses, authentication schemes, or transport guarantees are specified.

### 3.3 Data requirements

**EXP-DAT-01.** The Experience read model shall preserve the data needed to display sites, records, claims/details, source/evidence relationships, contributor attribution, disputes, extensions, renderings, sections, and compositions as represented by the shared contract. Its schema shall be shaped for reading and shall not depend on matching another layer's schema. [S01, S03 A5/Da1, S11–S13]

**EXP-DAT-02.** Geographic coordinates shall retain `[longitude, latitude]` order. The spatial store shall use the sponsor-documented `geography(Point, 4326)` approach and a spatial index for map queries. [S17; S03 B4]

**EXP-DAT-03.** Claims shall be grouped by source record rather than a separate “conversation” table; page sections shall come from the shared contract. [S03 A5, S06]

**EXP-DAT-04.** Fixture states shall remain generated from the contribution log, not edited by hand. Seeded copies shall preserve fixture-state distinctions required for verification. [S07; S03 C0/N3]

Retention, backup, deletion, schema evolution, update frequency, and consistency targets are unspecified; G07 and G09.

## 4. Functional requirements

Verification checks in this section are draft checks derived from the source, not test results or additional features.

### 4.1 Map and discovery

| ID         | Requirement                                                                                                                                                                                        | Source / scheduling                              | Verification                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| EXP-MAP-01 | With a Mapbox token, the map shall display fixture sites returned by the read model as pins, centred on the sites. Selecting a site pin shall open its page.                                       | S03 M1/B1; sprint one                            | Render the fixture sites with a token and select a pin.                                 |
| EXP-MAP-02 | The list shall expose every site the map exposes and remain reachable with or without a Mapbox token. Without a token, the map area shall provide the list.                                        | S03 M1/B3; sprint one                            | Compare site sets; repeat without a token and with a screen reader.                     |
| EXP-MAP-03 | Search shall filter sites by name, aliases, and address. The list shall follow the visible map area, and search shall work from the keyboard. Local fixture search shall work without a token.     | S03 M2/B3                                        | Search each field, pan, and repeat by keyboard without a token.                         |
| EXP-MAP-04 | Map pins and list entries shall use site icons identifying the kind of place and approximate documentation level without displaying a score. The list shall describe documentation level in words. | S03 M3/B3; M3 replaces B1 pin band               | Review sparse and richer sites on map/list. Icon vocabulary is a design choice.         |
| EXP-MAP-05 | Address/place search shall suggest matches, move the map to a selected match, drop a result pin, and retain fixture-site pins in view. It shall work with keyboard and screen reader.              | S03 B2; later                                    | Select a search result and open a nearby fixture site. Provider decision remains G05.   |
| EXP-MAP-06 | The map shall request sites within its visible bounding box, and panning shall load newly visible sites through a spatially indexed database query.                                                | S03 B4; later                                    | Query different bounds, pan, and inspect the query/index. No invented timing threshold. |
| EXP-MAP-07 | A record's conflicting embedded location shall not move the site pin. If both locations are shown, their difference shall be intelligible.                                                         | S08 embedded-location-contradicts-the-place; S17 | Inspect example-site t1, rec-003.                                                       |

### 4.2 Narrative and claim exploration

| ID         | Requirement                                                                                                                                                                                                                                                                                                          | Source / scheduling                                                                          | Verification                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| EXP-NAR-01 | Each site shall have a page from which its contributions are reachable. Supplied sections shall display their headings and composition passages.                                                                                                                                                                     | S03 N1; S05/S06                                                                              | Inspect corner-shop t3 and navigate its contributions.                                           |
| EXP-NAR-02 | A site without sections shall show its records on their own as complete contributions, without appearing empty, broken, or failing.                                                                                                                                                                                  | S03 N1; S08 record-with-no-claim                                                             | Inspect corner-shop t0 and sites without authored sections.                                      |
| EXP-NAR-03 | Selecting a marked phrase shall display the claims identified by its composition span, ordered by supplied weight, with extensions beneath their parent claim. Detail-specific spans shall highlight the detail's words. Keyboard users shall be able to select a phrase and return to their prior reading position. | S03 N2; S04                                                                                  | Exercise whole-claim and detail spans, extensions, and keyboard return.                          |
| EXP-NAR-04 | Competing claims shall retain a primary reading based on supplied weight while alternatives remain visible inline. The weight shall not be shown and no reading shall be labelled accepted or settled.                                                                                                               | S01, S06, S07                                                                                | Compare competing claims and inspect visible labels/content. See G02 for prominence ambiguity.   |
| EXP-NAR-05 | A dispute shall affect only its targeted detail. Competing detail readings shall appear together with reasoning and attribution, without a winner or vote count; the original reading shall remain in its sentence. An objection without a proposed value shall still appear with its reasoning.                     | S03 C2; S04 region 6; S08 one-detail-disputed-others-not / competing-readings-shown-together | Inspect corner-shop t2; verify unaffected details and an objection without an alternative value. |
| EXP-NAR-06 | A thin site shall read as early rather than failing. A claim without responses shall not read as rejected. Agreement shall not be represented as independent corroboration.                                                                                                                                          | S02 limits; S06; S08 sparse-site-is-not-empty-site / affirmation-without-independence        | Inspect example-site t0 and corner-shop t1.                                                      |
| EXP-NAR-07 | The development state control shall move between t0, t1, t2, and t3 and re-render the page, including t0 without sections.                                                                                                                                                                                           | S03 N3; later, may be on /dev                                                                | Step through all four corner-shop states.                                                        |

### 4.3 Provenance, records, and language

| ID         | Requirement                                                                                                                                                                                                                                                                                                                | Source / scheduling                                                      | Verification                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| EXP-REF-01 | Every view showing claim text shall provide a path to the claim's author, date, source type, source record, and evidence records. Where claim author and record contributor differ, both shall receive distinct credit.                                                                                                    | S03 C1/C3; S08 attribution cases; S19                                    | Inspect corner-shop t1/t2 and follow each relationship.                        |
| EXP-REF-02 | Source records and evidence records shall be distinguished. From either of two claims sharing a record, the reader shall reach the record, and from the record shall reach both claims.                                                                                                                                    | S08 evidence-is-not-the-source / one-record-many-claims                  | Inspect corner-shop t2 and example-site t0 rec-001.                            |
| EXP-REF-03 | A record containing several media types and text shall not be described as one file type. Transcripts and translations shall be presented as distinct contributions.                                                                                                                                                       | S08 record-is-a-bundle-not-a-file-type / transcript-is-not-a-translation | Inspect example-site rec-005 at t2/t3.                                         |
| EXP-REF-04 | An untranslated claim shall remain readable in its original language and attributed, with a rendering invitation/indication. It shall not disappear, become an empty row, or be sorted last because its weight is zero.                                                                                                    | S03 C4; S08 claim-outside-the-graph; S18                                 | Inspect example-site t1 cl-domingo.                                            |
| EXP-REF-05 | When a rendering arrives, the original shall remain reachable and the rendering shall be credited as a contribution. Multiple renderings shall coexist without an authoritative version; objections about meaning shall remain attached to the versions and visibly intelligible to a reader who cannot read the original. | S08 rendering-arrives / coexisting-renderings; S18                       | Compare example-site t1–t3 cl-domingo.                                         |
| EXP-REF-06 | A record still processing shall remain readable and be presented as work in progress, without a failure label or an instruction to upload again.                                                                                                                                                                           | S08 media-still-processing-is-not-a-failure                              | Inspect example-site t3 rec-009. Failure handling is G08.                      |
| EXP-REF-07 | An unresolved report shall be distinguished from a claim dispute and shall not imply that the record has been reviewed and cleared.                                                                                                                                                                                        | S08 open-flag-on-a-published-record                                      | Inspect example-site t3 rec-005. Resolution handling is G08.                   |
| EXP-REF-08 | A stable link shall identify a single claim for citation rather than requiring a link to the whole page.                                                                                                                                                                                                                   | S06 References: first steps; Epic E remains draft                        | Verify the link reopens that claim. URL form and persistence rules remain G04. |

### 4.4 Suggestions, passovers, and contributor display

EXP-SUG-01 and EXP-SUG-02 express documented direction, not fully accepted implementation stories. Epic D begins with D1's design exercise; detailed build acceptance remains pending.

| ID         | Requirement                                                                                                                                                                                                                                         | Source / status                                                           | Verification                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| EXP-SUG-01 | The suggestion interface shall direct reading/contributing attention using supplied signals rather than popularity, and shall display neither numeric scores nor counts. Initial design shall use invented signals.                                 | S05; S06; S03 D1 draft                                                    | Review D1 mockups and reasoning at a specification meeting; no real routing algorithm required here. |
| EXP-SUG-02 | The reading interaction shall offer the three passover choices “sounds right”, “don't know”, and “don't care” with equal choice prominence and no counts. It shall not provide a downvote or treat signals as votes, quality ratings, or rejection. | S04 region 7; S05/S06; S08 passover-signals-are-not-ratings               | Review proposed interaction; persistence and anti-steering behavior remain G03/G06.                  |
| EXP-SUG-03 | If contributor activity is displayed, its counts shall not be summed into a contributor rating, and zero authored claims/records shall not imply no contribution.                                                                                   | S07; S08 standing-is-counts-not-a-score / contributor-who-authors-nothing | Inspect example-site t3 c-robert. This does not require building a contributor dashboard.            |

### 4.5 Source recommendations retained as recommendations

- **EXP-REC-01:** Claims from separate source records that mention the same detail should not be merged or presented as confirming one another without a linking relationship. [S08, same-detail-separate-conversations; severity: should]
- **EXP-REC-02:** A reconciliation candidate should not be presented as settled. [S08, reconciliation-candidate; severity: should] The broader prohibition on marking anything settled remains mandatory under [S02].

These preserve fixture-case severity rather than silently converting recommendations into new mandatory feature work.

## 5. Quality requirements and constraints

| ID         | Requirement / constraint                                                                                                                                                                              | Source                       | Verification / limitation                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| EXP-QUA-01 | Generic UI components shall meet WCAG 2.1 AA colour contrast requirements; interactive components shall work from the keyboard.                                                                       | S03 A1; S02 design direction | Contrast check and keyboard walkthrough; broader accessibility acceptance remains G09.      |
| EXP-QUA-02 | The reading interface shall work on a phone.                                                                                                                                                          | S02 design direction         | Demonstrate phone use; supported viewport/browser matrix TBD, G09.                          |
| EXP-QUA-03 | Colours, spacing, and type sizes shall be defined once as design tokens used by components. Generic UI primitives shall remain independent of Sagas contract types.                                   | S03 A1/De1; S10              | Inspect tokens and imports.                                                                 |
| EXP-QUA-04 | Pages/route handlers shall obtain data through the shared read model and pass it to display components. Server components shall use the read model directly rather than fetching their own read API.  | S10–S12                      | Inspect query paths; components take props.                                                 |
| EXP-CON-01 | User-facing interfaces shall show no claim score/ranking, agreement headcount, accepted stamp, or settled status. Internal weight-based ordering shall not become a displayed rating.                 | S02 limits; S06/S07          | Review map, narrative, exploration, and suggestion displays.                                |
| EXP-CON-02 | Invented contributor/data status shall remain visible in displays so a development screenshot cannot read as real testimony.                                                                          | S02 limits; S07/S08/S19      | Inspect all claim/source displays and screenshots.                                          |
| EXP-CON-03 | Team-run infrastructure, including the sponsor-provided team database, shall hold only invented data or public record; real testimony and real personal data await sponsor hosting.                   | S02 limits                   | Review data sources and deployment contents before use.                                     |
| EXP-CON-04 | Public copy and material shown outside the team shall receive sponsor approval; no organization shall be named publicly before it agrees.                                                             | S02 decision table/limits    | Record approval before release. P3/De2 presently require copy naming no organization.       |
| EXP-CON-05 | Paid services shall require sponsor approval; proposals shall state monthly costs, and sponsor-approved sign-ups/purchases shall be performed by the sponsor.                                         | S02 limits/decision table    | Inspect decision/proposal records. Personal Mapbox-token guidance conflicts with this; G05. |
| EXP-CON-06 | Shared contract/fixture changes shall be submitted upstream by PR with written reasons for sponsor decision. The Experience team shall not silently change shared schemas for its own implementation. | S02 limits; S21              | Inspect shared-package changes and their review records.                                    |

No response-time, throughput, availability, disaster-recovery, security certification, legal-compliance, or storage-capacity target has been invented. These remain open in §7.

## 6. Delivery and acceptance

### 6.1 Delivery obligations and decision controls

These are sponsor delivery/process expectations, separate from reader-facing product behavior.

| ID         | Obligation                                                                                                                                                                                                                          | Evidence                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| EXP-DEL-01 | Run the existing CI checks on every PR in the fork and block merges on failures. Comment the team's jobs with their purposes.                                                                                                       | S03 P1; S20                |
| EXP-DEL-02 | Prepare a hosting/domain proposal: compare at least three free-tier hosts for static page, web app, API, and Postgres; show monthly costs/free-tier limits; shortlist available domains with yearly prices and recommendations.     | S03 P2                     |
| EXP-DEL-03 | Build a small static landing app and deploy merges to main after hosting and copy approvals. Initial page has no sign-up form or changelog section.                                                                                 | S03 P3/De2                 |
| EXP-DEL-04 | Replace fixture JSON reads with local Postgres reads for the corner shop, preserving the read-model consumer seam and /dev behavior. Document stored versus computed data and propose events-versus-snapshots and weight placement. | S03 Da1/A5                 |
| EXP-DEL-05 | Provide an idempotent seed command that loads every fixture site into a Postgres database selected by connection string.                                                                                                            | S03 Da2/C0                 |
| EXP-DEL-06 | List data missing for map/narrative screens; identify the screen needing each item and propose shared additions upstream with reasons.                                                                                              | S03 Da3                    |
| EXP-DEL-07 | Produce landing/map wireframes, first design tokens, landing-copy draft, and a list of missing/desirable product capabilities for review.                                                                                           | S03 De1–De3                |
| EXP-DEL-08 | Demonstrate landed work at each two-week specification meeting; assess it against the relevant story's “done when”.                                                                                                                 | S02 How the work is judged |
| EXP-DEL-09 | Keep decisions requiring written records in the fork; use the sponsor's standing questions issue for questions. Post specification-meeting questions by 4pm the preceding day.                                                      | S02 How we work            |

The SOW replaces the older first-sprint plan where they disagree; its sprint-one mapping, not Epic A's old ordering, controls this draft. [S02, S03, S09]

Additional backlog work includes containers, hosted database transition/seeding, component tests and automated accessibility checks, upstream-contract drift checks, landing-page changelog, and a Storybook-versus-/dev investigation. This draft does not promote these into sprint one or choose implementation libraries. [S02, S03]

### 6.2 Verification and traceability

The Source and Verification columns provide requirement-level traceability. Verification is planned; no product acceptance checks have been executed for this drafting task.

Use:

1. **Inspection** for architecture, data labels, source relationships, constraints, and approval records.
2. **Demonstration** for map/list parity, keyboard navigation, phrase exploration, phone use, and the four fixture states.
3. **Tests** for meaningful behavior and regressions; use the existing pipeline for fixture-state drift, typechecking, lint, acceptance, and tests. The repository's acceptance command does not by itself prove every rendered interface requirement. [S20]
4. **Sponsor/team review** for qualitative decisions and draft stories, especially suggestion design.

Core review scenarios:

| Scenario                                         | Fixture / subject               | Requirements           |
| ------------------------------------------------ | ------------------------------- | ---------------------- |
| Record without claims                            | corner-shop t0, rec-cs-photo    | EXP-NAR-02, EXP-NAR-07 |
| Thin archive                                     | example-site t0                 | EXP-NAR-06, EXP-MAP-04 |
| Attribution differs from record submission       | corner-shop t1, cl-cs-shop      | EXP-REF-01             |
| Agreement without another record                 | corner-shop t1, cl-cs-shop      | EXP-NAR-06             |
| Source differs from evidence                     | corner-shop t2, cl-cs-uncle     | EXP-REF-01–02          |
| One disputed detail                              | corner-shop t2, cl-cs-shop      | EXP-NAR-05             |
| Same detail in unlinked source groups            | corner-shop t3, cl-cs-sign      | EXP-REC-01             |
| Original → first rendering → multiple renderings | example-site t1–t3, cl-domingo  | EXP-REF-04–05          |
| One record feeding multiple claims               | example-site t0, rec-001        | EXP-REF-02             |
| Mixed media / transcript versus translation      | example-site t2–t3, rec-005     | EXP-REF-03             |
| Conflicting photo GPS                            | example-site t1, rec-003        | EXP-MAP-07             |
| Processing media                                 | example-site t3, rec-009        | EXP-REF-06             |
| Unresolved report                                | example-site t3, rec-005        | EXP-REF-07             |
| Contributor without authored material            | example-site t3, c-robert       | EXP-SUG-03             |
| Reconciliation without adjudication              | example-site t3, cl-prelot-both | EXP-REC-02, EXP-CON-01 |

Fixture guidance requires speaker review of the Euskara sample before it appears in any demo. This review has not been verified. [S07]

### 6.3 Acceptance status

All requirements in this draft are **extracted, unapproved**. Implementation and test status are **not assessed**. Sponsor-authored story readiness is a scheduling indicator, not proof of completion.

Before baselining the SRS, classmates should check extraction accuracy and semester scope, the product owner should resolve ownership/dependency questions, and sponsor answers should be linked beside the affected IDs. Proposal-only features stay outside approved scope unless a recorded decision changes it.

## 7. Gaps and questions

### 7.1 Question register

“Team first” means classmates/product owner can prepare an answer or proposal; it does not bypass an explicit sponsor-approval requirement. “Sponsor” identifies a question that needs sponsor evidence, not a message sent by this draft.

| Gap | Missing decision / question                                                                                                                                                                                                                                        | First route                                                                    | Impact                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| G01 | What are the other two university teams' names, contacts, and agreed integration responsibilities/dates?                                                                                                                                                           | Product owner/team; coordinate with sponsor                                    | Handoffs and dependency planning                 |
| G02 | How should weight-led primary claim ordering coexist with equal-prominence detail alternatives in arrival order, while showing no ranking? Confirm the distinction in the team's design.                                                                           | Team design proposal; sponsor if ambiguous                                     | EXP-NAR-03–05                                    |
| G03 | How will passovers avoid steering readers through order/prominence? What state, feedback, duplicate behavior, and persistence are expected? What are D1's agreed build criteria and supplied signal shape?                                                         | Team D1 proposal, then sponsor/Intelligence                                    | EXP-SUG-01–02                                    |
| G04 | What is the claim-link URL/persistence contract? What citation metadata/format is expected, if any? Is record citation-count display wanted? Researcher export is still open.                                                                                      | Team proposal then sponsor                                                     | EXP-REF-08; Epic E                               |
| G05 | The SOW reserves service sign-ups for the sponsor, but older map guidance permits personal Mapbox token registration. Which instruction applies to developer tokens? What address-search service, allowance, storage terms, host, and domain are approved?         | Sponsor for sign-up conflict; team researches proposal                         | EXP-MAP-01/05, EXP-CON-05, P2                    |
| G06 | Which browser routes live in ui-api versus existing web routes? Define paths/payloads/errors, spatial query signature, Content submission handoff, passover writes, and incoming Intelligence updates. A read-only ui-api does not specify a passover-write route. | Experience team proposal with Content/Intelligence; sponsor for shared changes | Interfaces; EXP-SUG-02; integration              |
| G07 | Events or snapshots in the read store? Where does weight live before/after its move to details? Which migration approach is selected? Does the read-model comment about a scoring pass mean a local derived read or an Intelligence result?                        | Da1 proposal; sponsor/Intelligence clarify ownership                           | EXP-DAT-01; avoids Experience inventing a scorer |
| G08 | What should the UI show for failed processing, upheld reports, withdrawn records, missing references, empty search results, and read/API errors? Several are uncovered or unresolved; do not infer retries, removal, or moderation policy.                         | Team identifies scenarios; sponsor/Content for domain policy                   | Error and lifecycle acceptance                   |
| G09 | Which browsers/phone sizes and accessibility checks define acceptance? What workload and response-time, availability, backup/restore, retention, deployment security, and update-consistency targets are needed? None is quantified here.                          | Team proposes acceptance criteria; sponsor prioritizes                         | Quality/completion criteria                      |
| G10 | Which fixture gaps must the team exercise this semester: all-untranslated site, very long claim, heavy dispute chain, one-claim site, colliding pins, conflicting transcripts, duplicate files, failed media? Is Euskara demo review complete?                     | Team coverage review; sponsor for shared fixtures and language review          | Verification coverage and demo readiness         |
| G11 | What is the intended page treatment when claims exist but sections are absent, beyond showing records? How deep should claim exploration go? How should uncertainty/ambiguous details be worded?                                                                   | Team design proposal; sponsor clarifies                                        | EXP-NAR-01–03 and readability                    |
| G12 | Does the course require IEEE 830 specifically, a supplied template, signatures, or evidence format? Are there sponsor meeting decisions outside this commit? What exact tag/design-lock baseline is agreed?                                                        | Course team/instructor; product owner for sponsor records                      | Document acceptance and source completeness      |
| G13 | Who approves this SRS and what records approval? Which backlog items are committed semester deliverables versus optional later work, and by what dates?                                                                                                            | Product owner and sponsor                                                      | Baseline and release scope                       |

### 7.2 Documented decisions versus implemented contract

| Topic                                                 | Sponsor evidence                                                                                                                                 | Treatment in this draft                                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Affirmation folded into passover                      | Decided, not implemented; coordinated with dispute changes after scorer validation. [S15]                                                        | Preserve current 2.1.0 compatibility; expose three passover concepts without assuming new write/storage APIs.          |
| Dispute becomes a claim                               | Decided, not implemented. [S15]                                                                                                                  | Display current detail disputes; do not silently remodel the sponsor package.                                          |
| Extension targets a detail with whole-claim fallback  | Decided, not implemented; reasoning and fallback shape remain open. [S15]                                                                        | Use current parent-claim relationships; raise missing detail targeting upstream.                                       |
| Weight moves to details                               | Described in SOW/page model; current ClaimState has claim-level weight. [S02, S04, S13]                                                          | Keep weight location a Da1 proposal and contract dependency, not an invented field.                                    |
| Sections/compositions “arrive with the next update”   | Some prose still says this; inspected version is already 2.1.0 and includes them. [S04, S05, S13, S14]                                           | Use the inspected schema. The N1 version dependency is satisfied at this baseline.                                     |
| Optional test tooling versus later backlog            | Web guidance calls rendering tests/accessibility tooling optional; SOW places component tests/accessibility checks behind sprint one. [S02, S10] | Record the later obligation/direction without inventing tooling or sprint-one timing; confirm release scope under G13. |
| Local-only scaffold versus planned deployment         | Older descriptions say local; SOW defines an approved landing deployment and later full-app hosting proposal. [S02, S10]                         | Separate current local setup from approved/proposed deployment work.                                                   |
| No public organization names versus consent condition | SOW allows naming only with agreement; P3/De2 currently say name no organization. [S02, S03]                                                     | Follow the stricter current landing-story acceptance; do not assume consent is already granted.                        |

The only explicitly stated document override used here is the SOW replacing the older first-sprint/start plan where they disagree. Other ambiguities are recorded for review rather than resolved through an invented source hierarchy.

## 8. References

Sponsor links are pinned to the inspected commit so later upstream edits do not silently alter this draft's evidence. They are paraphrased; the linked originals remain authoritative evidence.

| ID  | Source                                                                                                                                                         | Relevant material                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| S01 | [Sponsor overview](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/README.md)                                                     | Layers, and who owns what; main terms; scaffold boundaries                |
| S02 | [Experience statement of work](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/STATEMENT-OF-WORK.md)                     | Scope, limits, design direction, workstreams, sprint one, later proposals |
| S03 | [Experience backlog](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/BACKLOG.md)                                         | Sprint-one stories; A1–A5; B1–B4; C0–C4; D1; Epic E                       |
| S04 | [Page model](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/PAGE-MODEL.md)                                              | Seven regions; t0–t3 examples                                             |
| S05 | [Experience definitions](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/DEFINITIONS.md)                                 | Narrative page; claim exploration; suggestion; record capture             |
| S06 | [Experience direction](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/DIRECTION.md)                                     | Decided behavior and open questions                                       |
| S07 | [Fixture guidance](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/packages/fixtures/README.md)                                   | What your interface has to handle; coverage gaps; boundaries              |
| S08 | [Fixture acceptance cases](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/packages/fixtures/acceptance/cases.ts)                 | Named cases and must/should severity                                      |
| S09 | [Experience start guide](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/docs/START-EXPERIENCE-LAYER.md)                          | Scope updates; guest profiles; team workflow                              |
| S10 | [Web app guidance](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/README.md)                                            | Data flow; component organization; deployment                             |
| S11 | [Read API guidance](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/ui-api/README.md)                                        | Read-only API; direct server reads; database ownership                    |
| S12 | [Read model guidance](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/packages/read-model/README.md)                              | Shared query seam; Postgres; bounding boxes                               |
| S13 | [Shared contract](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/packages/contracts/src/model.ts)                                | Site, record, claim, detail, rendering, GraphState, section/composition   |
| S14 | [Contract version](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/packages/contracts/src/version.ts)                             | CONTRACT_VERSION = 2.1.0                                                  |
| S15 | [Closed questions](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/docs/CLOSED-QUESTIONS.md)                                      | Decided changes that are not yet implemented                              |
| S16 | [Open design questions](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/docs/DESIGN-QUESTIONS.md)                                 | Unresolved domain and interface decisions                                 |
| S17 | [Spatial data guidance](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/docs/GIS.md)                                              | Coordinates, geography/SRID, spatial index, location disagreement         |
| S18 | [Translation component brief](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/src/features/article/TranslationPanel.tsx) | Zero, one, and multiple renderings                                        |
| S19 | [Attribution component brief](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/apps/web/src/features/article/SourcePanel.tsx)      | Attribution and visible fictional flag                                    |
| S20 | [Existing CI workflow](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/.github/workflows/ci.yml)                                  | Fixture drift, typecheck, lint, acceptance, tests                         |
| S21 | [Collaboration policy](https://github.com/Civum/sagas/blob/e8e6789ce98299e24fc7b7e1d655e6c48ea47f8a/docs/WORKING-TOGETHER.md)                                  | Contract adoption, review, freeze windows                                 |

| ID  | Standards / project reference                                                     | Use                                                                                                     |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| N01 | [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html)                | Requirements-engineering and information-item conventions                                               |
| N02 | [IEEE 830-1998 status and description](https://standards.ieee.org/ieee/830/1222/) | Historical SRS outline; explicitly superseded                                                           |
| P01 | [Class fork](https://github.com/byui-cse397/2026.3FallCSE397PCP_sagasCustomer)    | Team review and future branch destination                                                               |
| U01 | Request in the originating chat, 2026-10-07                                       | Experience scope; three-university context; no invented requirements; show draft before branch/evidence |

This source review covers repository files at the baseline. GitHub issues and PR discussions have not been used as requirement evidence; their absence from this review does not mean they contain no relevant decisions. The requesting teammate confirmed that there is currently no sponsor material outside the repository. Course-specific template and approval requirements remain unprovided.

## 9. Review and change record

| Version | Date       | Change                                                                                       | Approval |
| ------- | ---------- | -------------------------------------------------------------------------------------------- | -------- |
| 0.1     | 2026-10-07 | Initial source-based Experience SRS; requirements, boundaries, verification checks, and gaps | Pending  |

Classmate review should focus on whether each “shall” faithfully restates its source, whether any omitted sponsor decisions have evidence, and which gaps deserve a sponsor question versus a team proposal.

Keep requirement IDs stable through edits. Record the source and decision for additions, changes, or deletions; retain open questions until answered. This is a proposed document-maintenance convention, not a new sponsor product requirement.

**Next review step:** show this draft to the requesting teammate. Creating a branch, committing/pushing, opening a PR, and logging this chat as evidence are deferred until that review. This document itself is not a transcript or sponsor approval record.
