'use client';

import { useId, useRef } from 'react';
import Link from 'next/link';

import type { SiteListEntry } from './siteDiscovery';
import { siteHref, usableCoordinates } from './siteDiscovery';
import { integrityTreatments, siteIconClass } from './SiteIcon';

function PlacesList({ sites }: { sites: SiteListEntry[] }) {
  return (
    <ul className="divide-y divide-neutral-200">
      {sites.map(({ site, integrityLabel, integrityInvitation }) => {
        const address = [site.address, site.city].filter(Boolean).join(', ');
        const aliases = (site.aka ?? []).filter(Boolean).slice(0, 3).join(', ');

        return (
          <li key={site.id} className="py-3">
            <Link
              href={siteHref(site)}
              className="group flex items-start gap-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
            >
              <span
                aria-hidden="true"
                className={siteIconClass(integrityLabel)}
                data-integrity-symbol={
                  integrityTreatments[integrityLabel]?.symbol ?? 'W'
                }
              />
              <span>
                <span className="text-sm font-medium text-neutral-900 group-hover:underline">
                  {site.name}
                </span>
                {address && (
                  <span className="mt-0.5 block text-xs text-neutral-600">
                    {address}
                  </span>
                )}
                {aliases && (
                  <span className="mt-0.5 block text-xs text-neutral-600">
                    also called {aliases}
                  </span>
                )}
                {!usableCoordinates(site) && (
                  <span className="mt-0.5 block text-xs text-neutral-600">
                    Location unavailable
                  </span>
                )}
                <span className="mt-1 block text-xs font-medium text-neutral-700">
                  {integrityLabel}
                </span>
                <span className="mt-0.5 block text-[11px] text-neutral-600">
                  {integrityInvitation}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

interface MapUnavailableProps {
  sites: SiteListEntry[];
  query: string;
  onQueryChange: (query: string) => void;
  areaActive: boolean;
  mapAvailable: boolean;
  onShowAllPlaces: () => void;
  /** Present only when the area filter is off and the map has an area to apply. */
  onFilterToMapArea?: () => void;
}

/** The accessible site list, shown alongside the map and on its own. */
export function MapUnavailable({
  sites,
  query,
  onQueryChange,
  areaActive,
  mapAvailable,
  onShowAllPlaces,
  onFilterToMapArea,
}: MapUnavailableProps) {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const mainSites = areaActive
    ? sites.filter(({ site }) => usableCoordinates(site))
    : sites;
  const unmappedSites = areaActive
    ? sites.filter(({ site }) => !usableCoordinates(site))
    : [];

  let emptyMessage = 'No places match that search.';
  if (areaActive) {
    emptyMessage = query.trim()
      ? 'No places match that search in the visible map area.'
      : 'No places in the visible map area.';
  }

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium text-neutral-700"
        htmlFor={searchId}
      >
        Filter places
      </label>
      <div className="flex items-center gap-2">
        <input
          ref={searchRef}
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by name, alternate name, or address"
          className="min-w-0 flex-1 rounded border border-neutral-500 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange('');
              searchRef.current?.focus();
            }}
            className="rounded border border-neutral-500 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-neutral-700"
          >
            Clear search
          </button>
        )}
      </div>

      {/* One button that changes its label, so keyboard focus stays on it. */}
      {mapAvailable && (areaActive || onFilterToMapArea) && (
        <div className="flex flex-wrap items-center gap-2 rounded border border-neutral-300 bg-neutral-50 px-3 py-2">
          <p className="flex-1 text-sm text-neutral-700">
            {areaActive
              ? 'Showing places in the visible map area.'
              : 'Showing places anywhere on the map.'}
            {query.trim() && ' The name filter still applies.'}
          </p>
          <button
            type="button"
            onClick={areaActive ? onShowAllPlaces : onFilterToMapArea}
            className="rounded border border-neutral-500 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-neutral-700"
          >
            {areaActive ? 'Show all places' : 'Filter to map area'}
          </button>
        </div>
      )}

      {mainSites.length === 0 && (
        <p role="status" className="text-sm text-neutral-600">
          {emptyMessage}
        </p>
      )}
      {sites.length > 0 && (
        <nav aria-label="Places in the archive">
          {mainSites.length > 0 && <PlacesList sites={mainSites} />}
          {unmappedSites.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-neutral-700">
                Places without map locations
              </h3>
              <PlacesList sites={unmappedSites} />
            </section>
          )}
        </nav>
      )}
    </div>
  );
}
