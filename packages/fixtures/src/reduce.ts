/**
 * Builds a snapshot of the graph as it looked at a given date.
 *
 * It reads the list of contributions in `fixtures/`, applies every one up to
 * that date, and returns the result. Nobody writes a snapshot by hand, so each
 * one can tell you exactly which contributions produced it. That's what the
 * version history in the interface is built from.
 */

import type { ContributionEvent } from './events';
import type {
  Affirmation, Claim, ClaimState, Contributor, DisputeEdge, ElementStatus,
  ContributorStanding, EventId, ExtensionEdge, Flag, GraphState, IntegrityScore,
  LineageId, MediaRef, Passover, PassoverKind, ReferenceEdge, Site, SourceRecord,
  Transcript, Translation, TranslationDispute,
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
  records: Map<string, SourceRecord>;
  transcripts: Transcript[];
  flags: Flag[];
  applied: EventId[];
}

function empty(): Accumulator {
  return {
    contributors: new Map(), claims: new Map(), disputes: [], extensions: [],
    references: [], affirmations: [], passovers: [], translations: [],
    translationDisputes: [], records: new Map(), transcripts: [], flags: [],
    applied: [],
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
        verification: ev.verification ?? 'guest',
      });
      return;

    case 'claim_submitted':
      acc.claims.set(ev.claimId, {
        id: ev.claimId, siteId: ev.siteId, contributorId: ev.actorId,
        recordId: ev.recordId,
        text: ev.text, sourceLanguage: ev.sourceLanguage,
        sourceLanguageText: ev.sourceLanguageText, elements: ev.elements,
        topics: ev.topics, sourceType: ev.sourceType,
        createdAt: ev.at, awaitingTranslation: ev.awaitingTranslation ?? false,
      });
      return;

    case 'claim_extended':
      acc.claims.set(ev.claimId, {
        id: ev.claimId, siteId: ev.siteId, contributorId: ev.actorId,
        recordId: ev.recordId,
        text: ev.text, sourceLanguage: ev.sourceLanguage,
        sourceLanguageText: ev.sourceLanguageText, elements: ev.elements,
        topics: ev.topics, sourceType: ev.sourceType,
        createdAt: ev.at, parentClaimId: ev.parentClaimId,
        awaitingTranslation: false,
      });
      acc.extensions.push({
        id: `ext-${ev.id}`, type: 'extension', parentClaimId: ev.parentClaimId,
        childClaimId: ev.claimId, contributorId: ev.actorId, createdAt: ev.at,
      });
      return;

    case 'claim_disputed':
      acc.disputes.push({
        id: ev.edgeId, type: 'dispute', targetClaimId: ev.targetClaimId,
        targetElementId: ev.targetElementId, reasoning: ev.reasoning,
        proposedValue: ev.proposedValue, contributorId: ev.actorId,
        createdAt: ev.at,
      });
      return;

    case 'claim_affirmed':
      acc.affirmations.push({
        id: ev.affirmationId, claimId: ev.claimId,
        contributorId: ev.actorId, createdAt: ev.at,
      });
      return;

    case 'passover_recorded':
      acc.passovers.push({
        id: ev.passoverId, claimId: ev.claimId, contributorId: ev.actorId,
        kind: ev.passoverKind, createdAt: ev.at,
      });
      return;

    case 'translation_submitted': {
      acc.translations.push({
        id: ev.translationId, claimId: ev.claimId,
        contributorId: ev.actorId, targetLanguage: ev.targetLanguage,
        text: ev.text, createdAt: ev.at,
      });
      // A rendering exists, so the claim enters the graph. The original
      // is untouched; the first rendering supplies the reading text.
      const claim = acc.claims.get(ev.claimId);
      if (claim?.awaitingTranslation) {
        claim.awaitingTranslation = false;
        if (!claim.text) claim.text = ev.text;
      }
      return;
    }

    case 'translation_disputed':
      acc.translationDisputes.push({
        id: ev.disputeId, translationId: ev.translationId,
        contributorId: ev.actorId, reasoning: ev.reasoning, createdAt: ev.at,
      });
      return;

    case 'record_submitted': {
      const media: MediaRef[] = (ev.media ?? []).map((m) => ({
        id: m.mediaId, recordId: ev.recordId, kind: m.kind,
        storageKey: m.storageKey, contentType: m.contentType,
        byteSize: m.byteSize, checksum: m.checksum,
        originalFilename: m.originalFilename,
        processing: m.processing ?? 'uploaded',
        durationSeconds: m.durationSeconds, width: m.width, height: m.height,
        capturedAt: m.capturedAt, derivatives: [], createdAt: ev.at,
      }));
      acc.records.set(ev.recordId, {
        id: ev.recordId, siteId: ev.siteId, contributorId: ev.actorId,
        note: ev.note, text: ev.text, language: ev.language,
        capturedAt: ev.capturedAt, capturedLocation: ev.capturedLocation,
        submission: ev.submission ?? 'submitted', media, createdAt: ev.at,
      });
      return;
    }

    case 'media_processed': {
      const rec = acc.records.get(ev.recordId);
      if (!rec) throw new Error(`media_processed for unknown record ${ev.recordId}`);
      const file = rec.media.find((m) => m.id === ev.mediaId);
      if (!file) throw new Error(`media_processed for unknown file ${ev.mediaId}`);
      file.processing = ev.processing;
      file.processingError = ev.processingError;
      if (ev.durationSeconds !== undefined) file.durationSeconds = ev.durationSeconds;
      if (ev.width !== undefined) file.width = ev.width;
      if (ev.height !== undefined) file.height = ev.height;
      if (ev.derivatives) file.derivatives = ev.derivatives;
      if (ev.submission) rec.submission = ev.submission;
      return;
    }

    case 'transcript_submitted': {
      acc.transcripts.push({
        id: ev.transcriptId, recordId: ev.recordId, contributorId: ev.actorId,
        language: ev.language, text: ev.text, method: ev.method, createdAt: ev.at,
      });
      const rec = acc.records.get(ev.recordId);
      if (rec && ev.submission) rec.submission = ev.submission;
      return;
    }

    case 'record_flagged':
      acc.flags.push({
        id: ev.flagId, recordId: ev.recordId, contributorId: ev.actorId,
        reason: ev.reason, reasoning: ev.reasoning, status: 'open',
        createdAt: ev.at,
      });
      return;

    case 'reference_marked':
      acc.references.push({
        id: ev.edgeId, type: 'reference', fromClaimId: ev.fromClaimId,
        toSiteId: ev.toSiteId, toClaimId: ev.toClaimId, excerpt: ev.excerpt,
        resolved: ev.resolved, contributorId: ev.actorId, createdAt: ev.at,
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
  const record = acc.records.get(claim.recordId);
  if (!record) {
    // Every claim is somebody's reading of something. A claim pointing at a
    // record that does not exist is a broken fixture, not a renderable state.
    throw new Error(
      `Claim ${claim.id} was read out of ${claim.recordId}, which does not exist.`,
    );
  }
  const contributor = acc.contributors.get(claim.contributorId);
  if (!contributor) {
    // Can only happen if a contribution references someone who never registered.
    // That's a bug in the fixture data, so fail loudly rather than rendering a blank.
    throw new Error(
      `Claim ${claim.id} is attributed to ${claim.contributorId}, who was never registered.`,
    );
  }
  const affirmations = acc.affirmations.filter((a) => a.claimId === claim.id);
  const disputes = acc.disputes.filter((d) => d.targetClaimId === claim.id);
  const extensions = acc.extensions.filter((e) => e.parentClaimId === claim.id).map((e) => e.childClaimId);
  const references = acc.references.filter((r) => r.fromClaimId === claim.id);
  const translations = acc.translations.filter((t) => t.claimId === claim.id);
  const translationIds = new Set(translations.map((t) => t.id));
  const translationDisputes = acc.translationDisputes.filter((d) => translationIds.has(d.translationId));

  // Affirmer independence excludes the author AND anyone sharing the author's
  // family line. A cousin affirming a cousin's claim is the same source
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

  const extensionClaims = extensions
    .map((id) => acc.claims.get(id))
    .filter((c): c is Claim => c !== undefined);
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
    claim, contributor, record, translations, translationDisputes, affirmations,
    independentLineageCount, extensions, references, passover, elementStatuses,
    weight,
    confidence: classifyConfidence({
      independentLineageCount,
      disputeCount: disputes.length,
      awaitingTranslation: claim.awaitingTranslation,
    }),
  };
}

