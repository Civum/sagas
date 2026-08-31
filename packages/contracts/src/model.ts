/**
 * The data, defined once.
 *
 * Each thing gets a Zod schema and a TypeScript type right next to it. The
 * schema checks data at runtime, when you've read a file or received a request
 * and TypeScript can no longer help you. The type is derived from the schema,
 * so the two can't drift apart.
 *
 * ---
 *
 * These shapes are deliberately flat and repetitive. Look at the three edge
 * types below: every one starts with an id, a contributor, and a timestamp, and
 * nothing captures that. `translationDispute` and `disputeEdge` are the same
 * idea applied to different targets, and nothing captures that either.
 *
 * That is not an accident and it is not finished work. It's written out
 * longhand so you can read the whole thing without decoding an inheritance
 * chain, and so the patterns are yours to find rather than ours to impose.
 * Finding them is part of the job. A pull request that collapses three edge
 * types into one, with a reason, is exactly the kind of contribution we want.
 *
 * `docs/DESIGN-QUESTIONS.md` lists the ones we already know about, along with
 * the arguments on each side. Start there before you refactor anything, and add
 * to it when you find one we missed.
 */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Identifiers                                                         */
/* ------------------------------------------------------------------ */

/**
 * These are all `string` today, which means TypeScript will happily let you
 * pass a claim id where a contributor id belongs. Branding them would fix that.
 * See DESIGN-QUESTIONS.
 */
export type SiteId = string;
export type ClaimId = string;
export type ElementId = string;
export type ContributorId = string;
export type LineageId = string;
export type EventId = string;
export type TranslationId = string;
export type RecordId = string;
export type MediaId = string;
export type TranscriptId = string;
export type FlagId = string;

/* ------------------------------------------------------------------ */
/* Enumerations                                                        */
/* ------------------------------------------------------------------ */

/**
 * Languages a record or a rendering can be in. ISO 639-1 codes.
 *
 *   en  English
 *   eu  Euskara (Basque)
 *   es  Spanish
 *   fr  French
 *
 * Spanish and French are both here because the Basque Country spans the border,
 * and Basque communities in Canada carry French. Expect this list to grow. A
 * record in a language not listed is a reason to add one, never a reason to
 * turn the record away.
 */
export const languageCode = z.enum(['en', 'eu', 'es', 'fr']);
export type LanguageCode = z.infer<typeof languageCode>;

/**
 * How someone came to know a thing. Shown to readers as-is, so they can judge
 * for themselves.
 *
 *   firsthand      "I was there."
 *   family_oral    "My grandmother told me this."
 *   community_oral "This is what people at the Center said."
 *   documentary    "County records show..."
 *   academic       published scholarship
 *   institutional  held by a museum or archive
 *
 * This is never used to reject a contribution. It feeds into how much weight a
 * claim carries, and even then only as one input among several. A firsthand
 * account from someone nobody knows can end up better supported than a
 * published paper.
 */
export const sourceType = z.enum([
  'firsthand',
  'family_oral',
  'community_oral',
  'documentary',
  'academic',
  'institutional',
]);
export type SourceType = z.infer<typeof sourceType>;

/**
 * Rough time period.
 *
 * Deliberately coarse. People remember "during the war" and "when I was young",
 * not dates, and asking someone to pick a year they don't know produces a wrong
 * answer rather than an honest one.
 *
 * This is a known weak point. Storing only the bucket throws away the phrase
 * the contributor actually used, and you can't get it back. See
 * DESIGN-QUESTIONS.
 */
export const era = z.enum([
  'pre_1900',
  'early_immigration_1900_1929',
  'depression_war_1930_1945',
  'postwar_1946_1969',
  'late_century_1970_1999',
  'contemporary_2000_present',
]);
export type Era = z.infer<typeof era>;

/**
 * A low-effort reaction to something a reader scrolled past.
 *
 *   sounds_right  reads as plausible to this person
 *   dont_know     outside what this person can judge
 *   dont_care     not what this person is here for
 *
 * These tune what gets shown to whom. They do not change the graph, and they
 * are not votes. A claim covered in `dont_know` isn't doubted, it just hasn't
 * reached anyone able to speak to it.
 */
