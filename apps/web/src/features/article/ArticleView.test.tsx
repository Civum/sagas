import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { GraphState } from '@sagas/contracts';
import { loadSiteState } from '@sagas/fixtures/acceptance';
import { ArticleView } from './ArticleView';

function renderArticle(stateId: 't0' | 't1' | 't2' | 't3', records?: GraphState['records']) {
  const state = loadSiteState('corner-shop', stateId);
  return renderToStaticMarkup(
    <ArticleView state={records ? { ...state, records } : state} />,
  );
}

describe('ArticleView', () => {
  it('renders sections in state order with their headings and passages', () => {
    const page = renderArticle('t3');
    const shopHeading = page.indexOf('The shop on the corner');
    const shopPassage = page.indexOf('The shop stood on the corner');
    const signHeading = page.indexOf('The sign');
    const signPassage = page.indexOf('A sign reading FERRIS GROCERY');

    expect(shopHeading).toBeGreaterThanOrEqual(0);
    expect(shopPassage).toBeGreaterThan(shopHeading);
    expect(signHeading).toBeGreaterThan(shopPassage);
    expect(signPassage).toBeGreaterThan(signHeading);
  });

  it('shows both disputed date readings with attribution and the supplied reasoning', () => {
    const page = renderArticle('t2');

    expect(page).toContain('c. 1950');
    expect(page).toContain('1956 or later');
    expect(page).toContain('Ray Okafor (invented)');
    expect(page).toContain('Owen Pike (invented)');
    expect(page).toContain('It can&#x27;t be 1950. The awning in the photo went up in 1956.');
    expect(page).not.toContain('vote');
    expect(page).not.toContain('>1<');
  });

  it('keeps t0 records visible and explains that no claims have been shared yet', () => {
    const page = renderArticle('t0');

    expect(page).toContain('Records');
    expect(page).toContain('My grandmother&#x27;s shop, I think.');
    expect(page).toContain('Provided by June Alder (invented)');
    expect(page).toContain('No claims have been shared about this site yet.');
    expect(page).toContain('Its records are listed above.');
    expect(page).not.toContain('TODO');
  });

  it('shows a valid page when there are no sections, claims, or records', () => {
    const page = renderArticle('t0', []);

    expect(page).toContain('The corner shop');
    expect(page).toContain('No records have been shared yet.');
    expect(page).toContain('No claims have been shared about this site yet.');
    expect(page).not.toContain('TODO');
  });
});
