import { describe, expect, it } from 'vitest';

import { copyHash } from './approval';
import { content } from './content';
import type { LandingContent } from './model';
import { INVENTED_LABELS, PLACEHOLDER_MARK } from './model';
import { escapeHtml, renderPage } from './render';

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
 * agreed to be named. The rule for this release is to name none, and a person
 * reviews the copy before it is approved.
 */
const KNOWN_ORGANISATIONS = [/\bcivum\b/i, /\bbyu\b/i, /brigham\s+young/i];

/**
 * The one exception: the sponsor asked for this contact address on the page
 * (his brief in the questions issue, #11). Only this exact address is allowed,
 * so any other mention still fails.
 */
const SPONSOR_CONTACT = 'info@civum.io';

describe('landing page copy', () => {
  it('names no known organisation, apart from the sponsor contact address', () => {
    const withoutContact = html.replaceAll(SPONSOR_CONTACT, '');
    for (const pattern of KNOWN_ORGANISATIONS) {
      expect(withoutContact, `found ${pattern}`).not.toMatch(pattern);
    }
  });

  it('gives the sponsor contact address as a mailto link', () => {
    expect(copy.stands.contact.email).toBe(SPONSOR_CONTACT);
    expect(html).toContain(`href="mailto:${SPONSOR_CONTACT}"`);
  });

  it('labels the worked example as invented, in visible text', () => {
    const label = INVENTED_LABELS[copy.hero.illustration.invented];
    const caption = /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/.exec(html)?.[1] ?? '';
    expect(caption).toContain(copy.hero.illustration.name);
    expect(caption).toContain(label);
  });

  it('points every on-page link at a section that exists', () => {
    for (const { href } of [copy.nav.link, copy.hero.action]) {
      expect(html).toContain(`id="${href.slice(1)}"`);
    }
  });

  it('says why Sagas exists before how it works', () => {
    expect(html.indexOf(`id="${copy.why.id}"`)).toBeGreaterThan(0);
    expect(html.indexOf(`id="${copy.why.id}"`)).toBeLessThan(html.indexOf(`id="${copy.how.id}"`));
  });

  it('avoids the words the sponsor asked us not to use', () => {
    // From the sponsor's brief: say "story", not "account"; don't say
    // "settled"; no product language like "reading product".
    for (const word of [/\baccounts?\b/i, /\bsettled\b/i, /reading product/i]) {
      for (const text of allText(copy)) expect(text, `found ${word}`).not.toMatch(word);
    }
  });

  it('has three steps in how it works', () => {
    expect(copy.how.steps).toHaveLength(3);
  });

  it('tracks design-step approval separately from release approval', () => {
    expect(content.status).toBe('approved');
    expect(content.designSteps?.De2.status).toBe('approved');
    expect(content.designSteps?.De4.status).toBe('draft');
    expect(content.designSteps?.De5.status).toBe('draft');
    expect(content.designSteps?.De6.status).toBe('draft');
    expect(content.designSteps?.De7.status).toBe('draft');
    expect(content.designSteps?.De4.copy.heading).toContain('archive');
    expect(content.designSteps?.De5.copy.text).toContain('not a promise');
    expect(content.designSteps?.De7.components).toHaveLength(5);
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

// Every piece of copy must reach the page, in the part of the page it belongs
// to, whether the copy is a draft or approved. This catches a layout change
// that silently drops or moves text, which comparing the copy document with
// content.ts cannot see.

/** The HTML of one part of the page, from its opening tag to its closing tag. */
function region(page: string, opening: RegExp, closing: string): string {
  const match = opening.exec(page);
  if (!match) return '';
  const end = page.indexOf(closing, match.index);
  return page.slice(match.index, end === -1 ? undefined : end);
}

function regions(page: string) {
  return {
    banner: region(page, /<div [^>]*data-draft-banner/, '</div>'),
    header: region(page, /<header\b/, '</header>'),
    hero: region(page, /<section aria-labelledby="hero-h"/, '</section>'),
    why: region(page, new RegExp(`<section id="${copy.why.id}"`), '</section>'),
    how: region(page, new RegExp(`<section id="${copy.how.id}"`), '</section>'),
    principle: region(page, new RegExp(`<section id="${copy.principle.id}"`), '</section>'),
    stands: region(page, new RegExp(`<section id="${copy.stands.id}"`), '</section>'),
    footer: region(page, /<footer\b/, '</footer>'),
  };
}

/** Each step of "How it works", in order: the HTML of its own list item. */
function steps(page: string): string[] {
  const how = region(page, new RegExp(`<section id="${copy.how.id}"`), '</section>');
  return [...how.matchAll(/<li\b[\s\S]*?<\/li>/g)].map((m) => m[0]);
}

type Region = keyof ReturnType<typeof regions> | `step ${number}`;

/** Where each visible field of the current copy must appear. */
const placements: [field: string, text: string, where: Region][] = [
  ['nav.wordmark', copy.nav.wordmark, 'header'],
  ['nav.link.label', copy.nav.link.label, 'header'],
  ['hero.eyebrow', copy.hero.eyebrow, 'hero'],
  ['hero.headline', copy.hero.headline, 'hero'],
  ['hero.supporting', copy.hero.supporting, 'hero'],
  ['hero.action.label', copy.hero.action.label, 'hero'],
  ['hero.illustration.name', copy.hero.illustration.name, 'hero'],
  ['invented label', INVENTED_LABELS[copy.hero.illustration.invented], 'hero'],
  ['why.label', copy.why.label, 'why'],
  ['why.heading', copy.why.heading, 'why'],
  ['why.text', copy.why.text, 'why'],
  ['how.label', copy.how.label, 'how'],
  ['how.heading', copy.how.heading, 'how'],
  ...copy.how.steps.flatMap((step, i): [string, string, Region][] => [
    [`how.steps[${i}].title`, step.title, `step ${i + 1}`],
    [`how.steps[${i}].text`, step.text, `step ${i + 1}`],
  ]),
  ['principle.label', copy.principle.label, 'principle'],
  ['principle.statement', copy.principle.statement, 'principle'],
  ['stands.label', copy.stands.label, 'stands'],
  ['stands.heading', copy.stands.heading, 'stands'],
  ['stands.text', copy.stands.text, 'stands'],
  ['stands.contact.lead', copy.stands.contact.lead, 'stands'],
  ['stands.contact.email', copy.stands.contact.email, 'stands'],
  ['footer.wordmark', copy.footer.wordmark, 'footer'],
  ['footer.status', copy.footer.status, 'footer'],
];

const asDraft: LandingContent = { status: 'draft', copy };
const asApproved: LandingContent = {
  status: 'approved',
  approval: {
    link: 'https://github.com/o/r/issues/1',
    date: '2026-10-19',
    copySha256: copyHash(copy),
  },
  copy,
};

describe.each([
  ['draft', asDraft],
  ['approved', asApproved],
])('the %s page shows every field in its place', (_status, page) => {
  const html = renderPage(page);
  const parts = regions(html);
  const stepItems = steps(html);
  const partOf = (where: Region): string =>
    where.startsWith('step ')
      ? (stepItems[Number(where.slice(5)) - 1] ?? '')
      : parts[where as keyof typeof parts];

  it('renders one list item per step', () => {
    expect(stepItems).toHaveLength(copy.how.steps.length);
  });

  it.each(placements)('%s', (field, text, where) => {
    expect(partOf(where), `${field} is missing from the ${where} part of the page`).toContain(
      escapeHtml(text),
    );
  });

  it(page.status === 'draft' ? 'shows the banner text' : 'hides the banner', () => {
    if (page.status === 'draft') expect(parts.banner).toContain(escapeHtml(copy.draftBanner));
    else expect(parts.banner).toBe('');
  });
});