export const passoverKind = z.enum(['sounds_right', 'dont_know', 'dont_care']);
export type PassoverKind = z.infer<typeof passoverKind>;

/** How well-supported a claim is, as a label the interface can show. */
export const confidence = z.enum([
  'single_source',
  'corroborated',
  'well_corroborated',
  'contested',
]);
export type Confidence = z.infer<typeof confidence>;

/** What kind of relationship one thing has to another. */
export const edgeType = z.enum(['dispute', 'extension', 'reference']);
export type EdgeType = z.infer<typeof edgeType>;

/* ------------------------------------------------------------------ */
/* Places and people                                                   */
/* ------------------------------------------------------------------ */

/** A physical location that accounts get attached to. */
export const site = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  /**
   * What the community actually calls it. People don't say "the Basque Museum
   * and Cultural Center", they say a nickname, and search has to find it either
   * way.
   */
  aka: z.array(z.string()),
  /** [longitude, latitude]. GeoJSON order, which is what PostGIS and Mapbox want. */
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string(),
  city: z.string(),
  /** Approximate is fine for development. Flagged so nobody cites it as surveyed. */
  coordinatePrecision: z.enum(['approximate', 'surveyed']),
});
export type Site = z.infer<typeof site>;

/** Someone who has contributed. */
export const contributor = z.object({
  id: z.string(),
  displayName: z.string(),
  /**
   * Which family they're from.
   *
   * This is the field doing the most work in the whole model. Two people from
   * the same family agreeing is one source, not two. Without this, a large
   * family can make a shaky claim look well-supported just by showing up.
   */
  lineageId: z.string().optional(),
  /** e.g. "Basque Museum & Cultural Center". A statement of affiliation, not a credential check. */
  institution: z.string().optional(),
  joinedAt: z.string(),
  /**
   * Everyone in the fixtures is invented. This flag exists so nothing
   * downstream can mistake development data for a real person's testimony.
   *
   * It is a boolean rather than a literal `true` so that code checking it is
   * doing real work. If the type could only ever be `true`, every branch that
   * reads it would be dead code, and the check would quietly disappear the
   * first time someone cleaned up a lint warning.
   */
  fictional: z.boolean(),
});
export type Contributor = z.infer<typeof contributor>;

/* ------------------------------------------------------------------ */
/* Records and media                                                   */
/* ------------------------------------------------------------------ */

/**
 * A record is what somebody actually hands over: a recording, a photograph, a
 * letter, a page of typing.
 *
 * It is deliberately the one thing here nobody can argue with. The photograph
 * exists. What people disagree about is what it shows, and that disagreement
 * lands on a claim instead, where it is about a reading rather than about the
 * person who brought the photograph in.
 *
 * The split is also what lets a contribution be small. Someone with a shoebox of
 * photos and one sentence about each can contribute without also being a
 * transcriber and a translator. Somebody else does those parts later and gets
 * credited for them.
 *
 * Claims in the fixtures came before records existed and do not have one, which
 * is why `claim.recordId` is optional. Making it required is a real change and
 * it is written up in DESIGN-QUESTIONS.
 */

/** What kind of thing was handed over. */
export const mediaKind = z.enum(['audio', 'video', 'image', 'document', 'text']);
export type MediaKind = z.infer<typeof mediaKind>;

/**
 * Where one uploaded file has got to.
 *
 * `uploaded` means the bytes arrived and nothing has looked at them yet. A file
 * stuck in `processing` is a stalled job rather than a failed upload, and a
 * contributor should be able to tell which of those happened to their recording.
 */
export const processingState = z.enum(['uploaded', 'processing', 'ready', 'failed']);
export type ProcessingState = z.infer<typeof processingState>;

/**
 * Where a record is in its life.
 *
 * `awaiting_context` and `awaiting_transcript` are separate queues because they
 * need different people. Anyone can add context. A transcript of Euskara audio
 * needs a Euskara speaker, and there are not many of them.
 *
 * Note what is missing. There is no state for a record being taken back. That is
 * not an oversight. "Nothing is deleted" and "a family can change its mind" are
 * both things this project believes and they contradict each other. Until
 * somebody answers that, the state machine has no exit. See DESIGN-QUESTIONS.
 */
