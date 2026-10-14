'use client';

import { useState, type ReactNode } from 'react';
import type { Composition, GraphState, Section } from '@sagas/contracts';
import { SiteHeader } from '../site/SiteHeader';
import { ClaimView } from './ClaimView';
import { VersionTimeline } from './VersionTimeline';

/**
 * The article, which is the main view: everything known about a place, read
 * as prose rather than inspected as a graph. A historian should be able to read it start to finish and also see
 * which parts are solid.
 *
 * Claims arrive ordered by weight, strongest first. Keep that order. It is how
 * the strongest reading leads without anything being marked "accepted".
 *
 * TODO: this is a list of claims right now. It has to become something that
 * reads. Extensions belong woven in near what they extend, not appended.
 */
export function ArticleView({ state }: { state: GraphState }) {
  const [selectedSpan, setSelectedSpan] = useState<string | null>(null);
  const claimsById = new Map(state.claims.map((claim) => [claim.claim.id, claim]));
  const compositionsBySection = new Map(state.compositions.map((composition) => [composition.sectionId, composition]));

  const renderComposition = (section: Section, composition: Composition) => {
    const spans = [...composition.spans].sort((a, b) => a.start - b.start);
    const parts: ReactNode[] = [];
    let cursor = 0;

    spans.forEach((span, index) => {
      if (span.start > cursor) parts.push(composition.text.slice(cursor, span.start));
      const spanKey = `${composition.id}-${index}`;
      parts.push(
        <button
          key={spanKey}
          type="button"
          className="rounded-sm underline decoration-dotted underline-offset-4 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-600"
          aria-expanded={selectedSpan === spanKey}
          onClick={() => setSelectedSpan(selectedSpan === spanKey ? null : spanKey)}
        >
          {composition.text.slice(span.start, span.end)}
        </button>,
      );
      if (selectedSpan === spanKey) {
        parts.push(
          <div key={`${spanKey}-claims`} className="my-3 space-y-3 rounded border border-neutral-200 bg-neutral-50 p-3 text-sm" role="region" aria-label={`Claims behind ${section.heading}`}>
            {span.claimIds
              .map((id) => claimsById.get(id))
              .filter((claim): claim is NonNullable<typeof claim> => Boolean(claim))
              .sort((a, b) => b.weight - a.weight)
              .map((claim) => <ClaimView key={claim.claim.id} claim={claim} />)}
          </div>,
        );
      }
      cursor = span.end;
    });
    if (cursor < composition.text.length) parts.push(composition.text.slice(cursor));
    return parts;
  };

  return (
    <main>
      <SiteHeader state={state} />
      <VersionTimeline state={state} />
      {state.sections.length > 0 ? (
        <div className="space-y-8">
          {state.sections.map((section) => {
            const composition = compositionsBySection.get(section.id);
            if (!composition) return null;
            return (
              <section key={section.id} className="space-y-3">
                <h2 className="text-xl font-semibold">{section.heading}</h2>
                <div className="text-base leading-8">{renderComposition(section, composition)}</div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="space-y-4" aria-labelledby="records-heading">
          <h2 id="records-heading" className="text-xl font-semibold">Records from this place</h2>
          {state.records.map((record) => (
            <article key={record.id} className="rounded border border-neutral-200 p-4">
              <p>{record.text ?? record.note ?? 'A contribution with no written description.'}</p>
              <p className="mt-2 text-xs text-neutral-600">Contribution from {record.createdAt.slice(0, 10)}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
