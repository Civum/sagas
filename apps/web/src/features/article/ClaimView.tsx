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

/**
 * Highlight the selected details, merging overlaps.
 *
 * Since contract 2.6.0 a detail's excerpt carries its own positions in the claim
 * text, so repeated words ("1950" twice) are told apart. An excerpt whose words
 * aren't at those positions in the text shown (an untranslated claim showing its
 * original words, say) is left unmarked rather than marking the wrong words.
 */
function highlightDetails(text: string, claim: ClaimState, detailIds: string[] = []): ReactNode {
  const ranges = detailIds
    .flatMap((id) => {
      const excerpt = claim.detailStatuses.find((status) => status.detail.id === id)?.detail
        .excerpt;
      if (!excerpt) return [];
      return text.slice(excerpt.start, excerpt.end) === excerpt.text
        ? [{ start: excerpt.start, end: excerpt.end }]
        : [];
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
