import type { GraphState } from '@sagas/contracts';

/**
 * How the record changed over time.
 *
 * TODO: scrub through it. Each point links to the contributions that caused the
 * change, which is what `eventIdsSincePrevious` is for. That field is the
 * reason snapshots are calculated from a list of contributions rather than
 * written by hand — every state can say exactly what produced it.
 *
 * Fixtures give you four snapshots. Real data is continuous, so don't build
 * anything that assumes there are exactly four.
 */
export function VersionTimeline({ state }: { state: GraphState }) {
  return (
    <div>
      TODO: timeline. {state.eventIdsApplied.length} contributions so far,{' '}
      {state.eventIdsSincePrevious.length} since the last snapshot.
    </div>
  );
}
