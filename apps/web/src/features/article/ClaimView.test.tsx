import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ClaimState } from '@sagas/contracts';
import { loadSiteState } from '@sagas/fixtures/acceptance';
import { ClaimView } from './ClaimView';

const claims = loadSiteState('corner-shop', 't3').claims;
const shop = claims.find((claim) => claim.claim.id === 'cl-cs-shop');
const sign = claims.find((claim) => claim.claim.id === 'cl-cs-sign');
if (!shop || !sign) throw new Error('corner shop t3 fixture is missing the shop or sign claim');

/** The claim sentence as a reader sees it: tags removed, the escaped characters back. */
function visibleText(html: string): string {
  const paragraph = /<p>(.*?)<\/p>/.exec(html)?.[1] ?? '';
  return paragraph
    .replace(/<[^>]*>/g, '')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function marks(html: string): string[] {
  return [...html.matchAll(/<mark>(.*?)<\/mark>/g)].map((match) => match[1] ?? '');
}

/**
 * Adds a detail at the given occurrence of some words in the claim's text, the way
 * contract 2.6.0 names one: by the claim id and the excerpt's positions.
 */
function withDetail(
  state: ClaimState,
  words: string,
  occurrence = 1,
): { state: ClaimState; id: string } {
  let start = -1;
  for (let found = 0; found < occurrence; found += 1) {
    start = state.claim.text.indexOf(words, start + 1);
    if (start < 0) throw new Error(`"${words}" does not occur ${occurrence} time(s) in the claim`);
  }
  const excerpt = { start, end: start + words.length, text: words };
  const id = `${state.claim.id}#${excerpt.start}-${excerpt.end}`;
  return {
    id,
    state: {
      ...state,
      detailStatuses: [
        ...state.detailStatuses,
        {
          detail: { id, excerpt },
          disputes: [],
          extensions: [],
          competingValues: [{ value: words, count: 1, contributorIds: [state.contributor.id] }],
          weight: 0,
        },
      ],
    },
  };
}

/**
 * Test case documentation
 * Prefix: ID N2-UNIT-06
 * Description/Summary: A selected detail is highlighted at its own position, and overlapping details merge.
 * Pre-requisites: Corner shop t3 (contract 2.6.0), where the shop claim's details are
 *   cl-cs-shop#50-61 ("around 1950") and cl-cs-shop#89-110 ("the owner, Mr. Ferris").
 * Category/component: MVC — View / ClaimView
 * Requirement/Story: N2 — When the span names details, the detail's words are highlighted in the claim.
 * Test Steps: Some Action followed by Results, until you Verify the requirement.
 * Action: Render the claim with fixture details, overlapping details, and a repeated word selected.
 * Results: The claim reads exactly as written; each selection is one highlight on the right words.
 * Verify: Compare the visible text with the claim text and list the highlights.
 */
describe('ClaimView detail highlighting', () => {
  it('highlights a selected detail at its own position', () => {
    const html = renderToStaticMarkup(<ClaimView claim={shop} detailIds={['cl-cs-shop#50-61']} />);
    expect(visibleText(html)).toBe(shop.claim.text);
    expect(marks(html)).toEqual(['around 1950']);
  });

  it('merges a detail inside another into one highlight', () => {
    const inner = withDetail(shop, 'Mr. Ferris');
    const html = renderToStaticMarkup(
      <ClaimView claim={inner.state} detailIds={['cl-cs-shop#89-110', inner.id]} />,
    );
    expect(visibleText(html)).toBe(shop.claim.text);
    expect(marks(html)).toEqual(['the owner, Mr. Ferris']);
  });

  it('merges partly overlapping details without duplicating words', () => {
    const partly = withDetail(shop, 'Mr. Ferris.');
    const html = renderToStaticMarkup(
      <ClaimView claim={partly.state} detailIds={['cl-cs-shop#89-110', partly.id]} />,
    );
    expect(visibleText(html)).toBe(shop.claim.text);
    expect(marks(html)).toEqual(['the owner, Mr. Ferris.']);
  });

  it('tells repeated words apart by position', () => {
    const second = withDetail(sign, 'The', 2);
    const html = renderToStaticMarkup(<ClaimView claim={second.state} detailIds={[second.id]} />);
    expect(visibleText(html)).toBe(sign.claim.text);
    expect(html).toContain('GROCERY. <mark>The</mark> previous');
    expect(marks(html)).toEqual(['The']);
  });

  /**
   * Prefix: ID N2-UNIT-07
   * Description/Summary: An untranslated claim still shows its words, and only marks words that are really there.
   * Pre-requisites: The shop claim marked awaiting translation, with and without sourceLanguageText.
   * Category/component: MVC — View / ClaimView
   * Requirement/Story: N2 — Selecting a phrase shows the claims it rests on.
   * Action: Render it without source text, then with original words the detail's positions don't match.
   * Results: Without source text it falls back to claim.text and highlights the detail; with original words it shows them unmarked.
   * Verify: Compare the visible text and the highlights.
   */
  it('falls back to the claim text when an untranslated claim lacks source text', () => {
    const untranslated: ClaimState = {
      ...shop,
      claim: { ...shop.claim, awaitingTranslation: true, sourceLanguageText: undefined },
    };
    const html = renderToStaticMarkup(
      <ClaimView claim={untranslated} detailIds={['cl-cs-shop#50-61']} />,
    );
    expect(visibleText(html)).toBe(shop.claim.text);
    expect(marks(html)).toEqual(['around 1950']);
  });

  it('leaves a detail unmarked when the words shown are not at its position', () => {
    const original = "C'est la boutique au coin de la Quatrième et de Main, vers 1950.";
    const untranslated: ClaimState = {
      ...shop,
      claim: { ...shop.claim, awaitingTranslation: true, sourceLanguageText: original },
    };
    const html = renderToStaticMarkup(
      <ClaimView claim={untranslated} detailIds={['cl-cs-shop#50-61']} />,
    );
    expect(visibleText(html)).toBe(original);
    expect(marks(html)).toEqual([]);
  });
});
