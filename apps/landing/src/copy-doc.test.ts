import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

import type { PageCopy } from './model';
import { INVENTED_LABELS } from './model';
import { content } from './content';
import { compareCopy, parseCopyDoc } from './copy-doc';

// The page's words live in two places: the Design copy document
// (apps/web/LANDING-PAGE-COPY.md, the source of truth) and src/content.ts,
// which the page is built from. Nothing copies one into the other
// automatically, so these tests fail whenever they drift apart, field by field,
// in either direction. See copy-doc.ts for how the document is read.

const DOC_PATH = path.join(import.meta.dirname, '..', '..', 'web', 'LANDING-PAGE-COPY.md');
const realDoc = readFileSync(DOC_PATH, 'utf8');

describe('the real page and the real copy document', () => {
  it('match, field by field', () => {
    expect(compareCopy(realDoc, content.copy)).toEqual([]);
  });

  it('are read field by field', () => {
    // Guards the parser: if the document's layout changed so that fields were
    // no longer found, the comparison above would have little to compare.
    const fields = [...parseCopyDoc(realDoc).keys()].filter((k) => !k.endsWith('(title)'));
    expect(fields.length).toBeGreaterThanOrEqual(20);
  });
});

// The cases below check the comparison itself, on a small fixed document and
// matching copy, so they keep working whatever the real wording becomes. The
// one shared piece, the invented-material label, comes from the same constant
// the page uses.

const FIXTURE_DOC = `# Copy

## Draft page

### Status banner

> Banner text.

### Navigation

**Wordmark:** Brand

**Navigation link:** Nav label

### Hero

**Eyebrow**

> Eyebrow text

**Headline**

> Headline text.

**Supporting copy**

> Supporting text that wraps
> onto a second line.

**Primary action**

> Action label

**Worked example**

> Example place - ${INVENTED_LABELS.illustration}

### Why Sagas exists

**Heading**

> Why heading.

**Copy**

> Why text.

### How it works

**Section label:** How label

**Heading**

> How heading.

#### 01 - Step one

> Step one text.

#### 02 - Step two

> Step two text.

#### 03 - Step three

> Step three text.

### Principle

**Copy**

> Principle text.

### Where Sagas stands

**Heading**

> Stands heading.

**Copy**

> Stands text.

**Contact**

> Write to [someone@example.org](mailto:someone@example.org).

### Footer

**Status text:** Footer status

## Notes

Anything after the Draft page section is ignored.
`;

const FIXTURE_COPY: PageCopy = {
  meta: { title: 'Brand', description: 'Not in the copy document.' },
  draftBanner: 'Banner text.',
  nav: { wordmark: 'Brand', link: { label: 'Nav label', href: '#how' } },
  hero: {
    eyebrow: 'Eyebrow text',
    headline: 'Headline text.',
    supporting: 'Supporting text that wraps onto a second line.',
    action: { label: 'Action label', href: '#why' },
    illustration: { name: 'Example place', invented: 'illustration' },
  },
  why: { id: 'why', label: 'Why Sagas exists', heading: 'Why heading.', text: 'Why text.' },
  how: {
    id: 'how',
    label: 'How label',
    heading: 'How heading.',
    steps: [
      { title: 'Step one', text: 'Step one text.' },
      { title: 'Step two', text: 'Step two text.' },
      { title: 'Step three', text: 'Step three text.' },
    ],
  },
  principle: { id: 'principle', label: 'Not in the copy document', statement: 'Principle text.' },
  stands: {
    id: 'stands',
    label: 'Where Sagas stands',
    heading: 'Stands heading.',
    text: 'Stands text.',
    contact: { lead: 'Write to', email: 'someone@example.org' },
  },
  footer: { wordmark: 'Brand', status: 'Footer status' },
};

function editCopy(change: (c: PageCopy) => void): PageCopy {
  const copy = structuredClone(FIXTURE_COPY);
  change(copy);
  return copy;
}

function editDoc(from: string, to: string): string {
  // Fails loudly if the fixture changes and the edit no longer applies, so a
  // case can never pass by editing nothing.
  expect(FIXTURE_DOC).toContain(from);
  return FIXTURE_DOC.replace(from, to);
}

describe('the comparison', () => {
  it('passes when the fixture document and copy match', () => {
    expect(compareCopy(FIXTURE_DOC, FIXTURE_COPY)).toEqual([]);
  });

  it('catches a label changed only in the copy document', () => {
    const doc = editDoc('**Navigation link:** Nav label', '**Navigation link:** Other label');
    expect(compareCopy(doc, FIXTURE_COPY)).toEqual([
      expect.stringMatching(/^nav\.link\.label is "Nav label".*"Other label"/),
    ]);
  });

  it('catches two headings swapped in content.ts, though both sentences still exist', () => {
    const copy = editCopy((c) => {
      [c.why.heading, c.how.heading] = [c.how.heading, c.why.heading];
    });
    const problems = compareCopy(FIXTURE_DOC, copy);
    expect(problems).toHaveLength(2);
    expect(problems[0]).toMatch(/^why\.heading/);
    expect(problems[1]).toMatch(/^how\.heading/);
  });

  it('catches a step title changed only in content.ts', () => {
    const copy = editCopy((c) => {
      c.how.steps[2] = { title: 'Changed', text: 'Step three text.' };
    });
    expect(compareCopy(FIXTURE_DOC, copy)).toEqual([
      expect.stringMatching(/^how\.steps\[2\]\.title/),
    ]);
  });

  it('catches the footer changed only in the copy document', () => {
    const doc = editDoc('**Status text:** Footer status', '**Status text:** Something else');
    expect(compareCopy(doc, FIXTURE_COPY)).toEqual([expect.stringMatching(/^footer\.status/)]);
  });

  it('catches a new field in the copy document that the page does not use', () => {
    const doc = editDoc('### Footer', '**Second contact**\n\n> Another line.\n\n### Footer');
    expect(compareCopy(doc, FIXTURE_COPY)).toEqual([
      expect.stringMatching(/"Where Sagas stands \/ Second contact".*nothing on the page uses it/),
    ]);
  });

  it('catches a field removed from the copy document', () => {
    const doc = editDoc('**Section label:** How label\n', '');
    expect(compareCopy(doc, FIXTURE_COPY)).toEqual([
      expect.stringMatching(
        /^how\.label: the copy document has no "How it works \/ Section label"/,
      ),
    ]);
  });

  it('ignores a changed dash or capital letter', () => {
    const doc = editDoc('**Status text:** Footer status', '**Status text:** Footer — Status');
    expect(compareCopy(doc, FIXTURE_COPY)).toEqual([]);
  });

  it('reports a document with no Draft page section', () => {
    expect(compareCopy('# Nothing here', FIXTURE_COPY)).toEqual([
      expect.stringMatching(/no "## Draft page" section/),
    ]);
  });
});
