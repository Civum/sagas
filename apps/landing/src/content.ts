import type { LandingContent } from './model';

// The landing page's words. The page copy is taken from the Design copy
// document (LANDING-PAGE-COPY.md, story De2), which is the source of truth:
// change the words there first, then here.
//
// Two pieces are Platform additions, not in the copy document, and go to the
// sponsor for review along with it: `meta.description` (the text shown in link
// previews and search results) and the "Skip to content" link in render.ts.
//
// Status stays 'draft' until the sponsor approves the copy. Then set
// `status: 'approved'` with the approval's link and date, and the copy's
// fingerprint from `pnpm --filter @sagas/landing copy-hash`. The tests refuse
// an approved page whose words changed after approval.
//
// Rules (statement of work, "The limits"): no organisation is named, and
// anything invented carries a visible label.

export const content: LandingContent = {
  status: 'draft',
  copy: {
    meta: {
      title: 'Sagas',
      description:
        'Every place has more than one story. Sagas helps people read what is remembered about a place — and see the records, voices, and disagreements that make up the story.',
    },
    draftBanner:
      'Draft — examples on this page are invented and the copy is not approved for public release.',
    nav: {
      wordmark: 'Sagas',
      link: { label: 'Explore the idea', href: '#how' },
    },
    hero: {
      eyebrow: 'A reading product for places',
      headline: 'Every place has more than one story.',
      supporting:
        'Sagas helps people read what is remembered about a place — and see the records, voices, and disagreements that make up the story.',
      action: { label: 'Explore the idea', href: '#how' },
      illustration: { invented: 'illustration' },
    },
    how: {
      id: 'how',
      label: 'How it works',
      heading: 'Read the account. Then check what it rests on.',
      steps: [
        {
          title: 'Start with a place',
          text: 'Find somewhere and begin with what is already known.',
        },
        {
          title: 'Read the story',
          text: 'See what people have said, with each passage connected to the claims beneath it.',
        },
        {
          title: 'Look closer',
          text: 'Follow a phrase back to its records, contributors, and disagreements.',
        },
      ],
    },
    principle: {
      id: 'principle',
      label: 'The principle',
      statement:
        'Nothing is quietly settled. Different accounts stay visible, and every claim has a way back to its source.',
    },
    footer: { wordmark: 'Sagas', status: 'A reading product for places.' },
  },
};
