import { bandFor } from '@/features/site/IntegrityBadge';

import type { IntegrityScore, Site } from '@sagas/contracts';

import type { SiteListEntry } from './siteDiscovery';
import { MapDiscovery } from './MapDiscovery';

/** One site and its integrity. Pages read the data and components take props. */
export function summariseSite(
  site: Site,
  integrity: IntegrityScore,
): SiteListEntry {
  const band = bandFor(integrity.overall);
  return {
    site,
    integrityLabel: band.label,
    integrityInvitation: band.invitation,
  };
}

export function MapView({ sites }: { sites: SiteListEntry[] }) {
  return (
    <MapDiscovery sites={sites} token={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} />
  );
}