export const submissionState = z.enum([
  'draft',
  'submitted',
  'processing',
  'awaiting_context',
  'awaiting_transcript',
  'published',
]);
export type SubmissionState = z.infer<typeof submissionState>;

/**
 * How a record's coordinates were arrived at.
 *
 * `placed` is somebody putting a pin on a map. `geocoded` is derived from a
 * street address. `embedded` is read out of the file, usually a photo's GPS.
 * `inherited` is taken from the place the record is attached to.
 *
 * This list is a starting point and we expect it to be wrong. The requirement it
 * encodes is the part that matters: a record carries a location and says how it
 * got one. A pin somebody's granddaughter dropped and a pin a geocoder produced
 * from a street address are not the same evidence, and storing both as a bare
 * pair of numbers throws that away.
 *
 * Read DESIGN-QUESTIONS before extending this. There is an open argument about
 * whether precision belongs here at all or should be calculated from method and
 * source.
 */
export const locationMethod = z.enum(['placed', 'geocoded', 'embedded', 'inherited']);
export type LocationMethod = z.infer<typeof locationMethod>;

/**
 * Where a record says it was made, when that is known and differs from the place
 * it is attached to.
 *
 * A photo's GPS puts the camera across the street from the building. That is
 * precise, and it is also not the answer to "what is this a photo of", so it is
 * kept apart from `site.coordinates` rather than overwriting them.
 */
export const capturedLocation = z.object({
  /** [longitude, latitude]. GeoJSON order, same as sites. */
  coordinates: z.tuple([z.number(), z.number()]),
  method: locationMethod,
  /**
   * Rough radius the point is good for, in metres. A number rather than a
   * category, because every category list we tried presupposed an answer to the
   * question in DESIGN-QUESTIONS.
   */
  accuracyMetres: z.number().optional(),
});
export type CapturedLocation = z.infer<typeof capturedLocation>;

/**
 * Something generated from an uploaded file: a thumbnail, a waveform, a smaller
 * version for playback, text pulled out of a scan.
 *
 * Derivatives are disposable. Everything here can be rebuilt from the original,
 * and nothing should point at one as though it were the source.
 */
export const mediaDerivative = z.object({
  kind: z.enum(['thumbnail', 'waveform', 'transcode', 'text_extract']),
  storageKey: z.string(),
  contentType: z.string(),
  byteSize: z.number().optional(),
});
export type MediaDerivative = z.infer<typeof mediaDerivative>;

/**
 * One uploaded file.
 *
 * `storageKey` is a key in object storage, not a URL. Links for reading are
 * generated when somebody asks and they expire, so storing one would mean
 * storing something that stops working. Anything that needs to show a file asks
 * for a fresh link.
 *
 * `checksum` is here so the same file arriving twice can be recognised as the
 * same file. Families share photographs, and two cousins uploading one scan is a
 * duplicate rather than corroboration.
 */
export const mediaRef = z.object({
  id: z.string(),
  recordId: z.string(),
  kind: mediaKind,
  storageKey: z.string(),
  /** MIME type as found by inspecting the file, not as the browser claimed. */
  contentType: z.string(),
  byteSize: z.number(),
  /** sha256 of the original bytes, hex. */
  checksum: z.string().optional(),
  originalFilename: z.string().optional(),
  processing: processingState,
  /** Set when processing failed, so somebody can be told what went wrong. */
  processingError: z.string().optional(),
  /** Read out of the file itself. Absent until something has looked. */
  durationSeconds: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  /** When the file says it was made. Not when it was uploaded. */
  capturedAt: z.string().optional(),
  derivatives: z.array(mediaDerivative),
  createdAt: z.string(),
});
export type MediaRef = z.infer<typeof mediaRef>;

