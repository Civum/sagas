import type { Site } from '@sagas/contracts';
import { MapUnavailable } from './MapUnavailable';

/**
 * The map.
 *
 * TODO: Mapbox GL. Markers styled by integrity score, so a well-documented
 * place looks different from a thin one at a glance. Clustering when markers
 * overlap. A transition into the article view that doesn't feel like a page
 * load.
 *
 * Note what happens with no token: it renders the list instead. Keep that
 * working. See MapUnavailable for why.
 */
export function MapView({ sites }: { sites: Site[] }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) return <MapUnavailable sites={sites} />;

  return <div>TODO: Mapbox map with {sites.length} marker(s).</div>;
}
