'use client';

import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Composition, ClaimState } from '@sagas/contracts';
import { ClaimView } from './ClaimView';

/** A passage whose cited phrases open the claims they are based on. */
export function PhraseClaims({
  composition,
  claims,
}: {
  composition: Composition;
  claims: Map<string, ClaimState>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const buttonRefs = useRef(new Map<number, HTMLButtonElement>());
  const id = useId();
  const spans = composition.spans
    .map((span, index) => ({ span, index }))
    .sort((a, b) => a.span.start - b.span.start || a.span.end - b.span.end);

  const passage: ReactNode[] = [];
  let cursor = 0;
  for (const { span, index } of spans) {
    // Malformed overlapping offsets should never duplicate passage characters.
    const start = Math.max(cursor, span.start);
    if (start >= span.end) continue;
    passage.push(composition.text.slice(cursor, start));
    passage.push(
      <button
        key={`${id}-phrase-${index}`}
        ref={(button) => {
          if (button) buttonRefs.current.set(index, button);
          else buttonRefs.current.delete(index);
        }}
        type="button"
        aria-expanded={selected === index}
        aria-controls={`${id}-claims`}
        className="rounded-sm underline decoration-dotted underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => setSelected((current) => (current === index ? null : index))}
      >
        {composition.text.slice(start, span.end)}
      </button>,
    );
    cursor = span.end;
  }
  passage.push(composition.text.slice(cursor));

  const selectedSpan =
    selected === null ? undefined : composition.spans[selected];

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">{passage}</p>
      <section
        id={`${id}-claims`}
        aria-label="Claims behind this phrase"
        className="space-y-3"
        hidden={!selectedSpan}
      >
        {selectedSpan && <SelectedPhraseClaims span={selectedSpan} claims={claims} />}
        {selectedSpan && (
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              if (selected === null) return;
              const phraseButton = buttonRefs.current.get(selected);
              setSelected(null);
              phraseButton?.focus();
            }}
          >
            Back to passage
          </button>
        )}
      </section>
    </div>
  );
}

/** The claims named by a phrase, with each extension nested under its parent. */
export function SelectedPhraseClaims({
  span,
  claims,
}: {
  span: Composition['spans'][number];
  claims: Map<string, ClaimState>;
}) {
  const named = span.claimIds
    .map((claimId) => claims.get(claimId))
    .filter((claim): claim is ClaimState => Boolean(claim));
  const nested = new Set(named.flatMap((claim) => [...descendantsOf(claim, claims)]));

  return (
    <div className="space-y-3">
      {named
        .filter((claim) => !nested.has(claim.claim.id))
        .sort((a, b) => b.weight - a.weight)
        .map((claim) => (
          <div key={claim.claim.id} data-claim-id={claim.claim.id}>
            <ClaimView claim={claim} detailIds={span.detailIds} />
            <Extensions
              claim={claim}
              claims={claims}
              detailIds={span.detailIds}
              ancestors={new Set([claim.claim.id])}
            />
          </div>
        ))}
    </div>
  );
}

function Extensions({
  claim,
  claims,
  detailIds,
  ancestors,
}: {
  claim: ClaimState;
  claims: Map<string, ClaimState>;
  detailIds?: string[];
  ancestors: Set<string>;
}) {
  return claim.extensions.map((claimId) => {
    const extension = claims.get(claimId);
    if (!extension || ancestors.has(claimId)) return null;
    return (
      <div key={claimId} data-claim-id={claimId} className="ml-4 border-l-2 border-neutral-300 pl-3">
        <ClaimView claim={extension} detailIds={detailIds} />
        <Extensions
          claim={extension}
          claims={claims}
          detailIds={detailIds}
          ancestors={new Set([...ancestors, claimId])}
        />
      </div>
    );
  });
}

function descendantsOf(
  claim: ClaimState,
  claims: Map<string, ClaimState>,
  found = new Set<string>(),
): Set<string> {
  for (const claimId of claim.extensions) {
    if (found.has(claimId)) continue;
    found.add(claimId);
    const extension = claims.get(claimId);
    if (extension) descendantsOf(extension, claims, found);
  }
  return found;
}
