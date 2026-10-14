// The shape of the landing page's words, following the Design wireframe
// (LANDING-PAGE-WIREFRAME.md): identity, hero, how it works, the principle,
// footer. Copy lives in content.ts and layout in render.ts, so changing the
// words never means changing code.

/** Text that has not been written yet starts with this marker. */
export const PLACEHOLDER_MARK = '[Draft:';

/**
 * Kinds of invented material, each with the visible label the Design copy
 * document requires beside it (LANDING-PAGE-COPY.md, "Marking invented
 * material"). Labels are always visible text, never colour or hover alone.
 */
export const INVENTED_LABELS = {
  illustration: 'Illustrative example — invented for this draft',
  passage: 'Invented sample passage — not a real account',
  contributor: 'Invented contributor — not a real person',
} as const;

export type InventedKind = keyof typeof INVENTED_LABELS;

/** A link to a place on this page, e.g. `#how`, until a real route exists. */
export interface Action {
  label: string;
  href: `#${string}`;
}

export interface Step {
  title: string;
  text: string;
}

export interface PageCopy {
  meta: { title: string; description: string };
  /** Shown only while the copy is a draft. */
  draftBanner: string;
  nav: { wordmark: string; link: Action };
  hero: {
    eyebrow: string;
    headline: string;
    supporting: string;
    action: Action;
    /** The illustration is always invented, so it always carries a label. */
    illustration: { invented: InventedKind };
  };
  how: { id: string; label: string; heading: string; steps: Step[] };
  principle: { id: string; label: string; statement: string };
  footer: { wordmark: string; status: string };
}

/**
 * Who approved the copy, where, and exactly which copy. Required before status
 * can be 'approved', so the page that ships can always be traced to the
 * approval it rests on.
 */
export interface Approval {
  /** Link to the sponsor's approval, e.g. a comment in the questions issue. */
  link: string;
  /** ISO date, e.g. 2026-10-23. */
  date: string;
  /**
   * Fingerprint of the copy the sponsor approved, from
   * `pnpm --filter @sagas/landing copy-hash`. If any word changes afterwards,
   * the fingerprint no longer matches and the tests fail until the new
   * wording is approved too.
   */
  copySha256: string;
}

export type LandingContent =
  | { status: 'draft'; approval?: undefined; copy: PageCopy }
  | { status: 'approved'; approval: Approval; copy: PageCopy };
