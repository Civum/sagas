import { describe, expect, it } from 'vitest';

import { assertReleasable, copyHash } from './approval';
import { content } from './content';
import type { LandingContent } from './model';
import { FIXED_TEXT, INVENTED_LABELS } from './model';

const { copy } = content;
const approvedAs = (copySha256: string): LandingContent => ({
  status: 'approved',
  approval: { link: 'https://github.com/o/r/issues/1', date: '2026-10-23', copySha256 },
  copy,
});

describe('release guard', () => {
  it('refuses a draft', () => {
    expect(() => assertReleasable({ status: 'draft', copy })).toThrow(/not approved/);
  });

  it('refuses copy that changed after approval', () => {
    const changed = approvedAs(copyHash(copy));
    changed.copy = { ...copy, footer: { ...copy.footer, status: 'Edited after approval.' } };
    expect(() => assertReleasable(changed)).toThrow(/changed since it was approved/);
  });

  it('accepts approved copy that is unchanged', () => {
    expect(() => assertReleasable(approvedAs(copyHash(copy)))).not.toThrow();
  });
});

describe('copyHash', () => {
  it('changes when a single word changes', () => {
    const edited = { ...copy, hero: { ...copy.hero, eyebrow: `${copy.hero.eyebrow}!` } };
    expect(copyHash(edited)).not.toBe(copyHash(copy));
  });

  it('changes when the invented label shown on the page changes', () => {
    const kind = copy.hero.illustration.invented;
    const labels = { ...INVENTED_LABELS, [kind]: `${INVENTED_LABELS[kind]}!` };
    expect(copyHash(copy, labels)).not.toBe(copyHash(copy));
  });

  it('changes when text the layout adds changes', () => {
    expect(
      copyHash(copy, INVENTED_LABELS, { ...FIXED_TEXT, skipLink: 'Jump to content' }),
    ).not.toBe(copyHash(copy));
  });

  it('ignores labels the page does not show', () => {
    const others = Object.keys(INVENTED_LABELS).filter(
      (k) => k !== copy.hero.illustration.invented,
    ) as (keyof typeof INVENTED_LABELS)[];
    const labels: Record<keyof typeof INVENTED_LABELS, string> = { ...INVENTED_LABELS };
    for (const k of others) labels[k] = `${labels[k]} (changed)`;
    expect(copyHash(copy, labels)).toBe(copyHash(copy));
  });
});
