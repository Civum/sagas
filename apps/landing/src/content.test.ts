import { describe, expect, it } from 'vitest';

import { copyHash } from './approval';
import { content } from './content';
import { INVENTED_LABELS, PLACEHOLDER_MARK } from './model';
import { renderPage } from './render';

// Guards on the copy that actually ships. They run in CI on every pull
// request, through the existing `test` step.

const html = renderPage(content);
const { copy } = content;

/** Every string a visitor can read, from the content itself. */
function allText(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allText);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allText);
  return [];
}

/**
 * Organisations we know are connected to this project. This is a safety net
 * for slips, not a consent check: no test can tell whether an organisation has
 * agreed to be named. The rule for this release is to name none at all, and a
 * person reviews the copy before it is approved.
 */
const KNOWN_ORGANISATIONS = [/\bcivum\b/i, /\bbyu\b/i, /brigham\s+young/i];

describe('landing page copy', () => {
  it('names no known organisation', () => {
    for (const pattern of KNOWN_ORGANISATIONS) {
      expect(html, `found ${pattern}`).not.toMatch(pattern);
    }
  });

  it('labels the illustration as invented, in visible text', () => {
    const label = INVENTED_LABELS[copy.hero.illustration.invented];
    expect(html).toMatch(new RegExp(`<figcaption[^>]*>${label}</figcaption>`));
  });

  it('points every on-page link at a section that exists', () => {
    for (const { href } of [copy.nav.link, copy.hero.action]) {
      expect(html).toContain(`id="${href.slice(1)}"`);
    }
  });

  it('has three steps in how it works', () => {
    expect(copy.how.steps).toHaveLength(3);
  });

  if (content.status === 'draft') {
    it('shows the draft banner while the copy is unapproved', () => {
      expect(html).toContain('data-draft-banner');
    });

    it('asks search engines not to index a draft', () => {
      expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    });
  } else {
    const { approval } = content;

    it('is exactly the copy the sponsor approved', () => {
      expect(copyHash(copy)).toBe(approval.copySha256);
    });

    it('links to the sponsor approval it rests on', () => {
      expect(approval.link).toMatch(/^https:\/\/github\.com\/[^/]+\/[^/]+\/(issues|pull)\/\d+/);
      expect(approval.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('has no placeholder text left', () => {
      for (const text of allText(copy)) expect(text).not.toContain(PLACEHOLDER_MARK);
    });

    it('has no draft banner or noindex', () => {
      expect(html).not.toContain('data-draft-banner');
      expect(html).not.toContain('noindex');
    });
  }
});
