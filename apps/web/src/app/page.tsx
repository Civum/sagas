import { loadState } from '@sagas/fixtures/conformance';

/**
 * Placeholder. Delete this.
 *
 * It exists to prove the fixture wiring works end to end and to give you
 * something to replace on day one. It is not a design, and nothing about how it
 * looks is a suggestion.
 *
 * Note what it does NOT do, which the conformance cases require and which is
 * your actual work: it flattens competing readings into a count, shows an
 * affirmation total without saying whether those affirmations are independent,
 * and renders an untranslated account as an empty row. All three are wrong.
 * See packages/fixtures/conformance/cases.ts.
 */
export default function Page() {
  const state = loadState('t3');

  return (
    <main className="mx-auto max-w-3xl p-8 font-sans">
      <h1 className="text-2xl font-semibold">{state.site.name}</h1>
      <p className="text-sm text-neutral-500">
        {state.site.address} · fixture state {state.stateId} · integrity{' '}
        {state.integrity.overall}/100
      </p>

      <p className="mt-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
        Fixture data. Every contributor and event below is invented for
        development.
      </p>

      <ul className="mt-6 space-y-4">
        {state.claims.map((c) => (
          <li key={c.claim.id} className="border-t pt-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              {c.confidence} · {c.contributor.displayName} · weight{' '}
              {c.weight.toFixed(2)}
            </div>
            <p className="mt-1">
              {c.claim.awaitingTranslation
                ? c.claim.sourceLanguageText
                : c.claim.text}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
