/**
 * Folds the contribution log into a graph state at an instant.
 *
 * States are never authored. This is the only way one is produced, which is
 * what makes the version-history timeline honest: every state knows exactly
 * which contributions produced it, because it was built from them.
 */

import type { ContributionEvent } from './events';
import type {
  Affirmation, Claim, ClaimState, Contributor, DisputeEdge, ElementStatus,
  EventId, ExtensionEdge, GraphState, IntegrityScore, LineageId, Passover,
  PassoverKind, ReferenceEdge, Site, Translation, TranslationDispute,
} from '@sagas/contracts';
import { classifyConfidence, computeWeight } from './weight';

interface Accumulator {
  site?: Site;
  contributors: Map<string, Contributor>;
  claims: Map<string, Claim>;
  disputes: DisputeEdge[];
  extensions: ExtensionEdge[];
  references: ReferenceEdge[];
  affirmations: Affirmation[];
  passovers: Passover[];
  translations: Translation[];
  translationDisputes: TranslationDispute[];
  applied: EventId[];
}

function empty(): Accumulator {
  return {
    contributors: new Map(), claims: new Map(), disputes: [], extensions: [],
    references: [], affirmations: [], passovers: [], translations: [],
    translationDisputes: [], applied: [],
  };
}

function apply(acc: Accumulator, ev: ContributionEvent): void {
  acc.applied.push(ev.id);

  switch (ev.kind) {
    case 'site_created':
      acc.site = {
        id: ev.siteId, slug: ev.slug, name: ev.name, aka: ev.aka,
        coordinates: ev.coordinates, address: ev.address, city: ev.city,
        coordinatePrecision: 'approximate',
      };
      return;

    case 'contributor_registered':
      acc.contributors.set(ev.contributorId, {
        id: ev.contributorId, displayName: ev.displayName,
        lineageId: ev.lineageId, institution: ev.institution,
        joinedAt: ev.at, fictional: true,
      });
      return;

    case 'account_submitted':
      acc.claims.set(ev.claimId, {
        id: ev.claimId, siteId: ev.siteId, contributorId: ev.actorId as string,
        text: ev.text, sourceLanguage: ev.sourceLanguage,
        sourceLanguageText: ev.sourceLanguageText, elements: ev.elements,
        era: ev.era, topics: ev.topics, sourceType: ev.sourceType,
        createdAt: ev.at, awaitingTranslation: ev.awaitingTranslation ?? false,
      });
      return;

    case 'claim_extended':
      acc.claims.set(ev.claimId, {
        id: ev.claimId, siteId: ev.siteId, contributorId: ev.actorId as string,
        text: ev.text, sourceLanguage: ev.sourceLanguage,
        sourceLanguageText: ev.sourceLanguageText, elements: ev.elements,
        era: ev.era, topics: ev.topics, sourceType: ev.sourceType,
        createdAt: ev.at, parentClaimId: ev.parentClaimId,
        awaitingTranslation: false,
      });
      acc.extensions.push({
        id: `ext-${ev.id}`, type: 'extension', parentClaimId: ev.parentClaimId,
        childClaimId: ev.claimId, contributorId: ev.actorId as string, createdAt: ev.at,
      });
      return;

    case 'claim_disputed':
      acc.disputes.push({
        id: ev.edgeId, type: 'dispute', targetClaimId: ev.targetClaimId,
        targetElementId: ev.targetElementId, reasoning: ev.reasoning,
        proposedValue: ev.proposedValue, contributorId: ev.actorId as string,
        createdAt: ev.at,
      });
      return;

    case 'claim_affirmed':
      acc.affirmations.push({
        id: ev.affirmationId, claimId: ev.claimId,
        contributorId: ev.actorId as string, createdAt: ev.at,
      });
      return;

    case 'passover_recorded':
      acc.passovers.push({
        id: ev.passoverId, claimId: ev.claimId, contributorId: ev.actorId as string,
        kind: ev.passoverKind, createdAt: ev.at,
      });
      return;

    case 'translation_submitted': {
      acc.translations.push({
        id: ev.translationId, claimId: ev.claimId,
        contributorId: ev.actorId as string, targetLanguage: ev.targetLanguage,
        text: ev.text, createdAt: ev.at,
      });
      // A rendering exists, so the account enters the claim graph. The original
      // is untouched; the first rendering supplies the reading text.
      const claim = acc.claims.get(ev.claimId);
      if (claim && claim.awaitingTranslation) {
        claim.awaitingTranslation = false;
        if (!claim.text) claim.text = ev.text;
      }
      return;
    }

    case 'translation_disputed':
      acc.translationDisputes.push({
        id: ev.disputeId, translationId: ev.translationId,
        contributorId: ev.actorId as string, reasoning: ev.reasoning, createdAt: ev.at,
      });
      return;

    case 'reference_marked':
      acc.references.push({
        id: ev.edgeId, type: 'reference', fromClaimId: ev.fromClaimId,
        toSiteId: ev.toSiteId, toClaimId: ev.toClaimId, excerpt: ev.excerpt,
        resolved: ev.resolved, contributorId: ev.actorId as string, createdAt: ev.at,
      });
      return;
  }
}

