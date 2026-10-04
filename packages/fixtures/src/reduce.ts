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
  Affirmation, Claim, ClaimState, Contributor, DisputeEdge, DetailStatus,
  ContributorStanding, EventId, ExtensionEdge, Flag, GraphState, IntegrityScore,
  MediaRef, Passover, PassoverKind, Site, SourceRecord,
  Transcript, Translation, TranslationDispute,
} from '@sagas/contracts';
import { classifyConfidence, computeWeight } from './weight';
import type { SiteNarrative } from './narrative';

interface Accumulator {
  site?: Site;
  contributors: Map<string, Contributor>;
  claims: Map<string, Claim>;
  disputes: DisputeEdge[];
  extensions: ExtensionEdge[];
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
    affirmations: [], passovers: [], translations: [],
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
        institution: ev.institution,
        joinedAt: ev.at, fictional: true,
        verification: ev.verification ?? 'guest',
      });
      return;

    case 'claim_submitted':
      acc.claims.set(ev.claimId, {
        id: ev.claimId, siteId: ev.siteId, contributorId: ev.actorId,
        sourceRecordId: ev.sourceRecordId, evidenceRecordIds: ev.evidenceRecordIds ?? [],
        text: ev.text, sourceLanguage: ev.sourceLanguage,
        sourceLanguageText: ev.sourceLanguageText, details: ev.details,
        topics: ev.topics, sourceType: ev.sourceType,
        createdAt: ev.at, awaitingTranslation: ev.awaitingTranslation ?? false,
      });
      return;

    case 'claim_extended':
      acc.claims.set(ev.claimId, {
        id: ev.claimId, siteId: ev.siteId, contributorId: ev.actorId,
        sourceRecordId: ev.sourceRecordId, evidenceRecordIds: ev.evidenceRecordIds ?? [],
        text: ev.text, sourceLanguage: ev.sourceLanguage,
        sourceLanguageText: ev.sourceLanguageText, details: ev.details,
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
        targetDetailId: ev.targetDetailId, reasoning: ev.reasoning,
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

  }
}

function buildClaimState(
  claim: Claim,
  acc: Accumulator,
): ClaimState {
  const sourceRecord = acc.records.get(claim.sourceRecordId);
  if (!sourceRecord) {
    // Every claim belongs to a conversation that started from a record, so a
    // missing source record is a broken fixture, not a renderable state.
    throw new Error(
      `Claim ${claim.id} has source record ${claim.sourceRecordId}, which does not exist.`,
    );
  }
  const evidenceRecords = claim.evidenceRecordIds.map((id) => {
    const r = acc.records.get(id);
    if (!r) throw new Error(`Claim ${claim.id} cites evidence ${id}, which does not exist.`);
    return r;
  });
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
  const translations = acc.translations.filter((t) => t.claimId === claim.id);
  const translationIds = new Set(translations.map((t) => t.id));
  const translationDisputes = acc.translationDisputes.filter((d) => translationIds.has(d.translationId));

  // Stand-in for independence. A claim is corroborated by records that other
  // contributors bring to it, never by agreement. Today that means the evidence
  // on extensions of this claim by somebody other than its author. A record
  // this claim already rests on does not count twice.
  const ownRecords = new Set([claim.sourceRecordId, ...claim.evidenceRecordIds]);
  const independentRecords = new Set<string>();
  for (const id of extensions) {
    const ext = acc.claims.get(id);
    if (!ext || ext.contributorId === claim.contributorId) continue;
    for (const r of ext.evidenceRecordIds) if (!ownRecords.has(r)) independentRecords.add(r);
  }
  const independentRecordCount = independentRecords.size;

  const passover: Record<PassoverKind, number> = { sounds_right: 0, dont_know: 0, dont_care: 0 };
  for (const p of acc.passovers) if (p.claimId === claim.id) passover[p.kind]++;

  const detailStatuses: DetailStatus[] = claim.details.map((detail) => {
    const detailDisputes = disputes.filter((d) => d.targetDetailId === detail.id);
    const byValue = new Map<string, string[]>();
    // The claim's own asserted value is one of the competing readings.
    byValue.set(detail.value, [claim.contributorId]);
    for (const d of detailDisputes) {
      if (!d.proposedValue) continue;
      const list = byValue.get(d.proposedValue) ?? [];
      list.push(d.contributorId);
      byValue.set(d.proposedValue, list);
    }
    const competingValues = [...byValue.entries()]
      .map(([value, contributorIds]) => ({
        value,
        count: new Set(contributorIds).size,
        contributorIds,
      }))
      // Order of arrival, the claim's own reading first. Ordering readings by
      // strength needs independence, which the stand-in cannot see for a
      // dispute, and ordering by headcount would turn readings into a vote.
      // Nothing is marked accepted and nothing is hidden.
      ;
    return { detail, disputes: detailDisputes, competingValues };
  });

  const extensionClaims = extensions
    .map((id) => acc.claims.get(id))
    .filter((c): c is Claim => c !== undefined);
  const sourceTypeDiversity = new Set([claim.sourceType, ...extensionClaims.map((c) => c.sourceType)]).size;

  const weight = computeWeight({
    sourceType: claim.sourceType,
    independentRecordCount,
    affirmationCount: affirmations.length,
    extensionCount: extensions.length,
    disputeCount: disputes.length,
    sourceTypeDiversity,
    awaitingTranslation: claim.awaitingTranslation,
  });

  return {
    claim, contributor, sourceRecord, evidenceRecords, translations, translationDisputes, affirmations,
    independentRecordCount, extensions, passover, detailStatuses,
    weight,
    confidence: classifyConfidence({
      independentRecordCount,
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
      claimsCorroborated: theirClaims.filter((cs) => cs.independentRecordCount > 0).length,
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
  const corroborated = inGraph.filter((c) => c.independentRecordCount >= 1).length;

  // How much of the record is anchored in time. Counted from claims that
  // actually name a date, not from a period somebody picked at entry time.
  const datedClaims = claimStates.filter((c) =>
    c.claim.details.some((e) => e.kind === 'date'),
  ).length;

  const score = {
    totalClaims: claimStates.length,
    independentContributors: contributorIds.size,
    corroborationDepth: inGraph.length ? corroborated / inGraph.length : 0,
    activeDisputes: acc.disputes.length + acc.translationDisputes.length,
    datedClaims,
    awaitingTranslation: claimStates.filter((c) => c.claim.awaitingTranslation).length,
    overall: 0,
  };

  // Placeholder rollup for map marker encoding only. The intelligence layer replaces this.
  score.overall = Math.min(100, Math.round(
    Math.min(score.totalClaims, 12) * 3 +
    Math.min(score.independentContributors, 6) * 6 +
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
    sections: [],
    compositions: [],
    eventIdsApplied: acc.applied,
    eventIdsSincePrevious: acc.applied.filter((id) => !prev.has(id)),
  };
}

export function reduceToStates(
  events: ContributionEvent[],
  cuts: { stateId: string; label: string; asOf: string }[],
  narrative: SiteNarrative = {},
): GraphState[] {
  const states: GraphState[] = [];
  let previous: EventId[] = [];
  for (const cut of cuts) {
    const state = reduceToState(events, cut, previous);
    // Sections are not derived from events. They stand in for output the
    // intelligence layer will produce, so they are merged in after the fold.
    const stand = narrative[cut.stateId];
    state.sections = stand?.sections ?? [];
    state.compositions = stand?.compositions ?? [];
    states.push(state);
    previous = state.eventIdsApplied;
  }
  return states;
}