/**
 * What each contributor has done, counted.
 *
 * Counts only. Nothing here is weighted, combined, or turned into a score, and
 * nothing in this function should ever start doing that. See the comment on
 * `contributorStanding` in the contract for why.
 */
function buildStandings(claimStates: ClaimState[], acc: Accumulator): ContributorStanding[] {
  return [...acc.contributors.values()].map((c) => {
    const theirClaims = claimStates.filter((cs) => cs.claim.contributorId === c.id);
    const theirDisputes = acc.disputes.filter((d) => d.contributorId === c.id);

    // Every timestamped thing this person did, so tenure is measured from
    // activity rather than from when their profile first appeared.
    const times = [
      ...theirClaims.map((cs) => cs.claim.createdAt),
      ...[...acc.records.values()].filter((r) => r.contributorId === c.id).map((r) => r.createdAt),
      ...theirDisputes.map((d) => d.createdAt),
      ...acc.affirmations.filter((a) => a.contributorId === c.id).map((a) => a.createdAt),
      ...acc.translations.filter((t) => t.contributorId === c.id).map((t) => t.createdAt),
      ...acc.transcripts.filter((t) => t.contributorId === c.id).map((t) => t.createdAt),
      ...acc.flags.filter((f) => f.contributorId === c.id).map((f) => f.createdAt),
    ].sort();

    return {
      contributorId: c.id,
      firstContributionAt: times[0],
      lastContributionAt: times[times.length - 1],
      recordsSubmitted: [...acc.records.values()].filter((r) => r.contributorId === c.id).length,
      claimsAuthored: theirClaims.length,
      claimsCorroboratedByOtherLines: theirClaims.filter((cs) => cs.independentLineageCount > 0).length,
      claimsDisputed: theirClaims.filter((cs) =>
        acc.disputes.some((d) => d.targetClaimId === cs.claim.id),
      ).length,
      disputesRaised: theirDisputes.length,
      disputesRaisedWithAlternative: theirDisputes.filter((d) => d.proposedValue).length,
      affirmationsGiven: acc.affirmations.filter((a) => a.contributorId === c.id).length,
      translationsContributed: acc.translations.filter((t) => t.contributorId === c.id).length,
      transcriptsContributed: acc.transcripts.filter((t) => t.contributorId === c.id).length,
      flagsRaised: acc.flags.filter((f) => f.contributorId === c.id).length,
    };
  });
}

