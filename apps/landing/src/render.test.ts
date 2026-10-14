import { describe, expect, it } from 'vitest';

import type { LandingContent, PageCopy } from './model';
import { escapeHtml, renderPage } from './render';

const copy: PageCopy = {
  meta: { title: 'T', description: 'D' },
  draftBanner: 'Draft banner',
  nav: { wordmark: 'W', link: { label: 'Go', href: '#how' } },
  hero: {
    eyebrow: 'Eyebrow',
    headline: 'Headline',
    supporting: 'Supporting',
    action: { label: 'Act', href: '#how' },
    illustration: { invented: 'illustration' },
  },
  how: {
    id: 'how',
    label: 'Label',
    heading: 'Heading',
    steps: [
      { title: 'One', text: 'a' },
      { title: 'Two', text: 'b' },
      { title: 'Three', text: 'c' },
    ],
  },
  principle: { id: 'principle', label: 'Principle', statement: 'Statement' },
  footer: { wordmark: 'W', status: 'Status' },
};

const approved: LandingContent = {
  status: 'approved',
  approval: {
    link: 'https://github.com/o/r/issues/1#issuecomment-1',
    date: '2026-10-23',
    copySha256: 'not-checked-here',
  },
  copy,
};

describe('renderPage', () => {
  const html = renderPage(approved);

  it('declares the language and a viewport for phones', () => {
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('name="viewport"');
  });

  it('has one h1 and never skips a heading level', () => {
    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect((levels[i] ?? 0) - (levels[i - 1] ?? 0)).toBeLessThanOrEqual(1);
    }
  });

  it('has a skip link and labelled landmarks', () => {
    expect(html).toContain('href="#main"');
    expect(html).toContain('<main id="main"');
    expect(html).toContain('<nav aria-label="Main">');
  });

  it('gives every link a visible keyboard focus style', () => {
    const links = [...html.matchAll(/<a [^>]*>/g)].map((m) => m[0]);
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) expect(a).toMatch(/focus(-visible)?:outline/);
  });

  it('numbers the steps in order, hidden from screen readers', () => {
    expect(html).toMatch(/aria-hidden="true">01<\/p>[\s\S]*>02<\/p>[\s\S]*>03<\/p>/);
    expect(html).toContain('<ol');
  });

  it('keeps the illustration out of the accessibility tree but labels it in text', () => {
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).toContain('<figcaption data-invented="illustration"');
  });

  it('shows the draft banner only for a draft', () => {
    expect(html).not.toContain('data-draft-banner');
    expect(renderPage({ status: 'draft', copy })).toContain('Draft banner');
  });

  it('sends no JavaScript', () => {
    expect(html).not.toMatch(/<script\b/i);
  });

  it('escapes copy so it cannot inject markup', () => {
    const hostile = renderPage({
      ...approved,
      copy: { ...copy, footer: { wordmark: 'W', status: '<script>alert(1)</script>' } },
    });
    expect(hostile).not.toContain('<script>alert(1)</script>');
    expect(hostile).toContain('&lt;script&gt;');
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML-special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });
});
