import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/queries', async () => {
  const { loadSiteState } = await import('@sagas/fixtures/acceptance');
  return {
    DEFAULT_SITE: 'corner-shop',
    FIXTURE_STATES: ['t0', 't1', 't2', 't3'],
    getSiteState: (_slug: string, stateId: 't0' | 't1' | 't2' | 't3') =>
      loadSiteState('corner-shop', stateId),
    listSites: (stateId: 't0' | 't1' | 't2' | 't3') => [loadSiteState('corner-shop', stateId).site],
  };
});

import DevPage from './page';

async function renderDevPage(state: string) {
  const page = await DevPage({
    searchParams: Promise.resolve({ site: 'corner-shop', state }),
  });
  return renderToStaticMarkup(page);
}

/**
 * Prefix: ID N3-UNIT-01
 * Description/Summary: The fixture history control offers all four chronological states and identifies the selected state.
 * Pre-requisites: Corner shop fixture states t0, t1, t2, and t3.
 * Category/component: MVC — Controller/View / DevPage
 * Author: Canon Heise
 * Requirement/Story: N3 — A control moves between the four states.
 * Test Steps: Some Action followed by Results, until you Verify the requirement.
 * Action: Render /dev with each requested state in turn.
 * Results: The page contains links for t0 through t3, each preserving the selected site, and marks the requested state current.
 * Verify: Check each state link and current-state marker in the rendered page.
 */
describe('/dev fixture history', () => {
  it('provides navigation to all four states and marks the active one', async () => {
    for (const state of ['t0', 't1', 't2', 't3']) {
      const html = await renderDevPage(state);
      expect(html).toContain('aria-label="Fixture history, oldest to newest"');
      for (const id of ['t0', 't1', 't2', 't3']) {
        expect(html).toContain(`href="/dev?site=corner-shop&amp;state=${id}"`);
      }
      expect(html).toContain(`aria-current="page"`);
      expect(html).toContain(`Viewing ${state}`);
      const historyNav = html.split('aria-label="Fixture history, oldest to newest"')[1];
      const selectedLink = historyNav?.match(new RegExp(`<a[^>]*href="/dev\\?site=corner-shop&amp;state=${state}"[^>]*>`));
      expect(selectedLink?.[0]).toContain('aria-current="page"');
    }
  });

  /**
   * Prefix: ID N3-UNIT-02
   * Description/Summary: Changing the selected fixture state re-renders the article, including the empty-section t0 case.
   * Pre-requisites: Corner shop t0 and t3 fixture data.
   * Category/component: MVC — Controller/View / DevPage and ArticleView
   * Author: Canon Heise
   * Requirement/Story: N3 — The page re-renders across history, including t0 with no sections.
   * Test Steps: Some Action followed by Results, until you Verify the requirement.
   * Action: Render /dev first at t0, then at t3.
   * Results: t0 presents the no-sections narrative status and records; t3 presents its composed narrative section and passage.
   * Verify: Assert that the respective rendered pages show their state-specific article content.
   */
  it('renders state-specific articles, including t0 without sections', async () => {
    const t0 = await renderDevPage('t0');
    const t3 = await renderDevPage('t3');

    expect(t0).toContain('No claims have been shared about this site yet.');
    expect(t0).toContain('Its records are listed above.');
    expect(t3).toContain('The shop on the corner');
    expect(t3).toContain('The shop stood');
    expect(t0).not.toContain('The shop on the corner');
  });
});
