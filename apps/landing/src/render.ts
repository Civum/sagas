import type { Action, LandingContent, PageCopy } from './model';
import { INVENTED_LABELS } from './model';

// Turns the content into one static HTML page, following the Design wireframe
// (LANDING-PAGE-WIREFRAME.md). No JavaScript is sent to the browser.
//
// Layout notes from the wireframe: headings in a serif, body in a sans-serif;
// the hero and the steps stack into one column below 560px.

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text so copy can never inject markup into the page. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

const e = escapeHtml;

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
const LABEL = 'text-xs font-semibold uppercase tracking-widest text-muted-foreground';

function link(action: Action, classes: string): string {
  return `<a href="${e(action.href)}" class="${classes} ${FOCUS}">${e(action.label)}</a>`;
}

/**
 * An abstract picture of the idea: two readings side by side, each leading
 * back to records. Deliberately abstract: no words, places or people, so it
 * cannot be mistaken for real material. Still labelled as invented.
 */
const ILLUSTRATION_SVG = `<svg viewBox="0 0 240 180" aria-hidden="true" focusable="false" class="h-auto w-full text-muted-foreground">
      <g fill="none" stroke="currentColor" stroke-width="2">
        <rect x="16" y="16" width="96" height="88" rx="6" class="fill-card"/>
        <rect x="128" y="16" width="96" height="88" rx="6" class="fill-card"/>
        <path d="M30 40h68M30 56h56M30 72h62M142 40h68M142 56h48M142 72h60" stroke-linecap="round"/>
        <path d="M64 104v28M64 132h-24v14M64 132h24v14M176 104v42" />
      </g>
      <g fill="currentColor">
        <rect x="30" y="146" width="20" height="20" rx="3"/>
        <rect x="78" y="146" width="20" height="20" rx="3"/>
        <rect x="166" y="146" width="20" height="20" rx="3"/>
      </g>
    </svg>`;

function header(copy: PageCopy): string {
  return `<header class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-6 sm:px-6">
  <p class="font-serif text-xl font-semibold">${e(copy.nav.wordmark)}</p>
  <nav aria-label="Main">
    ${link(copy.nav.link, 'rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted')}
  </nav>
</header>`;
}

function hero(copy: PageCopy): string {
  const { hero: h } = copy;
  return `<section aria-labelledby="hero-h" class="grid items-center gap-8 py-12 min-[560px]:grid-cols-[1.2fr_0.8fr] sm:py-20">
  <div>
    <p class="${LABEL}">${e(h.eyebrow)}</p>
    <h1 id="hero-h" class="mt-3 max-w-[14ch] font-serif text-4xl font-medium leading-tight sm:text-6xl">${e(h.headline)}</h1>
    <p class="mt-5 max-w-[42ch] text-lg leading-relaxed text-muted-foreground">${e(h.supporting)}</p>
    <p class="mt-7">${link(h.action, 'inline-block rounded-full bg-foreground px-6 py-3 font-medium text-background hover:opacity-90')}</p>
  </div>
  <figure class="rounded-lg border border-border bg-muted p-6">
    ${ILLUSTRATION_SVG}
    <figcaption data-invented="${h.illustration.invented}" class="mt-4 text-center text-sm text-muted-foreground">${e(INVENTED_LABELS[h.illustration.invented])}</figcaption>
  </figure>
</section>`;
}

function how(copy: PageCopy): string {
  const { how: s } = copy;
  const id = e(s.id);
  return `<section id="${id}" aria-labelledby="${id}-h" class="border-t border-border py-14">
  <p class="${LABEL}">${e(s.label)}</p>
  <h2 id="${id}-h" class="mt-3 max-w-[25ch] font-serif text-3xl font-medium leading-snug">${e(s.heading)}</h2>
  <ol class="mt-8 grid gap-4 min-[560px]:grid-cols-3">
    ${s.steps
      .map(
        (step, i) => `<li class="rounded-lg border border-border bg-muted p-5">
      <p class="${LABEL}" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
      <h3 class="mt-5 font-serif text-xl font-medium">${e(step.title)}</h3>
      <p class="mt-2 text-muted-foreground">${e(step.text)}</p>
    </li>`,
      )
      .join('\n    ')}
  </ol>
</section>`;
}

function principle(copy: PageCopy): string {
  const { principle: p } = copy;
  const id = e(p.id);
  return `<section id="${id}" aria-labelledby="${id}-h" class="mb-14 rounded-lg bg-muted px-6 py-10 sm:px-10">
  <h2 id="${id}-h" class="${LABEL}">${e(p.label)}</h2>
  <p class="mt-4 max-w-[31ch] font-serif text-2xl font-medium leading-snug sm:text-3xl">${e(p.statement)}</p>
</section>`;
}

function footer(copy: PageCopy): string {
  return `<footer class="mx-auto max-w-5xl px-4 sm:px-6">
  <div class="flex flex-wrap justify-between gap-3 border-t border-border py-8 text-sm text-muted-foreground">
    <p class="font-semibold text-foreground">${e(copy.footer.wordmark)}</p>
    <p>${e(copy.footer.status)}</p>
  </div>
</footer>`;
}

export function renderPage(content: LandingContent): string {
  const { copy } = content;
  const isDraft = content.status === 'draft';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(copy.meta.title)}</title>
  <meta name="description" content="${e(copy.meta.description)}">
  ${isDraft ? '<meta name="robots" content="noindex, nofollow">' : ''}
  <link rel="stylesheet" href="/styles.css">
</head>
<body class="bg-background font-sans text-foreground antialiased">
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-background focus:px-3 focus:py-2 ${FOCUS}">Skip to content</a>
  ${isDraft ? `<div role="note" data-draft-banner class="bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground">${e(copy.draftBanner)}</div>` : ''}
  ${header(copy)}
  <main id="main" class="mx-auto max-w-5xl px-4 sm:px-6">
    ${hero(copy)}
    ${how(copy)}
    ${principle(copy)}
  </main>
  ${footer(copy)}
</body>
</html>
`;
}
