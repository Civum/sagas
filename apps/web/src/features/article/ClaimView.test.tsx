import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ClaimState } from '@sagas/contracts';
import { loadSiteState } from '@sagas/fixtures/acceptance';
import { ClaimView } from './ClaimView';

const claims = loadSiteState('corner-shop', 't3').claims;
const sign = claims.find((claim) => claim.claim.id === 'cl-cs-sign');
if (!sign) throw new Error('corner shop t3 fixture has no sign claim');

function visibleText(html: string): string {
  const paragraph = /<p>(.*?)<\/p>/.exec(html)?.[1] ?? '';
  return paragraph.replace(/<[^>]*>/g, '');
}

function marks(html: string): string[] {
  return [...html.matchAll(/<mark>(.*?)<\/mark>/g)].map((match) => match[1] ?? '');
}

function withDetail(claim: ClaimState, id: string, excerpt: string): ClaimState {
  return {
    ...claim,
    claim: {
      ...claim.claim,
      details: [...claim.claim.details, { id, kind: 'event', value: excerpt, excerpt }],
    },
  };
}

describe('ClaimView detail highlighting', () => {
  it('merges overlapping details into one highlight', () => {
    const html = renderToStaticMarkup(
      <ClaimView claim={sign} detailIds={['dt-cs-sign-owner', 'dt-cs-sign-trade']} />,
    );
    expect(visibleText(html)).toBe(sign.claim.text);
    expect(marks(html)).toEqual(['FERRIS GROCERY']);
  });

  it('merges partly overlapping details without duplicating words', () => {
    const claim = withDetail(sign, 'dt-test-overlap', 'GROCERY. The previous');
    const html = renderToStaticMarkup(
      <ClaimView claim={claim} detailIds={['dt-cs-sign-owner', 'dt-test-overlap']} />,
    );
    expect(visibleText(html)).toBe(sign.claim.text);
    expect(marks(html)).toEqual(['FERRIS GROCERY. The previous']);
  });

  it('preserves the claim text when an untranslated claim lacks source text', () => {
    const untranslated: ClaimState = {
      ...sign,
      claim: { ...sign.claim, awaitingTranslation: true, sourceLanguageText: undefined },
    };
    const html = renderToStaticMarkup(
      <ClaimView claim={untranslated} detailIds={['dt-cs-sign-owner']} />,
    );
    expect(visibleText(html)).toBe(sign.claim.text);
    expect(marks(html)).toEqual(['FERRIS GROCERY']);
  });
});
