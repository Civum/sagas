'use client';

import { useCallback, useState } from 'react';

import type { SiteListEntry, Viewport } from './siteDiscovery';
import { MapCanvas } from './MapCanvas';
import { MapUnavailable } from './MapUnavailable';
import { filterSites } from './siteDiscovery';

export function MapDiscovery({
  sites,
  token,
}: {
  sites: SiteListEntry[];
  token?: string;
}) {
  const [query, setQuery] = useState('');
  const [viewport, setViewport] = useState<Viewport>();
  const [areaFilterEnabled, setAreaFilterEnabled] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const markUnavailable = useCallback(() => {
    setUnavailable(true);
    setViewport(undefined);
  }, []);

  const showMap = Boolean(token && !unavailable);
  const activeViewport =
    showMap && areaFilterEnabled ? viewport : undefined;
  const visibleSites = filterSites(query, sites, activeViewport);

  if (sites.length === 0) {
    return (
      <p className="text-sm text-neutral-600">No places in the archive yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {showMap && token && (
        <MapCanvas
          sites={sites}
          visibleSites={visibleSites}
          token={token}
          onViewportChange={setViewport}
          onUnavailable={markUnavailable}
          onSearchSelected={() => setQuery('')}
        />
      )}
      <MapUnavailable
        sites={visibleSites}
        query={query}
        onQueryChange={setQuery}
        areaActive={Boolean(activeViewport)}
        mapAvailable={showMap}
        onShowAllPlaces={() => setAreaFilterEnabled(false)}
        onFilterToMapArea={
          !areaFilterEnabled && viewport
            ? () => setAreaFilterEnabled(true)
            : undefined
        }
      />
    </div>
  );
}