/**
 * Distinct family lines among a set of contributors. A contributor with no
 * recorded lineage counts as their own line. This is the guard against three
 * cousins reading as three independent sources.
 */
function distinctLineages(ids: string[], contributors: Map<string, Contributor>): number {
  const lines = new Set<LineageId>();
  for (const id of ids) {
    const c = contributors.get(id);
    lines.add(c?.lineageId ?? `solo:${id}`);
  }
  return lines.size;
}

function buildClaimState(
  claim: Claim,
  acc: Accumulator,
): ClaimState {
  const contributor = acc.contributors.get(claim.contributorId)!;
  const affirmations = acc.affirmations.filter((a) => a.claimId === claim.id);
  const disputes = acc.disputes.filter((d) => d.targetClaimId === claim.id);
  const extensions = acc.extensions.filter((e) => e.parentClaimId === claim.id).map((e) => e.childClaimId);
  const references = acc.references.filter((r) => r.fromClaimId === claim.id);
  const translations = acc.translations.filter((t) => t.claimId === claim.id);
  const translationIds = new Set(translations.map((t) => t.id));
  const translationDisputes = acc.translationDisputes.filter((d) => translationIds.has(d.translationId));

  // Affirmer independence excludes the author AND anyone sharing the author's
  // family line. A cousin affirming a cousin's account is the same source
  // twice, not corroboration. Volume still rises; independence does not.
  const authorLineage = contributor.lineageId ?? `solo:${claim.contributorId}`;
  const affirmerIds = affirmations
    .map((a) => a.contributorId)
    .filter((id) => id !== claim.contributorId)
    .filter((id) => {
      const a = acc.contributors.get(id);
      return (a?.lineageId ?? `solo:${id}`) !== authorLineage;
    });
  const independentLineageCount = distinctLineages(affirmerIds, acc.contributors);

  const passover: Record<PassoverKind, number> = { sounds_right: 0, dont_know: 0, dont_care: 0 };
  for (const p of acc.passovers) if (p.claimId === claim.id) passover[p.kind]++;

  const elementStatuses: ElementStatus[] = claim.elements.map((element) => {
    const elementDisputes = disputes.filter((d) => d.targetElementId === element.id);
    const byValue = new Map<string, string[]>();
    // The claim's own asserted value is one of the competing readings.
    byValue.set(element.value, [claim.contributorId]);
    for (const d of elementDisputes) {
      if (!d.proposedValue) continue;
      const list = byValue.get(d.proposedValue) ?? [];
      list.push(d.contributorId);
      byValue.set(d.proposedValue, list);
    }
    const competingValues = [...byValue.entries()]
      .map(([value, contributorIds]) => ({
        value,
        count: distinctLineages(contributorIds, acc.contributors),
        contributorIds,
      }))
      // Emphasis by weight ordering: strongest reading first, competitors
      // preserved inline. Nothing is marked accepted and nothing is hidden.
      .sort((a, b) => b.count - a.count);
    return { element, disputes: elementDisputes, competingValues };
  });

  const extensionClaims = extensions.map((id) => acc.claims.get(id)).filter(Boolean) as Claim[];
  const sourceTypeDiversity = new Set([claim.sourceType, ...extensionClaims.map((c) => c.sourceType)]).size;

  const weight = computeWeight({
    sourceType: claim.sourceType,
    independentLineageCount,
    affirmationCount: affirmations.length,
    extensionCount: extensions.length,
    disputeCount: disputes.length,
    sourceTypeDiversity,
    awaitingTranslation: claim.awaitingTranslation,
  });

  return {
    claim, contributor, translations, translationDisputes, affirmations,
    independentLineageCount, extensions, references, passover, elementStatuses,
    weight,
    confidence: classifyConfidence({
      independentLineageCount,
      disputeCount: disputes.length,
      awaitingTranslation: claim.awaitingTranslation,
    }),
  };
}

