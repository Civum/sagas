import Link from 'next/link';
import { getSiteState, listSites } from '@/lib/queries';
import { MapView } from '@/features/map/MapView';
import { ArticleView } from '@/features/article/ArticleView';

/**
 * The home page: a map, and the article for a place.
 *
 * This is wired end to end and looks like nothing. That is the starting point,
 * not a suggestion. Both halves are stubs — see the components under
 * src/features for what each one has to become.
 *
 * The split is worth keeping: this page reads data and hands it down, the
 * components take props and do not fetch. That is what lets the same components
 * render on /dev against four different states.
 */
export default function Page() {
  const sites = listSites();
  const state = getSiteState('t3');

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8 font-sans">
      <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
        Fixture data. Every contributor and event below is invented for
        development. Do not show it to anyone as though it were testimony.
      </p>

      <MapView sites={sites} />
      <ArticleView state={state} />

      <p className="text-sm text-neutral-600">
        <Link href="/dev" className="underline">
          /dev
        </Link>{' '}
        renders the same components against every fixture state, with the
        conformance cases for each.
      </p>
    </div>
  );
}
