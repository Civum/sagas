/**
 * The shapes both layers agree on.
 *
 * SPONSOR-OWNED. Changing anything here is a contract change: it needs a
 * version bump, a CHANGELOG line, and a conversation at a sync. Open a PR
 * rather than editing in your fork — a fork-local change to this file is a
 * silent divergence that nobody discovers until integration.
 */
/**
 * Sagas fixture domain types.
 *
 * SCOPE BOUNDARY: These types describe the *fixture* representation used to
 * develop the experience layer. They are a starting point for UofI's schema
 * work, not a specification of it. UofI owns the PostgreSQL/PostGIS model and
 * is expected to change these.
 */

export type SiteId = string;
export type ClaimId = string;
export type ElementId = string;
export type ContributorId = string;
export type LineageId = string;
export type EventId = string;
export type TranslationId = string;

/** ISO-639-1 where it exists. `eu` = Euskara, `es` = Spanish. */
export type LanguageCode = 'en' | 'eu' | 'es';

/**
 * How the contributor came to know this. Surfaced verbatim in BYU-I's source
 * attribution panel. Never used to gate a claim — only to weight it.
 */
export type SourceType =
  | 'firsthand'          // "I was there."
  | 'family_oral'        // "My grandmother told me this."
  | 'community_oral'     // "This is what people at the Center said."
  | 'documentary'        // "County records show..."
  | 'academic'           // published scholarship
  | 'institutional';     // held by a museum / archive

/**
 * Coarse time buckets. Used for temporal-coverage scoring and for the
 * exploration engine's gap prompts ("12 claims about the boarding house era,
 * 1 about pre-1940"). Deliberately coarse — contributors should not have to
 * pick a precise year to file an account.
 */
export type Era =
  | 'pre_1900'
  | 'early_immigration_1900_1929'
  | 'depression_war_1930_1945'
  | 'postwar_1946_1969'
  | 'late_century_1970_1999'
  | 'contemporary_2000_present';

export interface Site {
  id: SiteId;
  slug: string;
  name: string;
  /**
   * Vernacular synonyms. The community calls places things the record doesn't.
   * UofI's cross-site reference detection treats these as high-fidelity
   * training signal; for now they are just alternate labels.
   */
  aka: string[];
  /** [longitude, latitude] — GeoJSON order, matches PostGIS and Mapbox. */
  coordinates: [number, number];
  address: string;
  city: string;
  /** Approximate coordinates are fine for fixtures; flagged so nobody cites them. */
  coordinatePrecision: 'approximate' | 'surveyed';
}

export interface Contributor {
  id: ContributorId;
  displayName: string;
  /**
   * Family line. Two contributors sharing a lineage are NOT independent
   * corroboration. This is the field that makes family-bias detection and the
   * circular-corroboration edge case expressible in fixture data.
   */
  lineageId?: LineageId;
  /** e.g. "Basque Museum & Cultural Center" — an institutional badge, not a credential check. */
  institution?: string;
  joinedAt: string;
  /**
   * Every fixture person is invented. This flag exists so no downstream
   * consumer can mistake fixture data for real community testimony.
   */
  fictional: true;
}

/**
 * A typed, individually addressable part of a claim.
 *
 * This is the decision that makes granular dispute resolution possible without
 * NLP: a dispute targets an element, not a whole claim, so the system can say
 * "three disputes target the date; the location is undisputed."
 *
 * `excerpt` is the literal substring of the claim text this element refers to,
 * so a renderer can highlight it without computing character offsets. Span
 * offsets remain a future option; this does not foreclose them.
 */
export interface ClaimElement {
  id: ElementId;
  kind: 'date' | 'place' | 'person' | 'event' | 'quantity' | 'attribution';
  /** The normalized asserted value, e.g. "1943" or "Grove Street entrance". */
  value: string;
  /** The phrase in the claim text this element corresponds to. */
  excerpt: string;
}

export interface Claim {
  id: ClaimId;
  siteId: SiteId;
  contributorId: ContributorId;
  /** Reading text. If the account was given in another language this is the rendering. */
  text: string;
  /**
   * The account as given, when that was not English. First-class field, not an
   * attachment — per the constraint that the schema must not foreclose
   * multilingual graphs.
   */
  sourceLanguage: LanguageCode;
  sourceLanguageText?: string;
  elements: ClaimElement[];
  era: Era;
  topics: string[];
  sourceType: SourceType;
  createdAt: string;
  /** Set when this claim was created as an extension of another. */
  parentClaimId?: ClaimId;
  /**
   * True when the account exists in the archive and is pinned on the map, but
   * has no English rendering yet and therefore sits outside the claim graph.
   * It is visible and readable in the original. It is never deleted.
   */
  awaitingTranslation: boolean;
}

