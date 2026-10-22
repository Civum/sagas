import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { IntegrityScore } from '@sagas/contracts';
import { IntegrityBadge } from './IntegrityBadge';

describe('IntegrityBadge', () => {
  it('describes the record in words without exposing scores or counts', () => {
    const integrity: IntegrityScore = {
      totalClaims: 3,
      independentContributors: 1,
      corroborationDepth: 0,
      activeDisputes: 0,
      datedClaims: 1,
      awaitingTranslation: 0,
      overall: 23,
    };
    const markup = renderToStaticMarkup(<IntegrityBadge integrity={integrity} />);
    const visibleText = markup.replace(/<[^>]*>/g, '');

    expect(visibleText).toContain('Thin record');
    expect(visibleText).toContain('More would help.');
    expect(visibleText).not.toMatch(/\d/);
  });
});
