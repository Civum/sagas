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
  // De4 through De7 copy and design notes are retained here for review, but remain outside
  // `copy` until sponsor approval makes it eligible for release.
  designSteps: {
    De2: {
      status: 'approved',
      approvedOn: '2026-10-19',
      approvalLink:
        'https://github.com/byui-cse397/2026.3FallCSE397PCP_sagasCustomer/issues/11#issuecomment-6278318879',
    },
    De4: {
      status: 'draft',
      copy: {
        id: 'preserve',
        label: 'Where a story belongs',
        heading: 'Sagas helps a story stay connected to a place, while an archive can keep it permanently.',
        text: 'Sagas is built around places, so it can turn up the people, records, and leads connected to a story. If you want material kept permanently, an archive may be the right place to donate it. We plan for contributors to choose what stays public and to be able to take something out of public view.',
      },
    },
    De5: {
      status: 'draft',
      copy: {
        id: 'care',
        label: 'How stories are looked after',
        heading: 'Memories stay visible as memories, with the sources behind them.',
        text: "Sagas is designed to keep each memory connected to its source. When people remember something differently, the different versions stay visible with their own sources. Contributors choose what is public. These are the project's principles, not a promise that moderation or review is already available.",
      },
    },
    De6: {
      status: 'draft',
      copy: {
        id: 'ownership',
        label: 'Who runs the project',
        heading: 'Sagas is a free project, and nothing on it is sold.',
        text: 'Sagas is run by the team building the project as a free public-interest archive. Nothing people contribute is sold. This draft does not name an organization, university, course, or person.',
      },
    },
    De7: {
      status: 'draft',
      copy: {
        id: 'components',
        label: 'Design components',
        heading: 'The map and narrative page should use the same clear building blocks.',
        text: 'The first component set covers the map pin, site list item, narrative header, memory with its source, competing detail versions, and a record showing who brought it. Each component needs empty, loading, long-name, and disagreement states.',
      },
      components: [
        { name: 'Map pin and site list item', states: ['empty', 'loading', 'long name', 'disagreement'] },
        { name: 'Narrative page header', states: ['empty', 'loading', 'long name', 'disagreement'] },
        { name: 'Memory with source', states: ['empty', 'loading', 'long name', 'disagreement'] },
        { name: 'Competing detail versions', states: ['empty', 'loading', 'long name', 'disagreement'] },
        { name: 'Record with contributor', states: ['empty', 'loading', 'long name', 'disagreement'] },
      ],
    },
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
