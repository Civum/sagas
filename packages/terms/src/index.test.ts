import { describe, expect, it } from 'vitest';

import { readTermsMarkdown, renderTermsMarkdown } from './index';

describe('contributor terms renderer', () => {
  const markdown = readTermsMarkdown();
  const html = renderTermsMarkdown(markdown);

  it('renders the canonical document structurally', () => {
    const title = /^#\s+(.+)$/m.exec(markdown)?.[1];
    expect(title).toBeTruthy();
    expect(html).toContain(renderTermsMarkdown(`# ${title}`));
    expect(html.trim()).not.toBe('');
    expect(html).toMatch(/<h2>[^<]+<\/h2>/);
  });

  it('fails the test when the source uses unsupported Markdown constructs', () => {
    // This intentionally checks the upstream-controlled document so a future
    // sync cannot silently add syntax this renderer does not support.
    const withoutUrls = markdown
      .replace(/\[[^\]]+\]\(https?:[^)]*\)/g, '')
      .replace(/https?:\/\/\S+/g, '');
    expect(withoutUrls).not.toMatch(
      /^(?:[ \t]*\d+\.[ \t]|>[ \t]|```|---$|\|)|^[ \t]{2,}[-*][ \t]|!\[|^</m,
    );
    expect(withoutUrls).not.toMatch(/(?:^|[ \t(])_[^_\n]+_(?=[ \t.,!?;:)\]}]|$)/m);
    expect(withoutUrls).not.toMatch(/(?:^|[ \t(])\*[^*\n]+\*(?=[ \t.,!?;:)\]}]|$)/m);
  });

  it('does not create executable links from unsafe targets', () => {
    const unsafe = renderTermsMarkdown('[x](javascript:alert(1))');
    expect(unsafe).not.toContain('href=');
    expect(unsafe).toContain('x');
  });

  it('does not turn protocol-relative or backslash-relative targets into links', () => {
    const rendered = renderTermsMarkdown('[relative](//example.com) [backslash](/\\example.com)');
    expect(rendered).not.toContain('href=');
    expect(rendered).toContain('relative');
    expect(rendered).toContain('backslash');
  });
});
