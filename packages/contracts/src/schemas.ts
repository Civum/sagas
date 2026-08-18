/**
 * Runtime validation for the shapes in types.ts.
 *
 * These exist so a consumer can assert that data it received actually matches
 * the contract, rather than trusting TypeScript at a boundary where TypeScript
 * has already been erased. The conformance suite uses them; so should any code
 * that reads fixture JSON off disk.
 */

import { z } from 'zod';

export const languageCode = z.enum(['en', 'eu', 'es']);

export const sourceType = z.enum([
  'firsthand',
  'family_oral',
  'community_oral',
  'documentary',
  'academic',
  'institutional',
]);

export const era = z.enum([
  'pre_1900',
  'early_immigration_1900_1929',
  'depression_war_1930_1945',
  'postwar_1946_1969',
  'late_century_1970_1999',
  'contemporary_2000_present',
]);

export const passoverKind = z.enum(['sounds_right', 'dont_know', 'dont_care']);

export const confidence = z.enum([
  'single_source',
  'corroborated',
  'well_corroborated',
  'contested',
]);

export const site = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  aka: z.array(z.string()),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string(),
  city: z.string(),
  coordinatePrecision: z.enum(['approximate', 'surveyed']),
});

export const contributor = z.object({
  id: z.string(),
  displayName: z.string(),
  lineageId: z.string().optional(),
  institution: z.string().optional(),
  joinedAt: z.string(),
  fictional: z.literal(true),
});

export const claimElement = z.object({
  id: z.string(),
  kind: z.enum(['date', 'place', 'person', 'event', 'quantity', 'attribution']),
  value: z.string(),
  excerpt: z.string(),
});

export const claim = z.object({
  id: z.string(),
  siteId: z.string(),
  contributorId: z.string(),
  text: z.string(),
  sourceLanguage: languageCode,
  sourceLanguageText: z.string().optional(),
  elements: z.array(claimElement),
  era,
  topics: z.array(z.string()),
  sourceType,
  createdAt: z.string(),
  parentClaimId: z.string().optional(),
  awaitingTranslation: z.boolean(),
});

export const translation = z.object({
  id: z.string(),
  claimId: z.string(),
  contributorId: z.string(),
  targetLanguage: languageCode,
  text: z.string(),
  createdAt: z.string(),
});

export const translationDispute = z.object({
  id: z.string(),
  translationId: z.string(),
  contributorId: z.string(),
  reasoning: z.string(),
  createdAt: z.string(),
});

export const disputeEdge = z.object({
  id: z.string(),
  type: z.literal('dispute'),
  targetClaimId: z.string(),
  targetElementId: z.string(),
  // Disputes without reasoning are rejected at submission. This is enforced
  // here rather than left to the UI, because it is a property of the record.
  reasoning: z.string().min(1),
  proposedValue: z.string().optional(),
  contributorId: z.string(),
  createdAt: z.string(),
});

export const referenceEdge = z.object({
  id: z.string(),
  type: z.literal('reference'),
  fromClaimId: z.string(),
  toSiteId: z.string().optional(),
  toClaimId: z.string().optional(),
  excerpt: z.string(),
  resolved: z.boolean(),
  contributorId: z.string(),
  createdAt: z.string(),
});

export const affirmation = z.object({
  id: z.string(),
  claimId: z.string(),
  contributorId: z.string(),
  createdAt: z.string(),
});

export const elementStatus = z.object({
  element: claimElement,
  disputes: z.array(disputeEdge),
  competingValues: z.array(
    z.object({
      value: z.string(),
      count: z.number(),
      contributorIds: z.array(z.string()),
    }),
  ),
});

export const claimState = z.object({
  claim,
  contributor,
  translations: z.array(translation),
  translationDisputes: z.array(translationDispute),
  affirmations: z.array(affirmation),
  independentLineageCount: z.number(),
  extensions: z.array(z.string()),
  references: z.array(referenceEdge),
  passover: z.record(passoverKind, z.number()),
  elementStatuses: z.array(elementStatus),
  weight: z.number(),
  confidence,
});

export const integrityScore = z.object({
  totalClaims: z.number(),
  independentContributors: z.number(),
  lineageDiversity: z.number(),
  corroborationDepth: z.number().min(0).max(1),
  activeDisputes: z.number(),
  temporalCoverage: z.number(),
  awaitingTranslation: z.number(),
  overall: z.number().min(0).max(100),
});

export const graphState = z.object({
  stateId: z.string(),
  label: z.string(),
  asOf: z.string(),
  site,
  claims: z.array(claimState),
  contributors: z.array(contributor),
  integrity: integrityScore,
  eventIdsApplied: z.array(z.string()),
  eventIdsSincePrevious: z.array(z.string()),
});

export const schemas = {
  site,
  contributor,
  claim,
  claimState,
  graphState,
  integrityScore,
  disputeEdge,
  referenceEdge,
  translation,
} as const;
