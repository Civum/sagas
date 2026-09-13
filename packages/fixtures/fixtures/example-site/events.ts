/**
 * Example site — contribution event log
 * =====================================
 *
 * One place, sixty-four contributions, four snapshots. This is the only
 * hand-written file in the fixtures; everything else is calculated from it.
 *
 * THIS CONTENT IS INVENTED. The building, street address, and city are real.
 * Every contributor, family, and remembered event below is fictional and was
 * written to exercise the data model. Nothing here is a record of any real
 * person's testimony and none of it should be cited, displayed publicly, or
 * shown to community members as though it were.
 *
 * Surnames were chosen to be plausibly Basque in form while avoiding the
 * families documented in connection with this building. Any resemblance to
 * real Boise families is unintended.
 *
 * The Euskara sample text is approximate and has NOT been reviewed by a
 * speaker. It must be reviewed before this fixture is shown to anyone outside
 * the development teams.
 *
 * Authored as an append-only log. States are derived, never authored. See
 * ../../src/reduce.ts.

 */

import type { ContributionEvent } from '../../src/events';

const SITE = 'site-anduiza';

export const events: ContributionEvent[] = [
  /* ================================================================ */
  /* STATE t0 — January 2026. One contributor, one family, no          */
  /* corroboration. Everything here is single-source and low weight.   */
  /* ================================================================ */

  {
    id: 'ev-001', at: '2026-01-08T16:02:00Z', actorId: 'system',
    kind: 'site_created',
    siteId: SITE,
    slug: 'anduiza-hotel-fronton',
    name: 'Anduiza Hotel and Fronton',
    aka: ['the fronton', "Anduiza's", 'the handball court', 'the old boarding house'],
    coordinates: [-116.20331, 43.61533],
    address: '620 W Grove St',
    city: 'Boise, Idaho',
  },

  {
    id: 'ev-002', at: '2026-01-08T16:04:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-marisol',
    displayName: 'Marisol Etxeberria',
    lineageId: 'lin-etxeberria',
  },

  {
    id: 'ev-003', at: '2026-01-08T16:20:00Z', actorId: 'c-marisol',
    kind: 'record_submitted',
    recordId: 'rec-001',
    siteId: SITE,
    // A written record, typed into the submission form. No files at all, which
    // is the most common kind of contribution and the one easiest to forget
    // when you have been building an upload pipeline.
    //
    // Two claims come out of this one record. That relationship is the reason
    // records and claims are separate things.
    text:
      'I want to put down what I know about the Anduiza building on Grove Street, from my ' +
      'great-grandmother and from my mother after her. Two things really: the boarding side of it, ' +
      'and the fronton at the back.',
    language: 'en',
    submission: 'published',
  },

  {
    id: 'ev-004', at: '2026-01-08T16:22:00Z', actorId: 'c-marisol',
    kind: 'claim_submitted',
    claimId: 'cl-boarding',
    recordId: 'rec-001',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'The Anduiza building on Grove Street took in Basque sheepherders when they came off the range. ' +
      'My great-grandmother cooked there. She started in 1922, a few years after she came over, and she ' +
      'stayed in that kitchen until the boarding side of it shut down.',
    elements: [
      { id: 'cl-boarding-e-date', kind: 'date', value: '1922', excerpt: 'She started in 1922' },
      { id: 'cl-boarding-e-use', kind: 'event', value: 'boarding house for sheepherders', excerpt: 'took in Basque sheepherders' },
      { id: 'cl-boarding-e-place', kind: 'place', value: '620 W Grove St', excerpt: 'The Anduiza building on Grove Street' },
      { id: 'cl-boarding-e-person', kind: 'person', value: 'great-grandmother, cook', excerpt: 'My great-grandmother cooked there' },
    ],
    topics: ['boarding house', 'sheepherding', 'women\'s work', 'immigration'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-005', at: '2026-01-08T16:41:00Z', actorId: 'c-marisol',
    kind: 'claim_submitted',
    claimId: 'cl-fronton',
    recordId: 'rec-001',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'There was a handball court built into the back of the building, behind the sleeping rooms. ' +
      'The men played in the winter when there was no work on the range. My mother said you could ' +
      'hear it through the floor.',
    elements: [
      { id: 'cl-fronton-e-place', kind: 'place', value: 'rear of building', excerpt: 'built into the back of the building' },
      { id: 'cl-fronton-e-use', kind: 'event', value: 'handball court / fronton', excerpt: 'a handball court' },
      { id: 'cl-fronton-e-season', kind: 'event', value: 'winter use', excerpt: 'played in the winter' },
    ],
    topics: ['pilota', 'fronton', 'recreation', 'sheepherding'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-006', at: '2026-01-09T02:10:00Z', actorId: 'c-marisol',
    kind: 'record_submitted',
    recordId: 'rec-002',
    siteId: SITE,
    text:
      'Something else I remembered this evening, about what was on the lot before the building went up.',
    language: 'en',
    submission: 'published',
  },

  {
    id: 'ev-007', at: '2026-01-09T02:15:00Z', actorId: 'c-marisol',
    kind: 'claim_submitted',
    claimId: 'cl-prelot',
    recordId: 'rec-002',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'Before the boarding house there was a livery stable on that lot. That is what I was told, ' +
      'though I do not know who ran it or when it went.',
    elements: [
      { id: 'cl-prelot-e-use', kind: 'event', value: 'livery stable', excerpt: 'a livery stable on that lot' },
      { id: 'cl-prelot-e-seq', kind: 'date', value: 'before boarding house', excerpt: 'Before the boarding house' },
    ],
    topics: ['prior use', 'lot history'],
    sourceType: 'family_oral',
  },

  /* ================================================================ */
  /* STATE t1 — March 2026. Corroboration arrives, but note that one   */
  /* of the two new affirmers shares a family line with the original   */
  /* contributor. Volume rises; independence does not. A claim is      */
  /* also submitted in Euskara and sits outside the graph.             */
  /* ================================================================ */

  {
    id: 'ev-008', at: '2026-02-14T19:30:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-joseba',
    displayName: 'Joseba Iriondo',
    lineageId: 'lin-iriondo',
  },

  {
    id: 'ev-009', at: '2026-02-14T19:44:00Z', actorId: 'c-joseba',
    kind: 'claim_affirmed',
    affirmationId: 'af-001',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-010', at: '2026-02-14T19:58:00Z', actorId: 'c-joseba',
    kind: 'record_submitted',
    recordId: 'rec-003',
    siteId: SITE,
    // A photograph with a sentence under it. The note is a caption, not an
    // claim, and it is all the text this record will ever have.
    note: 'The court floor, near the left wall. You can see where the boards run different.',
    language: 'en',
    capturedAt: '2026-02-14T19:52:00Z',
    // Read out of the photo. It is precise to about 65 metres and it puts the
    // camera in the middle of Grove Street, because the phone was indoors with
    // no clear sky. Precise and wrong at the same time, which is the whole
    // argument in DESIGN-QUESTIONS about how a record gets a location.
    capturedLocation: {
      coordinates: [-116.20268, 43.61549],
      method: 'embedded',
      accuracyMetres: 65,
    },
    media: [
      {
        mediaId: 'med-003-a', kind: 'image',
        storageKey: 'records/rec-003/med-003-a/court-floor.jpg',
        contentType: 'image/jpeg', byteSize: 3_204_118,
        originalFilename: 'IMG_4471.jpg',
        processing: 'ready', width: 4032, height: 3024,
        capturedAt: '2026-02-14T19:52:00Z',
      },
    ],
    submission: 'published',
  },

  {
    id: 'ev-011', at: '2026-02-14T20:01:00Z', actorId: 'c-joseba',
    kind: 'claim_extended',
    claimId: 'cl-fronton-floor',
    recordId: 'rec-003',
    parentClaimId: 'cl-fronton',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'I played in that court myself as a teenager, so this would be 1963, 1964. By then the boarding ' +
      'was long over and the building was something else, but the court was still there and men still ' +
      'came. The floor was wood and it had a dead spot near the left wall that everybody knew about. ' +
      'You learned to play around it.',
    elements: [
      { id: 'cl-fronton-floor-e-date', kind: 'date', value: '1963-1964', excerpt: 'this would be 1963, 1964' },
      { id: 'cl-fronton-floor-e-mat', kind: 'event', value: 'wood floor', excerpt: 'The floor was wood' },
      { id: 'cl-fronton-floor-e-detail', kind: 'place', value: 'dead spot near left wall', excerpt: 'a dead spot near the left wall' },
    ],
    topics: ['pilota', 'fronton', 'recreation'],
    sourceType: 'firsthand',
  },

  {
    id: 'ev-012', at: '2026-02-20T15:12:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-ana',
    displayName: 'Ana Etxeberria-Woods',
    lineageId: 'lin-etxeberria', // NOTE: same family line as c-marisol.
  },

  {
    id: 'ev-013', at: '2026-02-20T15:20:00Z', actorId: 'c-ana',
    kind: 'claim_affirmed',
    affirmationId: 'af-002',
    claimId: 'cl-boarding',
  },

  {
    id: 'ev-014', at: '2026-02-20T15:21:00Z', actorId: 'c-ana',
    kind: 'claim_affirmed',
    affirmationId: 'af-003',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-015', at: '2026-02-20T15:36:00Z', actorId: 'c-ana',
    kind: 'record_submitted',
    recordId: 'rec-004',
    siteId: SITE,
    text: 'Adding to what my cousin Marisol wrote about the kitchen.',
    language: 'en',
    submission: 'published',
  },

  {
    id: 'ev-016', at: '2026-02-20T15:39:00Z', actorId: 'c-ana',
    kind: 'claim_extended',
    claimId: 'cl-boarding-kitchen',
    recordId: 'rec-004',
    parentClaimId: 'cl-boarding',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'Marisol and I are cousins and this is the same great-grandmother. What I have that she may not ' +
      'is that the kitchen ran two sittings, because the herders came in at different hours depending ' +
      'on whether they were going out or coming back. My grandmother described washing up twice.',
    elements: [
      { id: 'cl-boarding-kitchen-e-op', kind: 'event', value: 'two meal sittings', excerpt: 'the kitchen ran two sittings' },
      { id: 'cl-boarding-kitchen-e-rel', kind: 'attribution', value: 'same lineage as cl-boarding', excerpt: 'Marisol and I are cousins' },
    ],
    topics: ['boarding house', 'women\'s work', 'daily life'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-017', at: '2026-03-02T22:10:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-domingo',
    displayName: 'Domingo Sagastume',
    lineageId: 'lin-sagastume',
  },

  /* A claim given in Euskara. It is kept at its site and readable in the
     original. It has no English rendering yet, so it sits outside the claim
     graph. It stays visible, attributed and untouched, and it is never deleted. */
  {
    id: 'ev-018', at: '2026-03-02T22:25:00Z', actorId: 'c-domingo',
    kind: 'record_submitted',
    recordId: 'rec-005',
    siteId: SITE,
    // Both at once: a recording, and a short summary the contributor typed
    // himself. A record is a bundle, not a file type.
    //
    // This one takes the long route. Audio arrives, a background job works out
    // how long it is and builds something playable, somebody who speaks Euskara
    // writes down what is on it, and somebody else renders that into English.
    // Four people, four months, one contribution.
    note: 'Nire aitonak kontatu zidana. Grabatu dut, hobeto ulertuko delakoan.',
    text:
      'Aitonak esaten zuen frontoia ez zela beti frontoia izan. Lehenago beste zerbait zen, ' +
      'eta gerra ondoren aldatu zuten.',
    language: 'eu',
    media: [
      {
        mediaId: 'med-005-a', kind: 'audio',
        storageKey: 'records/rec-005/med-005-a/domingo-2026-03-02.m4a',
        contentType: 'audio/mp4', byteSize: 41_882_004,
        originalFilename: 'recording.m4a',
        processing: 'uploaded',
      },
    ],
    submission: 'processing',
  },

  {
    id: 'ev-019', at: '2026-03-02T22:31:00Z', actorId: 'c-domingo',
    kind: 'claim_submitted',
    claimId: 'cl-domingo',
    recordId: 'rec-005',
    siteId: SITE,
    sourceLanguage: 'eu',
    awaitingTranslation: true,
    sourceLanguageText:
      'Gure aitona hemen bizi izan zen. Neguan pilotan jokatzen zuten atzeko aldean. ' +
      'Guretzat gure etxea zen, ez ostatu bat.',
    text: '', // no rendering exists yet
    elements: [],
    topics: ['boarding house', 'pilota', 'family'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-020', at: '2026-03-02T22:41:00Z', actorId: 'system',
    kind: 'media_processed',
    mediaId: 'med-005-a',
    recordId: 'rec-005',
    processing: 'ready',
    durationSeconds: 247,
    // Derivatives are disposable. Everything here can be rebuilt from the
    // original, and nothing should point at one as though it were the source.
    derivatives: [
      {
        kind: 'transcode',
        storageKey: 'records/rec-005/med-005-a/derived/playback.opus',
        contentType: 'audio/ogg', byteSize: 2_104_880,
      },
      {
        kind: 'waveform',
        storageKey: 'records/rec-005/med-005-a/derived/waveform.json',
        contentType: 'application/json', byteSize: 8_442,
      },
    ],
    submission: 'awaiting_transcript',
  },

  {
    id: 'ev-021', at: '2026-03-05T18:02:00Z', actorId: 'c-joseba',
    kind: 'passover_recorded', passoverId: 'pv-001', claimId: 'cl-boarding', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-022', at: '2026-03-05T18:03:00Z', actorId: 'c-joseba',
    kind: 'passover_recorded', passoverId: 'pv-002', claimId: 'cl-prelot', passoverKind: 'dont_know',
  },
  {
    id: 'ev-023', at: '2026-03-11T17:45:00Z', actorId: 'c-ana',
    kind: 'passover_recorded', passoverId: 'pv-003', claimId: 'cl-prelot', passoverKind: 'dont_know',
  },
  {
    id: 'ev-024', at: '2026-03-11T17:52:00Z', actorId: 'c-domingo',
    kind: 'passover_recorded', passoverId: 'pv-004', claimId: 'cl-fronton', passoverKind: 'sounds_right',
  },

  /* ================================================================ */
  /* STATE t2 — May 2026. A documentary source arrives and contests    */
  /* one element of an otherwise well-supported claim. The Euskara     */
  /* claim receives a rendering and enters the graph.                  */
  /* ================================================================ */

  {
    id: 'ev-025', at: '2026-04-06T14:00:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-maite',
    displayName: 'Maite Elorriaga',
    institution: 'Basque Museum & Cultural Center',
  },

  {
    id: 'ev-026', at: '2026-04-06T14:30:00Z', actorId: 'c-maite',
    kind: 'record_submitted',
    recordId: 'rec-006',
    siteId: SITE,
    note: 'Page 14 of the boarding register, scanned at 600dpi. Museum holding, catalogued.',
    language: 'en',
    // The register itself is from 1914. That is when the thing was made, which
    // is not when it was handed over, which is why both dates exist.
    capturedAt: '1914-01-01T00:00:00Z',
    // No capturedLocation. A sheet of paper does not have one, and inventing
    // something here would be worse than leaving it out.
    media: [
      {
        mediaId: 'med-006-a', kind: 'document',
        storageKey: 'records/rec-006/med-006-a/register-p14.tif',
        contentType: 'image/tiff', byteSize: 88_204_412,
        originalFilename: 'BMCC_reg_014.tif',
        processing: 'ready', width: 5100, height: 7020,
      },
    ],
    submission: 'published',
  },

  {
    id: 'ev-027', at: '2026-04-06T14:35:00Z', actorId: 'c-maite',
    kind: 'claim_extended',
    claimId: 'cl-register',
    recordId: 'rec-006',
    parentClaimId: 'cl-boarding',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'We hold a boarding register from this building. The earliest entries in our copy are from 1914, ' +
      'which is earlier than the date given in the account above. The register does not name kitchen ' +
      'staff, so it neither confirms nor contradicts who was cooking.',
    elements: [
      { id: 'cl-register-e-date', kind: 'date', value: '1914', excerpt: 'The earliest entries in our copy are from 1914' },
      { id: 'cl-register-e-doc', kind: 'attribution', value: 'boarding register, museum holding', excerpt: 'We hold a boarding register' },
      { id: 'cl-register-e-limit', kind: 'attribution', value: 'register omits staff', excerpt: 'The register does not name kitchen staff' },
    ],
    topics: ['boarding house', 'documentary record'],
    sourceType: 'institutional',
  },

  /* The dispute targets ONLY the date element. Place, use, and person on the
     same claim remain undisputed. This is the granular-resolution case. */
  {
    id: 'ev-028', at: '2026-04-06T14:42:00Z', actorId: 'c-maite',
    kind: 'claim_disputed',
    edgeId: 'dis-001',
    targetClaimId: 'cl-boarding',
    targetElementId: 'cl-boarding-e-date',
    reasoning:
      'The register in our holdings has entries from 1914. The 1922 date may be when this particular ' +
      'cook began rather than when the boarding operation started. Those are different claims and the ' +
      'account may be conflating them.',
    proposedValue: '1914',
  },

  {
    id: 'ev-029', at: '2026-04-06T15:10:00Z', actorId: 'c-maite',
    kind: 'transcript_submitted',
    transcriptId: 'tr-001',
    recordId: 'rec-005',
    language: 'eu',
    // Written down by a person, in the language it was spoken in. This is not a
    // translation and it is not a claim. It is what the recording says.
    //
    // Note who did it: not the person who recorded it. A record can outlive
    // the moment its contributor had time to sit and type, and somebody else
    // picking it up is a contribution with a name on it.
    text:
      'Aitonak esaten zuen frontoia ez zela beti frontoia izan. Lehenago beste zerbait zen han, ' +
      'eta gerra ondoren aldatu zuten. Berak gogoratzen zuen zorua nolakoa zen lehen, eta ez zela ' +
      'berdina gero. Baina hori entzun zuen, ez zuen ikusi.',
    method: 'human',
    submission: 'published',
  },

  {
    id: 'ev-030', at: '2026-04-11T20:18:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-robert',
    displayName: 'Robert Mendive',
  },

  {
    id: 'ev-031', at: '2026-04-11T20:40:00Z', actorId: 'c-robert',
    kind: 'claim_disputed',
    edgeId: 'dis-002',
    targetClaimId: 'cl-prelot',
    targetElementId: 'cl-prelot-e-use',
    reasoning:
      'City directories for the 1890s list a blacksmith at this address, not a livery. I have not found ' +
      'a livery listed on this lot in any year I checked.',
    proposedValue: 'blacksmith shop',
  },

  {
    id: 'ev-032', at: '2026-04-11T20:55:00Z', actorId: 'c-robert',
    kind: 'claim_affirmed',
    affirmationId: 'af-004',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-033', at: '2026-04-18T16:05:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-kepa',
    displayName: 'Kepa Larrañaga',
    lineageId: 'lin-larranaga',
  },

  /* The rendering lands. cl-domingo now enters the claim graph. */
  {
    id: 'ev-034', at: '2026-04-18T16:33:00Z', actorId: 'c-kepa',
    kind: 'translation_submitted',
    translationId: 'tr-001',
    claimId: 'cl-domingo',
    targetLanguage: 'en',
    text:
      'Our grandfather lived here. In winter they played pilota at the back. For us it was the boarding ' +
      'house, not a hotel.',
  },

  {
    id: 'ev-035', at: '2026-04-19T15:10:00Z', actorId: 'c-maite',
    kind: 'claim_affirmed',
    affirmationId: 'af-005',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-036', at: '2026-04-25T23:41:00Z', actorId: 'c-joseba',
    kind: 'claim_affirmed',
    affirmationId: 'af-006',
    claimId: 'cl-domingo',
  },

  {
    id: 'ev-037', at: '2026-05-02T17:22:00Z', actorId: 'c-ana',
    kind: 'claim_disputed',
    edgeId: 'dis-003',
    targetClaimId: 'cl-boarding',
    targetElementId: 'cl-boarding-e-date',
    reasoning:
      'Our family has always said 1922 and there is a photograph dated that year with her in the ' +
      'kitchen doorway. I am not disputing that the building took boarders earlier. I am saying 1922 ' +
      'is right for her.',
    proposedValue: '1922',
  },

  {
    id: 'ev-038', at: '2026-05-09T14:08:00Z', actorId: 'c-robert',
    kind: 'claim_disputed',
    edgeId: 'dis-004',
    targetClaimId: 'cl-boarding',
    targetElementId: 'cl-boarding-e-date',
    reasoning:
      'A 1916 newspaper notice advertises rooms at this address for herders. That predates 1922 by six ' +
      'years and is independent of the museum register.',
    proposedValue: '1914',
  },

  {
    id: 'ev-039', at: '2026-05-09T14:30:00Z', actorId: 'c-robert',
    kind: 'passover_recorded', passoverId: 'pv-005', claimId: 'cl-fronton-floor', passoverKind: 'dont_know',
  },
  {
    id: 'ev-040', at: '2026-05-14T19:00:00Z', actorId: 'c-kepa',
    kind: 'passover_recorded', passoverId: 'pv-006', claimId: 'cl-boarding', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-041', at: '2026-05-14T19:02:00Z', actorId: 'c-kepa',
    kind: 'passover_recorded', passoverId: 'pv-007', claimId: 'cl-prelot', passoverKind: 'dont_care',
  },

  /* ================================================================ */
  /* STATE t3 — July 2026. A competing rendering of the Euskara        */
  /* claim with a dispute about what it loses. A second lineage        */
  /* corroborates the fronton. An extension that could reconcile the   */
  /* livery/blacksmith branch. An unresolved cross-site reference.     */
  /* ================================================================ */

  {
    id: 'ev-042', at: '2026-06-03T21:14:00Z', actorId: 'system',
    kind: 'contributor_registered',
    contributorId: 'c-itxaso',
    displayName: 'Itxaso Zubieta',
    lineageId: 'lin-zubieta',
  },

  /* A second rendering. It does not replace the first. Both coexist, each
     independently attributed. */
  {
    id: 'ev-043', at: '2026-06-03T21:48:00Z', actorId: 'c-itxaso',
    kind: 'translation_submitted',
    translationId: 'tr-002',
    claimId: 'cl-domingo',
    targetLanguage: 'en',
    text:
      'Our grandfather lived here. In winter they played pilota round the back. To us it was our home, ' +
      'not a lodging house.',
  },

  {
    id: 'ev-044', at: '2026-06-03T21:56:00Z', actorId: 'c-itxaso',
    kind: 'translation_disputed',
    disputeId: 'tdis-001',
    translationId: 'tr-001',
    reasoning:
      'The original says "gure etxea" — our home. The first rendering gives this as "the boarding ' +
      'house", which turns the sentence into a fact about the building when the speaker is saying ' +
      'something about belonging. The contrast he is drawing is home against lodging, not boarding ' +
      'house against hotel.',
  },

  {
    id: 'ev-045', at: '2026-06-08T15:30:00Z', actorId: 'c-domingo',
    kind: 'claim_affirmed',
    affirmationId: 'af-007',
    claimId: 'cl-fronton-floor',
  },

  {
    id: 'ev-046', at: '2026-06-08T15:40:00Z', actorId: 'c-domingo',
    kind: 'record_submitted',
    recordId: 'rec-007',
    siteId: SITE,
    text: 'Zerbait gehiago zoruari buruz. Something more about the floor, in English below.',
    language: 'en',
    submission: 'published',
  },

  {
    id: 'ev-047', at: '2026-06-08T15:44:00Z', actorId: 'c-domingo',
    kind: 'claim_extended',
    claimId: 'cl-fronton-deadspot',
    recordId: 'rec-007',
    parentClaimId: 'cl-fronton-floor',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'The dead spot was where a drain had been patched over. My uncle said it was there from the start ' +
      'and nobody ever fixed it properly because it would have meant taking up half the floor.',
    elements: [
      { id: 'cl-fronton-deadspot-e-cause', kind: 'event', value: 'patched drain', excerpt: 'where a drain had been patched over' },
    ],
    topics: ['pilota', 'fronton', 'building fabric'],
    sourceType: 'family_oral',
  },

  {
    id: 'ev-048', at: '2026-06-15T18:20:00Z', actorId: 'c-itxaso',
    kind: 'claim_affirmed',
    affirmationId: 'af-008',
    claimId: 'cl-fronton',
  },

  {
    id: 'ev-049', at: '2026-06-15T18:31:00Z', actorId: 'c-itxaso',
    kind: 'claim_affirmed',
    affirmationId: 'af-009',
    claimId: 'cl-domingo',
  },

  /* An extension that may satisfy the disputeTargets of both branches of the
     livery/blacksmith disagreement, which makes it a reconciliation candidate. */
  {
    id: 'ev-050', at: '2026-06-22T16:08:00Z', actorId: 'c-maite',
    kind: 'record_submitted',
    recordId: 'rec-008',
    siteId: SITE,
    note: 'Fire insurance map excerpt, 1893 sheet, showing the block before the building.',
    language: 'en',
    capturedAt: '1893-01-01T00:00:00Z',
    media: [
      {
        mediaId: 'med-008-a', kind: 'document',
        storageKey: 'records/rec-008/med-008-a/fire-map-1893-sheet-12.png',
        contentType: 'image/png', byteSize: 14_882_101,
        processing: 'ready', width: 3600, height: 2700,
      },
    ],
    submission: 'published',
  },

  {
    id: 'ev-051', at: '2026-06-22T16:12:00Z', actorId: 'c-maite',
    kind: 'claim_extended',
    claimId: 'cl-prelot-both',
    recordId: 'rec-008',
    parentClaimId: 'cl-prelot',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'Both may be right. A Sanborn sheet shows a smithy on the corner of this lot and stabling behind ' +
      'it in the same year. People who remember it as a livery and people who find a blacksmith in the ' +
      'directories are describing different parts of the same yard.',
    elements: [
      { id: 'cl-prelot-both-e-use', kind: 'event', value: 'smithy and stabling coexisting', excerpt: 'a smithy on the corner of this lot and stabling behind it' },
      { id: 'cl-prelot-both-e-doc', kind: 'attribution', value: 'Sanborn fire insurance map', excerpt: 'A Sanborn sheet' },
    ],
    topics: ['prior use', 'lot history', 'documentary record'],
    sourceType: 'documentary',
  },

  {
    id: 'ev-052', at: '2026-06-22T16:20:00Z', actorId: 'c-robert',
    kind: 'claim_affirmed',
    affirmationId: 'af-010',
    claimId: 'cl-prelot-both',
  },

  {
    id: 'ev-053', at: '2026-06-22T16:44:00Z', actorId: 'c-marisol',
    kind: 'claim_affirmed',
    affirmationId: 'af-011',
    claimId: 'cl-prelot-both',
  },

  /* A contributor marks a phrase as pointing at another place. No such site
     exists in the archive yet, so the marker is left unresolved rather than
     dropped. */
  {
    id: 'ev-054', at: '2026-06-26T18:12:00Z', actorId: 'c-robert',
    kind: 'record_flagged',
    flagId: 'fl-001',
    recordId: 'rec-005',
    reason: 'not_mine_to_share',
    // The hardest kind of report, and the one the model has no answer for. The
    // record is published, four months of other people's work sits on top of it,
    // and somebody is saying part of it was never theirs to give.
    //
    // Nothing downstream knows what to do when this is upheld. That gap is
    // written up in DESIGN-QUESTIONS under "Can someone take their record back?"
    reasoning:
      'There is a second voice on this recording from about 3:10 on. That is my aunt, and she did ' +
      'not know it was being kept. I am not asking for the whole thing to go, but somebody should ' +
      'ask her before it stays up.',
  },

  {
    id: 'ev-055', at: '2026-07-02T19:05:00Z', actorId: 'c-kepa',
    kind: 'reference_marked',
    edgeId: 'ref-001',
    fromClaimId: 'cl-fronton-floor',
    excerpt: 'men still came',
    resolved: false,
  },

  {
    id: 'ev-056', at: '2026-07-02T19:26:00Z', actorId: 'c-kepa',
    kind: 'record_submitted',
    recordId: 'rec-009',
    siteId: SITE,
    // The claim below comes from the typed text. The recording is long and is
    // still being worked on when this log ends, so the record is usable and
    // incomplete at the same time.
    //
    // An interface has to show this without implying the upload failed. A file
    // in `processing` is a job still running, not an error.
    text:
      'On the late nights after the dances, people stayed in the court. I have a recording of my ' +
      'uncle talking about it but it is long, I have put it up anyway.',
    language: 'en',
    media: [
      {
        mediaId: 'med-009-a', kind: 'audio',
        storageKey: 'records/rec-009/med-009-a/uncle-interview.wav',
        contentType: 'audio/wav', byteSize: 604_331_820,
        originalFilename: 'uncle interview full.wav',
        processing: 'processing',
      },
    ],
    submission: 'processing',
  },

  {
    id: 'ev-057', at: '2026-07-02T19:30:00Z', actorId: 'c-kepa',
    kind: 'claim_extended',
    claimId: 'cl-afterhours',
    recordId: 'rec-009',
    parentClaimId: 'cl-fronton-floor',
    siteId: SITE,
    sourceLanguage: 'en',
    text:
      'The men who came in the sixties were mostly walking over from the Center after supper. It was ' +
      'not a boarding house crowd by then, it was whoever wanted a game.',
    elements: [
      { id: 'cl-afterhours-e-origin', kind: 'place', value: 'the Center', excerpt: 'walking over from the Center' },
      { id: 'cl-afterhours-e-date', kind: 'date', value: '1960s', excerpt: 'The men who came in the sixties' },
    ],
    topics: ['pilota', 'community', 'recreation'],
    sourceType: 'community_oral',
  },

  {
    id: 'ev-058', at: '2026-07-02T19:33:00Z', actorId: 'c-kepa',
    kind: 'reference_marked',
    edgeId: 'ref-002',
    fromClaimId: 'cl-afterhours',
    excerpt: 'the Center',
    resolved: false,
  },

  {
    id: 'ev-059', at: '2026-07-09T14:50:00Z', actorId: 'c-maite',
    kind: 'claim_affirmed',
    affirmationId: 'af-012',
    claimId: 'cl-afterhours',
  },

  {
    id: 'ev-060', at: '2026-07-09T15:02:00Z', actorId: 'c-joseba',
    kind: 'claim_affirmed',
    affirmationId: 'af-013',
    claimId: 'cl-afterhours',
  },

  {
    id: 'ev-061', at: '2026-07-14T20:11:00Z', actorId: 'c-itxaso',
    kind: 'passover_recorded', passoverId: 'pv-008', claimId: 'cl-register', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-062', at: '2026-07-14T20:14:00Z', actorId: 'c-domingo',
    kind: 'passover_recorded', passoverId: 'pv-009', claimId: 'cl-prelot-both', passoverKind: 'dont_know',
  },
  {
    id: 'ev-063', at: '2026-07-14T20:16:00Z', actorId: 'c-marisol',
    kind: 'passover_recorded', passoverId: 'pv-010', claimId: 'cl-fronton-deadspot', passoverKind: 'sounds_right',
  },
  {
    id: 'ev-064', at: '2026-07-21T18:40:00Z', actorId: 'c-robert',
    kind: 'passover_recorded', passoverId: 'pv-011', claimId: 'cl-domingo', passoverKind: 'dont_know',
  },
];

/** The four instants states are cut at. Labels are shown in the version timeline. */
export const stateCuts = [
  { stateId: 't0', label: 'Single claim, no corroboration', asOf: '2026-01-31T23:59:59Z' },
  { stateId: 't1', label: 'Family corroboration and an untranslated claim', asOf: '2026-03-31T23:59:59Z' },
  { stateId: 't2', label: 'Documentary source contests a date; rendering arrives', asOf: '2026-05-31T23:59:59Z' },
  { stateId: 't3', label: 'Competing renderings, reconciliation candidate, active dispute', asOf: '2026-07-31T23:59:59Z' },
];