function buildIntegrity(claimStates: ClaimState[], acc: Accumulator): IntegrityScore {
  const inGraph = claimStates.filter((c) => !c.claim.awaitingTranslation);
  const contributorIds = new Set(claimStates.map((c) => c.claim.contributorId));
  const lineageDiversity = distinctLineages([...contributorIds], acc.contributors);
  const corroborated = inGraph.filter((c) => c.independentLineageCount >= 2).length;

  // How much of the record is anchored in time. Counted from claims that
  // actually name a date, not from a period somebody picked at entry time.
  const datedClaims = claimStates.filter((c) =>
    c.claim.elements.some((e) => e.kind === 'date'),
  ).length;

  const score = {
    totalClaims: claimStates.length,
    independentContributors: contributorIds.size,
    lineageDiversity,
    corroborationDepth: inGraph.length ? corroborated / inGraph.length : 0,
    activeDisputes: acc.disputes.length + acc.translationDisputes.length,
    datedClaims,
    awaitingTranslation: claimStates.filter((c) => c.claim.awaitingTranslation).length,
    overall: 0,
  };

  // Placeholder rollup for map marker encoding only. The intelligence layer replaces this.
  score.overall = Math.min(100, Math.round(
    Math.min(score.totalClaims, 12) * 3 +
    Math.min(score.lineageDiversity, 6) * 6 +
    score.corroborationDepth * 25 +
    Math.min(score.datedClaims, 6) * 4,
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
    records: [...acc.records.values()],
    standings: buildStandings(claimStates, acc),
    transcripts: acc.transcripts,
    flags: acc.flags,
    integrity: buildIntegrity(claimStates, acc),
    eventIdsApplied: acc.applied,
    eventIdsSincePrevious: acc.applied.filter((id) => !prev.has(id)),
  };
}

export function reduceToStates(
  events: ContributionEvent[],
  cuts: { stateId: string; label: string; asOf: string }[],
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
