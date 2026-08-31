import type { Site } from '@sagas/contracts';

/**
 * What the map area shows when there's no Mapbox token.
 *
 * This is NOT a broken state and it should not look like one. Two reasons it
 * has to be good:
 *
 * 1. Anyone can work on the whole app without signing up for anything. Nobody
 *    is blocked waiting on a token.
 * 2. A map alone is unusable with a screen reader. This list is how the same
 *    information reaches someone who can't see the map, so it's part of the
 *    WCAG 2.1 AA requirement rather than a fallback.
 *
 * Build this one properly. It ships either way.
 */
export function MapUnavailable({ sites }: { sites: Site[] }) {
  return (
    <div>
      <p>TODO: list view of {sites.length} place(s). Same data, no map.</p>
    </div>
  );
}