/**
 * A community-provided rendering of a non-English account. Multiple renderings
 * of the same account coexist, each independently attributed. There is no
 * single authoritative slot.
 *
 * OPEN QUESTION (out to a translation scholar as of Aug 2026): whether
 * coexisting attributed renderings is the right shape at all, or whether it
 * encodes an engineer's assumption about how translation works.
 */
export interface Translation {
  id: TranslationId;
  claimId: ClaimId;
  contributorId: ContributorId;
  targetLanguage: LanguageCode;
  text: string;
  createdAt: string;
}

export type EdgeType = 'dispute' | 'extension' | 'reference';

export interface DisputeEdge {
  id: string;
  type: 'dispute';
  /** The claim being contested. */
  targetClaimId: ClaimId;
  /** The specific element contested. Disputes always target an element. */
  targetElementId: ElementId;
  /** Disputes without reasoning are rejected at submission. */
  reasoning: string;
  /** The value the disputer asserts instead, when they assert one. */
  proposedValue?: string;
  contributorId: ContributorId;
  createdAt: string;
}

export interface ExtensionEdge {
  id: string;
  type: 'extension';
  parentClaimId: ClaimId;
  childClaimId: ClaimId;
  contributorId: ContributorId;
  createdAt: string;
}

/**
 * A reference from a claim to another site, or to another claim — including
 * across a language boundary. Unresolved references are kept as markers for
 * future community resolution rather than dropped.
 */
export interface ReferenceEdge {
  id: string;
  type: 'reference';
  fromClaimId: ClaimId;
  toSiteId?: SiteId;
  toClaimId?: ClaimId;
  /** The phrase in the source claim that pointed somewhere. */
  excerpt: string;
  resolved: boolean;
  contributorId: ContributorId;
  createdAt: string;
}

export type Edge = DisputeEdge | ExtensionEdge | ReferenceEdge;

export interface Affirmation {
  id: string;
  claimId: ClaimId;
  contributorId: ContributorId;
  createdAt: string;
}

export type PassoverKind = 'sounds_right' | 'dont_know' | 'dont_care';

export interface Passover {
  id: string;
  claimId: ClaimId;
  contributorId: ContributorId;
  kind: PassoverKind;
  createdAt: string;
}

/** A translation someone says renders the original wrongly. Preserved, never removed. */
export interface TranslationDispute {
  id: string;
  translationId: TranslationId;
  contributorId: ContributorId;
  /** "The original says X; this renders it as Y." */
  reasoning: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Derived state                                                       */
/* ------------------------------------------------------------------ */

export interface ElementStatus {
  element: ClaimElement;
  disputes: DisputeEdge[];
  /** Competing values asserted by disputers, with how many asserted each. */
  competingValues: Array<{ value: string; count: number; contributorIds: ContributorId[] }>;
}

export interface ClaimState {
  claim: Claim;
  contributor: Contributor;
  translations: Translation[];
  translationDisputes: TranslationDispute[];
  affirmations: Affirmation[];
  /** Number of distinct family lines among affirmers. Independence, not volume. */
  independentLineageCount: number;
  extensions: ClaimId[];
  references: ReferenceEdge[];
  passover: Record<PassoverKind, number>;
  elementStatuses: ElementStatus[];
  /** Placeholder confidence. See weight.ts — this is NOT UofI's model. */
  weight: number;
  confidence: 'single_source' | 'corroborated' | 'well_corroborated' | 'contested';
}

export interface IntegrityScore {
  totalClaims: number;
  independentContributors: number;
  /** Distinct family lines represented. */
  lineageDiversity: number;
  /** Share of claims affirmed by 2+ contributors from different lineages. */
  corroborationDepth: number;
  activeDisputes: number;
  /** Distinct eras with at least one claim. */
  temporalCoverage: number;
  awaitingTranslation: number;
  /** 0-100 rollup used for map marker encoding. Placeholder formula. */
  overall: number;
}

export interface GraphState {
  stateId: string;
  label: string;
  /** Everything in the event log at or before this instant is included. */
  asOf: string;
  site: Site;
  claims: ClaimState[];
  contributors: Contributor[];
  integrity: IntegrityScore;
  /** Events folded to produce this state — the linkage the version timeline needs. */
  eventIdsApplied: EventId[];
  /** Events applied since the previous state, so the UI can say what changed. */
  eventIdsSincePrevious: EventId[];
}
