import type {
  ClaimState,
  Composition,
  Contributor,
  DetailStatus,
  GraphState,
  Section,
  SourceRecord,
} from '@sagas/contracts';
import { SiteHeader } from '../site/SiteHeader';

/** Renders one section and the disputed readings named by its composition. */
function NarrativeSection({
  section,
  composition,
  claims,
  contributors,
}: {
  section: Section;
  composition: Composition | undefined;
  claims: Map<string, ClaimState>;
  contributors: Map<string, Contributor>;
}) {
  const details = new Map<string, DetailStatus>();
  const claimAuthors = new Map<string, Contributor>();

  for (const span of composition?.spans ?? []) {
    for (const claimId of span.claimIds) {
      const claim = claims.get(claimId);
      if (!claim) continue;
      claimAuthors.set(claim.contributor.id, claim.contributor);

      const relevantDetails = span.detailIds
        ? claim.detailStatuses.filter((status) => span.detailIds?.includes(status.detail.id))
        : claim.detailStatuses;

      for (const status of relevantDetails) {
        if (status.disputes.length > 0) details.set(status.detail.id, status);
      }
    }
  }

  return (
    <section aria-labelledby={`section-${section.id}`} className="space-y-3">
      <h2 id={`section-${section.id}`} className="text-lg font-semibold">
        {section.heading}
      </h2>
      {composition ? (
        <>
          <p className="text-sm leading-relaxed">{composition.text}</p>
          {claimAuthors.size > 0 && (
            <p className="text-xs text-neutral-600">
              Based on claims by{' '}
              {[...claimAuthors.values()]
                .map((contributor) =>
                  contributor.fictional
                    ? `${contributor.displayName} (invented)`
                    : contributor.displayName,
                )
                .join(', ')}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-neutral-600">There is no passage for this section yet.</p>
      )}

      {[...details.values()].map((status) => (
        <aside
          key={status.detail.id}
          aria-label={`Different readings of ${status.detail.kind}: ${status.detail.excerpt}`}
          className="space-y-2 rounded border border-neutral-300 p-3"
        >
          <h3 className="text-sm font-medium">
            Different readings of “{status.detail.excerpt}”
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {status.competingValues.map((reading) => {
              const reason = status.disputes.find(
                (dispute) => dispute.proposedValue === reading.value,
              )?.reasoning;
              const names = reading.contributorIds
                .map((id) => {
                  const contributor = contributors.get(id);
                  return contributor
                    ? `${contributor.displayName}${contributor.fictional ? ' (invented)' : ''}`
                    : `Contributor ${id}`;
                })
                .join(', ');

              return (
                <li key={reading.value} className="space-y-1 rounded bg-neutral-50 p-3">
                  <p className="font-medium">{reading.value}</p>
                  <p className="text-xs text-neutral-600">Given by {names}</p>
                  {reason && <p className="text-sm">{reason}</p>}
                </li>
              );
            })}
          </ul>
        </aside>
      ))}
    </section>
  );
}

/** Records remain visible whether or not a site has composed sections. */
function RecordsSection({
  records,
  claims,
  contributors,
}: {
  records: SourceRecord[];
  claims: ClaimState[];
  contributors: Map<string, Contributor>;
}) {
  const recordRoles = new Map<string, Set<string>>();
  for (const { claim } of claims) {
    const sourceRoles = recordRoles.get(claim.sourceRecordId) ?? new Set<string>();
    sourceRoles.add('Source record');
    recordRoles.set(claim.sourceRecordId, sourceRoles);

    for (const recordId of claim.evidenceRecordIds) {
      const evidenceRoles = recordRoles.get(recordId) ?? new Set<string>();
      evidenceRoles.add('Evidence record');
      recordRoles.set(recordId, evidenceRoles);
    }
  }

  return (
    <section aria-labelledby="site-records" className="space-y-3">
      <h2 id="site-records" className="text-lg font-semibold">
        Records
      </h2>
      {records.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {records.map((record) => {
            const contributor = contributors.get(record.contributorId);
            const description = record.note ?? record.text;

            return (
              <li key={record.id} className="space-y-1 rounded border border-neutral-200 p-3">
                <p className="text-sm font-medium">
                  {record.media.map((media) => media.kind).join(', ') || 'Written record'}
                </p>
                <p className="text-xs text-neutral-600">
                  {[...(recordRoles.get(record.id) ?? ['Nothing claimed yet'])].join(' · ')}
                </p>
                {description && <p className="text-sm">{description}</p>}
                <p className="text-xs text-neutral-600">
                  Provided by{' '}
                  {contributor
                    ? `${contributor.displayName}${contributor.fictional ? ' (invented)' : ''}`
                    : `contributor ${record.contributorId}`}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-neutral-600">No records have been shared yet.</p>
      )}
    </section>
  );
}

/** The site narrative, rendered from the read model's site state. */
export function ArticleView({ state }: { state: GraphState }) {
  const claims = new Map(state.claims.map((claim) => [claim.claim.id, claim]));
  const contributors = new Map(
    state.contributors.map((contributor) => [contributor.id, contributor]),
  );
  const compositions = new Map(
    state.compositions.map((composition) => [composition.sectionId, composition]),
  );

  return (
    <main className="space-y-6">
      <SiteHeader state={state} />
      <RecordsSection records={state.records} claims={state.claims} contributors={contributors} />
      {state.sections.length > 0 ? (
        <div className="space-y-6">
          {state.sections.map((section) => (
            <NarrativeSection
              key={section.id}
              section={section}
              composition={compositions.get(section.id)}
              claims={claims}
              contributors={contributors}
            />
          ))}
        </div>
      ) : (
        <section
          aria-labelledby="site-narrative-status"
          className="space-y-2 rounded border border-neutral-200 bg-neutral-50 p-4"
        >
          <h2 id="site-narrative-status" className="text-lg font-semibold">
            Narrative
          </h2>
          <p className="text-sm text-neutral-700">
            {state.claims.length === 0
              ? 'No claims have been shared about this site yet. Its records are listed above.'
              : 'No narrative sections have been composed for this site yet. Its records are listed above.'}
          </p>
        </section>
      )}
    </main>
  );
}
