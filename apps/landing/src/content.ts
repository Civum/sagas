import type { LandingContent } from './model';

// The landing page's words. The page copy is taken from the Design copy
// document (LANDING-PAGE-COPY.md, story De2), which is the source of truth:
// change the words there first, then here.
//
// Two pieces are Platform additions, not in the copy document, and go to the
// sponsor for review along with it: `meta.description` (the text shown in link
// previews and search results) and the "Skip to content" link (FIXED_TEXT in model.ts).
//
// Status stays 'draft' until the sponsor approves the copy. Then set
// `status: 'approved'` with the approval's link and date, and the copy's
// fingerprint from `pnpm --filter @sagas/landing copy-hash`. The tests refuse
// an approved page whose words changed after approval.
//
// Rules (statement of work, "The limits"): no organisation is named, except
// the sponsor's contact address he asked for, and anything invented carries a
// visible label.

export const content: LandingContent = {
  status: 'approved',
  approval: {
    link: 'https://github.com/byui-cse397/2026.3FallCSE397PCP_sagasCustomer/issues/11#issuecomment-6278318879',
    date: '2026-10-19',
    copySha256: '3c870c03dd60b5e1997086526eb81c776c38dd625c5b50731d0e9c5497c908da',
  },
  copy: {
    meta: {
      title: 'Sagas',
      // Platform addition, not yet in the copy document: reuses the hero's
      // supporting line until Design or the sponsor chooses other words.
      description:
        'Buildings outlast the people who remember them. Sagas keeps those stories with the places, like a digital plaque, so someone who comes looking later can still find them.',
    },
    draftBanner:
      'Draft - examples on this page are invented and the copy is not approved for public release.',
    nav: {
      wordmark: 'Sagas',
      link: { label: 'How it works', href: '#how' },
    },
    hero: {
      eyebrow: 'Stories kept with places',
      headline: 'Every place has more than one story.',
      supporting:
        'Buildings outlast the people who remember them. Sagas keeps those stories with the places, like a digital plaque, so someone who comes looking later can still find them.',
      action: { label: 'Why Sagas exists', href: '#why' },
      illustration: { name: 'Corner shop', invented: 'illustration' },
    },
    why: {
      id: 'why',
      label: 'Why Sagas exists',
      heading: 'When people move on, stories can disappear with them.',
      text: 'Sagas keeps the memories connected to a place, so a person who comes looking later can still find them. Every story stays visible with the records and sources that help someone understand where it came from.',
    },
    how: {
      id: 'how',
      label: 'How it works',
      heading: 'Read the story. Then see what stays visible beside it.',
      steps: [
        {
          title: 'Start with a place',
          text: 'Find somewhere and begin with what is already known.',
        },
        {
          title: 'Read the story',
          text: 'See what people have remembered, with its context.',
        },
        {
          title: 'Look closer',
          text: 'Follow a phrase back to records and sources.',
        },
      ],
    },
    principle: {
      id: 'principle',
      label: 'The principle',
      statement:
        'Different stories stay visible. Each one leads back to the records and sources behind it.',
    },
    stands: {
      id: 'stands',
      label: 'Where Sagas stands',
      heading: 'This is an early project, and the site is not open yet.',
      text: 'Sagas is being built by student teams at Idaho universities. We are sharing the idea and the work in progress while we learn from the people who remember these places.',
      // The sponsor's address, at his request (brief in the questions issue,
      // #11). It is the one organisation name the page may show; see
      // content.test.ts.
      contact: {
        lead: 'Questions or thoughts? Write to',
        email: 'info@civum.io',
      },
    },
    footer: { wordmark: 'Sagas', status: 'Early project - not open yet' },
  },
};
