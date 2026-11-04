import type { ReactNode } from 'react';
import type { ClaimState } from '@sagas/contracts';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { DetailDisputes } from './DetailDisputes';
import { SourcePanel } from './SourcePanel';
import { TranslationPanel } from './TranslationPanel';

/**
 * One claim, with everything the community has done to it.
 *
 * This is the composition: text, how well supported it is, where people
 * disagree, how it's been rendered, and who said it. Replace the pieces one at
 * a time.
 */
export function ClaimView({ claim, detailIds }: { claim: ClaimState; detailIds?: string[] }) {
  const text =
    claim.claim.awaitingTranslation && claim.claim.sourceLanguageText
      ? claim.claim.sourceLanguageText
      : claim.claim.text;

  return (
    <article>
      <p>{highlightDetails(text, claim, detailIds)}</p>
      <ConfidenceIndicator claim={claim} />
      <DetailDisputes claim={claim} />
      <TranslationPanel claim={claim} />
      <SourcePanel claim={claim} />
    </article>
  );
}

/** Highlight the literal excerpts of selected details, merging overlaps. */
function highlightDetails(text: string, claim: ClaimState, detailIds: string[] = []): ReactNode {
  const ranges = detailIds
    .flatMap((id) => {
      const excerpt = claim.claim.details.find((detail) => detail.id === id)?.excerpt;
      const start = excerpt ? text.indexOf(excerpt) : -1;
      return excerpt && start >= 0 ? [{ start, end: start + excerpt.length }] : [];
    })
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range.start < last.end) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
  }
  if (merged.length === 0) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const { start, end } of merged) {
    parts.push(text.slice(cursor, start), <mark key={start}>{text.slice(start, end)}</mark>);
    cursor = end;
  }
  parts.push(text.slice(cursor));
  return parts;
}
