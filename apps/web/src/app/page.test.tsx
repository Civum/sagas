import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sagas/read-model', async () => {
  const { loadSiteState, loadWorld } = await import('@sagas/fixtures/acceptance');
  return {
    DEFAULT_SITE: 'corner-shop',
    getSiteState: (slug: string, stateId: string) => loadSiteState(slug, stateId),
    listSites: () => loadWorld('t3').map((state) => state.site),
  };
});

import Page from './page';

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', undefined));
afterEach(() => vi.unstubAllEnvs());

describe('home', () => {
  it('preserves the Corner Shop article beside all six places without a token', () => {
    const html = renderToStaticMarkup(<Page />);
    const article = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1];
    const list = /<nav aria-label="Places in the archive">([\s\S]*?)<\/nav>/.exec(html)?.[1];

    expect(article).toContain('The shop on the corner');
    expect(article).toContain('The shop stood');
    expect(list?.match(/<li\b/g)).toHaveLength(6);
    expect(list).toContain('href="/sites/corner-shop"');
    expect(html).toContain('Filter places');
  });
});
