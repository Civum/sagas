/**
 * The list of contributions, in the order they happened.
 *
 * This is the only file anyone writes by hand. Everything else in the fixtures
 * is calculated from it. Adding a contribution here changes every snapshot
 * dated after it, which is the point.
 */

import type {
  CapturedLocation, ClaimElement, ContributorId, ClaimId, ElementId, Era, EventId,
  FlagId, FlagReason, LanguageCode, LineageId, MediaDerivative, MediaId, MediaKind,
  PassoverKind, ProcessingState, RecordId, SiteId, SourceType, SubmissionState,
  TranscriptId, TranscriptMethod, TranslationId,
} from '@sagas/contracts';

/** Every contribution has an id, a time, and someone who made it. */
interface BaseEvent {
  id: EventId;
  at: string;
  /** Who did this. The literal string 'system' for setup events with no person behind them. */
  actorId: ContributorId;
}

export interface SiteCreated extends BaseEvent {
  kind: 'site_created';
  siteId: SiteId;
  slug: string;
  name: string;
  aka: string[];
  coordinates: [number, number];
  address: string;
  city: string;
}

export interface ContributorRegistered extends BaseEvent {
  kind: 'contributor_registered';
  contributorId: ContributorId;
  displayName: string;
  lineageId?: LineageId;
  institution?: string;
}

export interface AccountSubmitted extends BaseEvent {
  kind: 'account_submitted';
  claimId: ClaimId;
  /** The record this was read out of. One record can produce several claims. */
  recordId: RecordId;
  siteId: SiteId;
  text: string;
  sourceLanguage: LanguageCode;
  sourceLanguageText?: string;
  /** True when submitted in a language other than English with no rendering yet. */
  awaitingTranslation?: boolean;
  elements: ClaimElement[];
  era?: Era;
  topics: string[];
  sourceType: SourceType;
}

export interface ClaimExtended extends BaseEvent {
  kind: 'claim_extended';
  claimId: ClaimId;
  /** The record this was read out of. */
  recordId: RecordId;
  parentClaimId: ClaimId;
  siteId: SiteId;
  text: string;
  sourceLanguage: LanguageCode;
  sourceLanguageText?: string;
  elements: ClaimElement[];
  era?: Era;
  topics: string[];
  sourceType: SourceType;
}

export interface ClaimDisputed extends BaseEvent {
  kind: 'claim_disputed';
  edgeId: string;
  targetClaimId: ClaimId;
  targetElementId: ElementId;
  reasoning: string;
  proposedValue?: string;
}

export interface ClaimAffirmed extends BaseEvent {
  kind: 'claim_affirmed';
  affirmationId: string;
  claimId: ClaimId;
}

export interface PassoverRecorded extends BaseEvent {
  kind: 'passover_recorded';
  passoverId: string;
  claimId: ClaimId;
  passoverKind: PassoverKind;
}

export interface TranslationSubmitted extends BaseEvent {
  kind: 'translation_submitted';
  translationId: TranslationId;
  claimId: ClaimId;
  targetLanguage: LanguageCode;
  text: string;
}

export interface TranslationDisputed extends BaseEvent {
  kind: 'translation_disputed';
  disputeId: string;
  translationId: TranslationId;
  reasoning: string;
}

export interface ReferenceMarked extends BaseEvent {
  kind: 'reference_marked';
  edgeId: string;
  fromClaimId: ClaimId;
  toSiteId?: SiteId;
  toClaimId?: ClaimId;
  excerpt: string;
  resolved: boolean;
}

/**
 * One file arriving with a record.
 *
 * `storageKey` is where the bytes live in object storage. It is not a URL, and
 * nothing should turn it into one and keep it. Read links are generated when
 * somebody asks and they expire.
 */
export interface MediaDescriptor {
  mediaId: MediaId;
  kind: MediaKind;
  storageKey: string;
  contentType: string;
  byteSize: number;
  checksum?: string;
  originalFilename?: string;
  /** Defaults to 'uploaded'. Nothing has looked at the file yet. */
  processing?: ProcessingState;
  durationSeconds?: number;
  width?: number;
  height?: number;
  capturedAt?: string;
}

/** Somebody hands something over. */
export interface RecordSubmitted extends BaseEvent {
  kind: 'record_submitted';
  recordId: RecordId;
  siteId: SiteId;
  note?: string;
  text?: string;
  language?: LanguageCode;
  capturedAt?: string;
  capturedLocation?: CapturedLocation;
  media?: MediaDescriptor[];
  /** Defaults to 'submitted'. */
  submission?: SubmissionState;
}

/**
 * A background job finished with a file, or failed on it.
 *
 * This is the event that makes the difference between "your upload broke" and
 * "we are still working on it" visible to the person who uploaded.
 */
export interface MediaProcessed extends BaseEvent {
  kind: 'media_processed';
  mediaId: MediaId;
  recordId: RecordId;
  processing: ProcessingState;
  processingError?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  derivatives?: MediaDerivative[];
  /** Where the record goes next, if this finishing moves it along. */
  submission?: SubmissionState;
}

/** Somebody writes down what is on a recording. */
export interface TranscriptSubmitted extends BaseEvent {
  kind: 'transcript_submitted';
  transcriptId: TranscriptId;
  recordId: RecordId;
  language: LanguageCode;
  text: string;
  method: TranscriptMethod;
  submission?: SubmissionState;
}

/** Somebody reports a record for review. Reasoning is required. */
export interface RecordFlagged extends BaseEvent {
  kind: 'record_flagged';
  flagId: FlagId;
  recordId: RecordId;
  reason: FlagReason;
  reasoning: string;
}

export type ContributionEvent =
  | SiteCreated
  | ContributorRegistered
  | AccountSubmitted
  | ClaimExtended
  | ClaimDisputed
  | ClaimAffirmed
  | PassoverRecorded
  | TranslationSubmitted
  | TranslationDisputed
  | ReferenceMarked
  | RecordSubmitted
  | MediaProcessed
  | TranscriptSubmitted
  | RecordFlagged;