/**
 * An artifact somebody contributed, and the place it belongs to.
 *
 * A record is a bundle, not a file type. What arrives is whatever the person
 * had: a voice recording, a photograph with a sentence about it, a page they
 * typed up, a scan of a letter, or several of those at once. One record holds
 * all of it.
 *
 * That is why there is no `kind` field here. A contribution made of a
 * photograph, a two-minute audio description of that photograph, and a written
 * note is an ordinary thing for somebody to hand over, and a single kind would
 * have to lie about it. Each file carries its own kind in `media`. The record is
 * the bundle they arrived in.
 *
 * The three shapes that turn up most:
 *
 *   Written account    `text` is set and `media` is empty.
 *   Photo with caption `media` holds one image, `note` says what it is.
 *   Oral account       `media` holds audio, `note` may be empty, and a
 *                      transcript arrives later from somebody else entirely.
 *
 * `note` and `text` are not the same field twice. A note is what somebody says
 * about the thing they are handing over, a caption. Text is the record itself,
 * when the record is writing. Three sentences under a photograph is a note. A
 * thousand words somebody wrote about their grandmother is text.
 *
 * A record is also the reason a contribution can be small. Somebody with a
 * shoebox of photographs and one sentence about each can contribute without
 * also being a transcriber and a translator. Other people do those parts later
 * and are credited for them.
 *
 * Called `sourceRecord` rather than `record` because TypeScript already has a
 * built-in `Record<Key, Value>`, and a type here with that name would shadow it
 * in every file that imported both. The word in conversation and in the docs is
 * still "record".
 */
export const sourceRecord = z
  .object({
    id: z.string(),
    siteId: z.string(),
    contributorId: z.string(),
    /**
     * What somebody says about what they are handing over. "This is my
     * grandmother outside the boarding house." Often the only text a record
     * ever gets.
     */
    note: z.string().optional(),
    /** The record itself, when the record is writing. */
    text: z.string().optional(),
    /** The language of `note` and `text`, when there is any. */
    language: languageCode.optional(),
    /** When the thing itself was made, as far as anyone knows. */
    capturedAt: z.string().optional(),
    capturedLocation: capturedLocation.optional(),
    submission: submissionState,
    /** What has arrived so far. A record can exist before its files finish uploading. */
    media: z.array(mediaRef),
    createdAt: z.string(),
  })
  .refine((r) => r.media.length > 0 || Boolean(r.text?.trim()), {
    message: 'A record needs media or text. A note on its own is a caption with nothing to caption.',
  });
export type SourceRecord = z.infer<typeof sourceRecord>;

/**
 * What somebody wrote down from a recording.
 *
 * The same kind of thing as a translation: an interpretation, attributed, with
 * more than one allowed to exist. Machine output is a draft with a name on it
 * rather than an answer, which is why `method` is stored instead of assumed.
 */
export const transcriptMethod = z.enum(['human', 'machine', 'machine_corrected']);
export type TranscriptMethod = z.infer<typeof transcriptMethod>;

export const transcript = z.object({
  id: z.string(),
  recordId: z.string(),
  contributorId: z.string(),
  language: languageCode,
  text: z.string(),
  method: transcriptMethod,
  createdAt: z.string(),
});
export type Transcript = z.infer<typeof transcript>;

/**
 * Somebody reporting a record for review.
 *
 * Reasoning is required for the same reason it is required on a dispute. An
 * unexplained objection cannot be acted on and cannot be answered.
 *
 * Nothing here weighs a flag by who raised it. The obvious design does, and the
 * obvious design also lets an established majority bury a minority account. See
 * DESIGN-QUESTIONS.
 */
export const flagReason = z.enum([
  'not_mine_to_share',
  'inaccurate',
  'harmful',
  'wrong_place',
  'other',
]);
export type FlagReason = z.infer<typeof flagReason>;

export const flagStatus = z.enum(['open', 'reviewing', 'upheld', 'dismissed']);
export type FlagStatus = z.infer<typeof flagStatus>;

export const flag = z.object({
  id: z.string(),
  recordId: z.string(),
  contributorId: z.string(),
  reason: flagReason,
  reasoning: z.string().min(1),
  status: flagStatus,
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
});
export type Flag = z.infer<typeof flag>;

/* ------------------------------------------------------------------ */
/* Claims                                                              */
/* ------------------------------------------------------------------ */

/**
 * One addressable part of a claim: a date, a place, a person.
 *
 * This is what lets someone disagree about the year without disagreeing about
 * the building. Without it, one objection marks a whole account as contested
 * even when most of it is fine.
 *
 * `excerpt` is the literal phrase from the claim text, so an interface can
 * highlight it without doing character-offset arithmetic.
 */
