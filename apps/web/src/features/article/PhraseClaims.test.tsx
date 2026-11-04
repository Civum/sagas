import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ClaimState } from '@sagas/contracts';
import { loadSiteState } from '@sagas/fixtures/acceptance';
import { PhraseClaims, SelectedPhraseClaims } from './PhraseClaims';

const state = loadSiteState('corner-shop', 't3');
const composition = state.compositions[0];
if (!composition) throw new Error('corner shop t3 fixture has no composition');
const claims = new Map(state.claims.map((claim) => [claim.claim.id, claim]));

describe('PhraseClaims', () => {
  it('renders phrases as collapsed native buttons', () => {
    const html = renderToStaticMarkup(<PhraseClaims composition={composition} claims={claims} />);
    expect(html).toContain('<button');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Mr. Ferris');
  });

  it('orders claims by weight and nests extensions under their parent', () => {
    const span = composition.spans.find((candidate) => candidate.claimIds.length > 1);
    if (!span) throw new Error('fixture has no span naming multiple claims');
    const html = renderToStaticMarkup(<SelectedPhraseClaims span={span} claims={claims} />);
    const expectedIds = [...span.claimIds].sort(
      (left, right) => (claims.get(right)?.weight ?? 0) - (claims.get(left)?.weight ?? 0),
    );
    const positions = expectedIds.map((id) => {
      expect(html.split(`data-claim-id="${id}"`).length - 1).toBe(1);
      return html.indexOf(`data-claim-id="${id}"`);
    });
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    const parent = state.claims.find((claim) => claim.extensions.includes('cl-cs-uncle'));
    if (!parent) throw new Error('fixture has no parent for cl-cs-uncle');
    expect(html.indexOf(`data-claim-id="${parent.claim.id}"`)).toBeLessThan(
      html.indexOf('data-claim-id="cl-cs-uncle"'),
    );
    expect(html).toContain('border-l-2');
  });

  it('shows a named extension even when its parent is not named by the span', () => {
    const span = composition.spans.find((candidate) =>
      candidate.claimIds.some((id) =>
        state.claims.some(
          (claim) => claim.extensions.includes(id) && !candidate.claimIds.includes(claim.claim.id),
        ),
      ),
    );
    if (!span) throw new Error('fixture has no span naming an extension alone');
    const html = renderToStaticMarkup(<SelectedPhraseClaims span={span} claims={claims} />);
    for (const id of span.claimIds) expect(html).toContain(`data-claim-id="${id}"`);
  });

  /**
   * Prefix: ID N2-UNIT-09
   * Description/Summary: Extension chains remain visible and nested, with each claim shown once.
   * Pre-requisites: Corner shop t3 base claim, extended into a three-claim chain.
   * Category/component: MVC — View / PhraseClaims
   * Requirement/Story: N2 — Extensions appear under the claim they add to.
   * Action: Render a span naming the entire chain, then one naming only its root.
   * Results: A, B and C each appear once, nested in order under their parent.
   * Verify: Count and compare the positions of each claim marker in the rendered output.
   */
  it('keeps every level of an extension chain visible exactly once', () => {
    const base = claims.get('cl-cs-shop');
    if (!base) throw new Error('fixture has no cl-cs-shop claim');
    const chain = new Map<string, ClaimState>([
      ['a', { ...base, claim: { ...base.claim, id: 'a' }, extensions: ['b'] }],
      ['b', { ...base, claim: { ...base.claim, id: 'b' }, extensions: ['c'] }],
      ['c', { ...base, claim: { ...base.claim, id: 'c' }, extensions: [] }],
    ]);

    for (const claimIds of [['a', 'b', 'c'], ['a']]) {
      const html = renderToStaticMarkup(
        <SelectedPhraseClaims span={{ start: 0, end: 1, claimIds }} claims={chain} />,
      );
      const positions = ['a', 'b', 'c'].map((id) => {
        expect(html.split(`data-claim-id="${id}"`).length - 1).toBe(1);
        return html.indexOf(`data-claim-id="${id}"`);
      });
      expect(positions).toEqual([...positions].sort((left, right) => left - right));
    }
  });
});
