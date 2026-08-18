/**
 * The append-only contribution log.
 *
 * This is the single authored artifact. Graph states are derived by folding
 * this log up to an instant — they are never authored directly. That is what
 * makes the version-history timeline real rather than fabricated: every state
 * transition points at the exact contributions that caused it.
 */

import type {
  ClaimElement, ContributorId, ClaimId, ElementId, Era, EventId,
  LanguageCode, LineageId, SiteId, SourceType, TranslationId, PassoverKind,
} from '@sagas/contracts';

interface BaseEvent {
  id: EventId;
  at: string;
  actorId: ContributorId | 'system';
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
  siteId: SiteId;
  text: string;
  sourceLanguage: LanguageCode;
  sourceLanguageText?: string;
  /** True when submitted in a language other than English with no rendering yet. */
  awaitingTranslation?: boolean;
  elements: ClaimElement[];
  era: Era;
  topics: string[];
  sourceType: SourceType;
}

export interface ClaimExtended extends BaseEvent {
  kind: 'claim_extended';
  claimId: ClaimId;
  parentClaimId: ClaimId;
  siteId: SiteId;
  text: string;
  sourceLanguage: LanguageCode;
  sourceLanguageText?: string;
  elements: ClaimElement[];
  era: Era;
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
  | ReferenceMarked;