function buildIntegrity(claimStates: ClaimState[], acc: Accumulator): IntegrityScore {
  const inGraph = claimStates.filter((c) => !c.claim.awaitingTranslation);
  const contributorIds = new Set(claimStates.map((c) => c.claim.contributorId));
  const lineageDiversity = distinctLineages([...contributorIds], acc.contributors);
  const corroborated = inGraph.filter((c) => c.independentLineageCount >= 2).length;
  const eras = new Set(claimStates.map((c) => c.claim.era));

  const score = {
    totalClaims: claimStates.length,
    independentContributors: contributorIds.size,
    lineageDiversity,
    corroborationDepth: inGraph.length ? corroborated / inGraph.length : 0,
    activeDisputes: acc.disputes.length + acc.translationDisputes.length,
    temporalCoverage: eras.size,
    awaitingTranslation: claimStates.filter((c) => c.claim.awaitingTranslation).length,
    overall: 0,
  };

  // Placeholder rollup for map marker encoding only. UofI replaces this.
  score.overall = Math.min(100, Math.round(
    Math.min(score.totalClaims, 12) * 3 +
    Math.min(score.lineageDiversity, 6) * 6 +
    score.corroborationDepth * 25 +
    Math.min(score.temporalCoverage, 6) * 4,
  ));

  return score;
}

export function reduceToState(
  events: ContributionEvent[],
  cut: { stateId: string; label: string; asOf: string },
  previousEventIds: EventId[] = [],
): GraphState {
  const acc = empty();
  const ordered = [...events].sort((a, b) => a.at.localeCompare(b.at));
  for (const ev of ordered) {
    if (ev.at > cut.asOf) break;
    apply(acc, ev);
  }

  if (!acc.site) throw new Error(`No site exists at ${cut.asOf}`);

  const claimStates = [...acc.claims.values()]
    .map((claim) => buildClaimState(claim, acc))
    .sort((a, b) => b.weight - a.weight); // emphasis by weight ordering

  const prev = new Set(previousEventIds);

  return {
    stateId: cut.stateId,
    label: cut.label,
    asOf: cut.asOf,
    site: acc.site,
    claims: claimStates,
    contributors: [...acc.contributors.values()],
    integrity: buildIntegrity(claimStates, acc),
    eventIdsApplied: acc.applied,
    eventIdsSincePrevious: acc.applied.filter((id) => !prev.has(id)),
  };
}

export function reduceToStates(
  events: ContributionEvent[],
  cuts: Array<{ stateId: string; label: string; asOf: string }>,
): GraphState[] {
  const states: GraphState[] = [];
  let previous: EventId[] = [];
  for (const cut of cuts) {
    const state = reduceToState(events, cut, previous);
    states.push(state);
    previous = state.eventIdsApplied;
  }
  return states;
}