export const claimElement = z.object({
  id: z.string(),
  kind: z.enum(['date', 'place', 'person', 'event', 'quantity', 'attribution']),
  /** The value being asserted, tidied up. "1943", "Grove Street entrance". */
  value: z.string(),
  /** The words in the claim text this refers to. */
  excerpt: z.string(),
});
export type ClaimElement = z.infer<typeof claimElement>;

/** Something someone asserts about a place. */
export const claim = z.object({
  id: z.string(),
  siteId: z.string(),
  contributorId: z.string(),
  /** The readable text. If the account was given in another language, this is the rendering. */
  text: z.string(),
  sourceLanguage: languageCode,
  /**
   * The account as it was actually given, when that wasn't English. A real
   * field, not an attachment, so nothing is lost by rendering it.
   */
  sourceLanguageText: z.string().optional(),
  elements: z.array(claimElement),
  /**
   * Roughly when, as a coarse bucket, for filtering.
   *
   * Optional, and absent is a real answer. Plenty of accounts say nothing about
   * when. "The fronton was built into the back of the building" is about a place
   * and its use, and putting a period on it would be the person who typed it in
   * guessing.
   *
   * What somebody actually said about time is not stored here. It is the
   * `excerpt` on a date element, in their words: "this would be 1963, 1964",
   * "Before the boarding house". This field is a summary calculated off that by
   * a human at entry time, and whether it should exist at all is in
   * DESIGN-QUESTIONS.
   */
  era: era.optional(),
  topics: z.array(z.string()),
  sourceType,
  createdAt: z.string(),
  /**
   * The artifact this claim was read out of.
   *
   * Every claim is somebody's reading of something that exists. Without this
   * there is no route from a sentence in an article back to the recording it
   * came out of, and no way for a reader to check a reading against the thing
   * being read.
   *
   * One record often produces several claims. Somebody writes three paragraphs
   * about a building and three separate assertions come out of it, each of which
   * can be corroborated or disputed on its own.
   */
  recordId: z.string(),
  /** Set when this was added as context on another claim. */
  parentClaimId: z.string().optional(),
  /**
   * True when an account is in the archive and pinned on the map, readable in
   * its original language, but nobody has rendered it into English yet.
   *
   * It is visible and attributed. It carries no weight only because there is
   * nothing yet to compare it against. It is never deleted and never hidden.
   */
  awaitingTranslation: z.boolean(),
});
export type Claim = z.infer<typeof claim>;

/**
 * Someone's rendering of an account into another language.
 *
 * More than one can exist for the same account, each credited to whoever wrote
 * it. There is no slot for "the correct one". Translation involves judgement,
 * and hiding that behind a single authoritative version loses information.
 */
export const translation = z.object({
  id: z.string(),
  claimId: z.string(),
  contributorId: z.string(),
  targetLanguage: languageCode,
  text: z.string(),
  createdAt: z.string(),
});
export type Translation = z.infer<typeof translation>;

/** Someone saying a rendering gets something wrong. Kept permanently. */
export const translationDispute = z.object({
  id: z.string(),
  translationId: z.string(),
  contributorId: z.string(),
  /** "The original says X, this renders it as Y." */
  reasoning: z.string(),
  createdAt: z.string(),
});
export type TranslationDispute = z.infer<typeof translationDispute>;

/* ------------------------------------------------------------------ */
/* Edges                                                               */
/* ------------------------------------------------------------------ */

/** Someone disagreeing with one specific part of a claim. */
export const disputeEdge = z.object({
  id: z.string(),
  type: z.literal('dispute'),
  targetClaimId: z.string(),
  /** Which part. Disagreement always lands on an element, never a whole account. */
  targetElementId: z.string(),
  /**
   * Why. Required, and checked here rather than left to the interface, because
   * it's a property of the record. "This is wrong" cannot be filed.
   */
  reasoning: z.string().min(1),
  /** What they say instead, if they say anything. */
  proposedValue: z.string().optional(),
  contributorId: z.string(),
  createdAt: z.string(),
});
export type DisputeEdge = z.infer<typeof disputeEdge>;

/** Someone adding context to a claim without contradicting it. */
export const extensionEdge = z.object({
  id: z.string(),
  type: z.literal('extension'),
  parentClaimId: z.string(),
  childClaimId: z.string(),
  contributorId: z.string(),
  createdAt: z.string(),
});
export type ExtensionEdge = z.infer<typeof extensionEdge>;

