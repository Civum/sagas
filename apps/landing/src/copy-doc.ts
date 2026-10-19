import type { PageCopy } from './model';
import { INVENTED_LABELS } from './model';

// Compares the page's words (content.ts) with the Design copy document
// (apps/web/LANDING-PAGE-COPY.md), field by field. Used by copy-doc.test.ts.
//
// The copy document is written for people, so this reads only its "Draft page"
// section, which follows a fixed pattern:
//
//   ### Section                  a part of the page
//   **Name:** value              a short field on one line
//   **Name**  then  > quote      a field whose text is the quoted block
//   #### 01 - Title  then  > quote   a numbered step: title and text
//   > quote right after ###      the section's only text (the banner)
//
// Values are compared word for word, ignoring capitals and punctuation, so a
// reworded or swapped field fails but a changed dash or comma does not. Once
// the copy is approved, the fingerprint (approval.ts) guards every character.

/** Lower case, words only: "Draft - It's here." becomes "draft it s here". */
export function words(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9@]+/g, ' ')
    .trim();
}

/** Plain text of a Markdown fragment: no links targets, bold or quote marks. */
function plain(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '')
    .trim();
}

/**
 * The "Draft page" section as fields, keyed "Section / Field". Section titles
 * are keyed "Section / (title)".
 */
export function parseCopyDoc(markdown: string): Map<string, string> {
  const fields = new Map<string, string>();
  const start = markdown.indexOf('## Draft page');
  if (start === -1) return fields;
  const end = markdown.indexOf('\n## ', start + 1);
  const lines = markdown.slice(start, end === -1 ? undefined : end).split('\n');

  let section = '';
  let field = '';
  let quote: string[] = [];

  const set = (key: string, value: string) => {
    // A key that appears twice is reported, not silently overwritten.
    fields.set(fields.has(key) ? `${key} (again)` : key, plain(value));
  };
  const endQuote = () => {
    if (quote.length) set(`${section} / ${field}`, quote.join(' '));
    quote = [];
  };

  for (const line of lines) {
    let m: RegExpExecArray | null;
    if (line.startsWith('>')) {
      quote.push(line.replace(/^>\s?/, ''));
      continue;
    }
    endQuote();
    if ((m = /^### (.+)$/.exec(line))) {
      section = (m[1] ?? '').trim();
      field = 'text';
      set(`${section} / (title)`, section);
    } else if ((m = /^#### (\d+)\s*-\s*(.+)$/.exec(line))) {
      set(`${section} / step ${Number(m[1])} title`, m[2] ?? '');
      field = `step ${Number(m[1])} text`;
    } else if ((m = /^\*\*(.+?):\*\*\s*(.+)$/.exec(line))) {
      set(`${section} / ${(m[1] ?? '').trim()}`, m[2] ?? '');
    } else if ((m = /^\*\*(.+?)\*\*\s*$/.exec(line))) {
      field = (m[1] ?? '').trim();
    }
  }
  endQuote();
  return fields;
}

/**
 * Which content.ts field comes from which copy-document field. Visible text
 * not listed here is deliberately not in the copy document:
 * - meta.description: the link-preview sentence, a Platform addition.
 * - principle.label: "The principle" comes from the Design wireframe.
 * - "Skip to content": the keyboard skip link (FIXED_TEXT in model.ts).
 */
export function fieldMap(copy: PageCopy): [field: string, value: string, docKey: string][] {
  const { hero, why, how, principle, stands, footer, nav } = copy;
  return [
    ['draftBanner', copy.draftBanner, 'Status banner / text'],
    ['nav.wordmark', nav.wordmark, 'Navigation / Wordmark'],
    ['nav.link.label', nav.link.label, 'Navigation / Navigation link'],
    ['hero.eyebrow', hero.eyebrow, 'Hero / Eyebrow'],
    ['hero.headline', hero.headline, 'Hero / Headline'],
    ['hero.supporting', hero.supporting, 'Hero / Supporting copy'],
    ['hero.action.label', hero.action.label, 'Hero / Primary action'],
    [
      'hero.illustration (name and invented label)',
      `${hero.illustration.name} ${INVENTED_LABELS[hero.illustration.invented]}`,
      'Hero / Worked example',
    ],
    ['why.label', why.label, 'Why Sagas exists / (title)'],
    ['why.heading', why.heading, 'Why Sagas exists / Heading'],
    ['why.text', why.text, 'Why Sagas exists / Copy'],
    ['how.label', how.label, 'How it works / Section label'],
    ['how.heading', how.heading, 'How it works / Heading'],
    ...how.steps.flatMap((step, i): [string, string, string][] => [
      [`how.steps[${i}].title`, step.title, `How it works / step ${i + 1} title`],
      [`how.steps[${i}].text`, step.text, `How it works / step ${i + 1} text`],
    ]),
    ['principle.statement', principle.statement, 'Principle / Copy'],
    ['stands.label', stands.label, 'Where Sagas stands / (title)'],
    ['stands.heading', stands.heading, 'Where Sagas stands / Heading'],
    ['stands.text', stands.text, 'Where Sagas stands / Copy'],
    [
      'stands.contact (lead and email)',
      `${stands.contact.lead} ${stands.contact.email}`,
      'Where Sagas stands / Contact',
    ],
    ['footer.wordmark', footer.wordmark, 'Navigation / Wordmark'],
    ['footer.status', footer.status, 'Footer / Status text'],
  ];
}

/**
 * Every difference between the page and the copy document, as sentences a
 * person can act on. Empty means they match.
 */
export function compareCopy(markdown: string, copy: PageCopy): string[] {
  const doc = parseCopyDoc(markdown);
  const problems: string[] = [];
  const used = new Set<string>();

  if (doc.size === 0) {
    return ['LANDING-PAGE-COPY.md has no "## Draft page" section to compare with.'];
  }

  for (const [field, value, docKey] of fieldMap(copy)) {
    used.add(docKey);
    const expected = doc.get(docKey);
    if (expected === undefined) {
      problems.push(
        `${field}: the copy document has no "${docKey}". It was renamed or removed; update fieldMap in copy-doc.ts or content.ts.`,
      );
    } else if (words(expected) !== words(value)) {
      problems.push(
        `${field} is "${value}" in content.ts, but "${docKey}" in the copy document says "${expected}".`,
      );
    }
  }

  for (const [docKey, value] of doc) {
    if (!docKey.endsWith('/ (title)') && !used.has(docKey)) {
      problems.push(
        `The copy document has "${docKey}" ("${value}"), but nothing on the page uses it. Add it to content.ts and fieldMap in copy-doc.ts.`,
      );
    }
  }

  return problems;
}
