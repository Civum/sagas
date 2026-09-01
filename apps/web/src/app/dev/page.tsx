import Link from 'next/link';
import { ACCEPTANCE_CRITERIA } from '@sagas/fixtures/acceptance';
import type { FixtureStateId } from '@/lib/queries';
import { FIXTURE_STATES, getSiteState, listSites } from '@/lib/queries';
import { ArticleView } from '@/features/article/ArticleView';
import { MapView } from '@/features/map/MapView';

/**
 * A sandbox for looking at your components against every fixture state.
 *
 * Pick a state at the top. Everything below re-renders against it. The
 * acceptance criteria that apply to that state are listed underneath, so you can
 * read the requirement and look at the thing at the same time.
 *
 * Use it while you build. A component that looks right on t3 and falls apart on
 * t0 is the normal failure, and t0 is the state most real places sit in.
 *
 * This page has no styling worth keeping and is not a layout suggestion. Change
 * it, add to it, or throw it away once you have something better. If your team
 * adds Storybook, this is the thing it replaces.
 */
export default async function DevPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state: requested } = await searchParams;
  const stateId = (
    FIXTURE_STATES.includes(requested as FixtureStateId) ? requested : 't3'
  ) as FixtureStateId;

  const state = getSiteState(stateId);
  const sites = listSites();
  const cases = ACCEPTANCE_CRITERIA.filter((c) => c.stateId === stateId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8 font-sans">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">Component sandbox</h1>
        <p className="text-sm text-neutral-600">
          Fixture data. Every contributor and event is invented for development.
        </p>
        <nav className="flex gap-2 text-sm">
          {FIXTURE_STATES.map((id) => (
            <Link
              key={id}
              href={`/dev?state=${id}`}
              className={
                id === stateId ? 'rounded border px-2 py-1 font-semibold' : 'rounded border px-2 py-1'
              }
            >
              {id}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-neutral-600">
          {state.claims.length} claim(s) · integrity {state.integrity.overall}/100 ·{' '}
          {state.eventIdsApplied.length} contributions applied
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Map</h2>
        <div className="border p-4">
          <MapView sites={sites} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Article</h2>
        <div className="border p-4">
          <ArticleView state={state} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          What has to be true of {stateId}
        </h2>
        {cases.length === 0 ? (
          <p className="text-sm text-neutral-600">No cases listed for this state.</p>
        ) : (
          <ul className="space-y-3">
            {cases.map((c) => (
              <li key={c.id} className="border-l-2 pl-3 text-sm">
                <div className="font-mono text-xs text-neutral-500">
                  {c.id} · {c.severity}
                  {c.subject ? ` · ${c.subject}` : ''}
                </div>
                <p className="mt-1">{c.situation}</p>
                <p className="mt-1 text-neutral-600">{c.requirement}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-neutral-600">
          The full list, including the situations no fixture covers yet, is in{' '}
          <code>packages/fixtures/README.md</code>.
        </p>
      </section>
    </div>
  );
}