/**
 * A claim pointing at another place, or another claim.
 *
 * Often the target doesn't exist in the archive yet. Someone mentions a
 * building nobody has added. The marker is kept unresolved rather than dropped,
 * so a later reader can connect it.
 */
export const referenceEdge = z.object({
  id: z.string(),
  type: z.literal('reference'),
  fromClaimId: z.string(),
  toSiteId: z.string().optional(),
  toClaimId: z.string().optional(),
  /** The words that pointed somewhere. */
  excerpt: z.string(),
  resolved: z.boolean(),
  contributorId: z.string(),
  createdAt: z.string(),
});
export type ReferenceEdge = z.infer<typeof referenceEdge>;

export const edge = z.discriminatedUnion('type', [disputeEdge, extensionEdge, referenceEdge]);
export type Edge = z.infer<typeof edge>;

/* ------------------------------------------------------------------ */
/* Signals                                                             */
/* ------------------------------------------------------------------ */

/**
 * Someone agreeing with a claim. No new node, no new source.
 *
 * Worth less than it looks. An affirmation from within the same family as the
 * author adds nothing, which is why `independentLineageCount` exists separately
 * from the raw count.
 */
export const affirmation = z.object({
  id: z.string(),
  claimId: z.string(),
  contributorId: z.string(),
  createdAt: z.string(),
});
export type Affirmation = z.infer<typeof affirmation>;

/** A reader's low-effort reaction. Feeds routing, not the graph. */
export const passover = z.object({
  id: z.string(),
  claimId: z.string(),
  contributorId: z.string(),
  kind: passoverKind,
  createdAt: z.string(),
});
export type Passover = z.infer<typeof passover>;

/* ------------------------------------------------------------------ */
/* Calculated state                                                    */
/* ------------------------------------------------------------------ */

/** One element of a claim, plus whatever anyone has said about it. */
export const elementStatus = z.object({
  element: claimElement,
  disputes: z.array(disputeEdge),
  /**
   * Every value anyone has asserted for this element, strongest first.
   *
   * `count` is distinct family lines, not number of people. Label it that way
   * in any interface, or a reader will assume it's a vote count.
   */
  competingValues: z.array(
    z.object({
      value: z.string(),
      count: z.number(),
      contributorIds: z.array(z.string()),
    }),
  ),
});
export type ElementStatus = z.infer<typeof elementStatus>;

/** A claim with everything the community has done to it, worked out. */
export const claimState = z.object({
  claim,
  contributor,
  /**
   * The artifact this claim was read out of, copied in.
   *
   * It is already in `graphState.records`, so this is duplication. It is here
   * because almost everything that shows a claim also wants to show what it
   * came from, and making every consumer join by hand is how you end up with
   * three slightly different joins. The same reasoning put `contributor` here.
   *
   * The cost is real: one record producing four claims appears four times, and
   * a record with large media metadata pays that four times over. If this
   * becomes a problem it should become a reference, not a half-copy.
   */
  record: sourceRecord,
  translations: z.array(translation),
  translationDisputes: z.array(translationDispute),
  affirmations: z.array(affirmation),
  /** Distinct family lines backing this, excluding the author's own. */
  independentLineageCount: z.number(),
  extensions: z.array(z.string()),
  references: z.array(referenceEdge),
  /** Counts for all three kinds, always present, zero when nobody has reacted. */
  passover: z.object({
    sounds_right: z.number(),
    dont_know: z.number(),
    dont_care: z.number(),
  }),
  elementStatuses: z.array(elementStatus),
  /** See `weight.ts` in the fixtures package. This is a stand-in, not the real scoring. */
  weight: z.number(),
  confidence,
});
export type ClaimState = z.infer<typeof claimState>;

