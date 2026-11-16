import Link from 'next/link';

import { readTermsMarkdown, renderTermsMarkdown } from '@sagas/terms';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Contributor terms · Sagas',
  description: 'The terms for contributing to Sagas.',
};

export default function TermsPage() {
  const termsHtml = renderTermsMarkdown(readTermsMarkdown());

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 font-sans text-neutral-900">
      <p>
        <Link href="/" className="underline">
          Sagas
        </Link>
      </p>
      <article
        className="terms-prose mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: termsHtml }}
      />
    </main>
  );
}