/**
 * What one contributor has actually done here.
 *
 * Every field is a count of something that happened. There is no score in this
 * shape and there must not be one. Working out what any of it means, whether a
 * long record of corroborated claims should count for more than a short one,
 * whether somebody who disputes constantly is careful or difficult, whether any
 * of it should touch a claim's weight at all, is the intelligence layer's
 * deliverable and the hardest open question in the project.
 *
 * What this is, is the toolbox. An algorithm can only be as good as what the
 * model bothered to write down, so the job here is to record behaviour
 * faithfully and judge none of it.
 *
 * Two of these are worth more than their names suggest:
 *
 * `disputesRaisedWithAlternative` separates "that date is wrong, it was 1914"
 * from "that date is wrong". Both are disputes. Only one of them moves the
 * record forward, and telling them apart needs no reading.
 *
 * `claimsCorroboratedByOtherLines` counts claims of theirs that somebody from a
 * different family backed. That is the one signal here that cannot be produced
 * by a person being enthusiastic on their own.
 *
 * What is deliberately missing: there is no vouching. No contributor can stand
 * behind another, so a person who is known and trusted by everyone in the room
 * and has contributed nothing looks identical to a stranger. Whether that
 * mechanism should exist, and what it would do, is in DESIGN-QUESTIONS.
 */
export const contributorStanding = z.object({
  contributorId: z.string(),
  /** Their first and last contribution of any kind, or undefined if none yet. */
  firstContributionAt: z.string().optional(),
  lastContributionAt: z.string().optional(),
  recordsSubmitted: z.number(),
  claimsAuthored: z.number(),
  /** Claims of theirs backed by at least one other family line. */
  claimsCorroboratedByOtherLines: z.number(),
  /** Claims of theirs that somebody has disputed part of. Not a mark against them. */
  claimsDisputed: z.number(),
  disputesRaised: z.number(),
  /** Of those, the ones that proposed a different value instead of only objecting. */
  disputesRaisedWithAlternative: z.number(),
  affirmationsGiven: z.number(),
  translationsContributed: z.number(),
  transcriptsContributed: z.number(),
  flagsRaised: z.number(),
});
export type ContributorStanding = z.infer<typeof contributorStanding>;

/** How well-documented a place is. Drives how its marker looks on the map. */
export const integrityScore = z.object({
  totalClaims: z.number(),
  independentContributors: z.number(),
  /** Distinct family lines represented. */
  lineageDiversity: z.number(),
  /** Share of claims backed by two or more unrelated people. */
  corroborationDepth: z.number().min(0).max(1),
  activeDisputes: z.number(),
  /** How many distinct time periods have anything said about them. */
  temporalCoverage: z.number(),
  awaitingTranslation: z.number(),
  /** 0-100 rollup, for marker styling. Placeholder formula. */
  overall: z.number().min(0).max(100),
});
export type IntegrityScore = z.infer<typeof integrityScore>;

/** Everything known about one place, as of one moment. */
export const graphState = z.object({
  stateId: z.string(),
  label: z.string(),
  /** Every contribution up to and including this moment is reflected here. */
  asOf: z.string(),
  site,
  claims: z.array(claimState),
  contributors: z.array(contributor),
  /** Everything handed over for this place, with its files. */
  records: z.array(sourceRecord),
  /**
   * What each contributor has done, as counts and nothing else.
   *
   * This is the intelligence layer's raw material. Anyone who turns it into a
   * single number owns that decision and should write down why.
   */
  standings: z.array(contributorStanding),
  /** Every transcript of every record here. More than one per record is normal. */
  transcripts: z.array(transcript),
  /** Open and resolved reports, kept together. A resolved flag is still evidence. */
  flags: z.array(flag),
  integrity: integrityScore,
  /** Which contributions produced this. The version history is built from these. */
  eventIdsApplied: z.array(z.string()),
  /** What arrived since the previous snapshot, so an interface can say what changed. */
  eventIdsSincePrevious: z.array(z.string()),
});
export type GraphState = z.infer<typeof graphState>;

/** Every schema in one object, for when you want to look one up by name. */
export const schemas = {
  site,
  contributor,
  claim,
  claimElement,
  claimState,
  graphState,
  integrityScore,
  disputeEdge,
  extensionEdge,
  referenceEdge,
  edge,
  affirmation,
  passover,
  translation,
  translationDispute,
  sourceRecord,
  mediaRef,
  mediaDerivative,
  capturedLocation,
  transcript,
  flag,
  contributorStanding,
  flagReason,
  flagStatus,
  transcriptMethod,
  mediaKind,
  processingState,
  submissionState,
  locationMethod,
} as const;
