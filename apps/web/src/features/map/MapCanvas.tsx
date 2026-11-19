'use client';

import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef } from 'react';

import type { MapSearchResult } from './MapSearch';
import type { SiteListEntry, Viewport } from './siteDiscovery';
import { MapSearch } from './MapSearch';
import { siteHref, usableCoordinates } from './siteDiscovery';
import { integrityTreatments, siteIconClass } from './SiteIcon';

interface MapCanvasProps {
  sites: SiteListEntry[];
  visibleSites: SiteListEntry[];
  token: string;
  onViewportChange: (viewport: Viewport | undefined) => void;
  onUnavailable: () => void;
  onSearchSelected: () => void;
}

export function MapCanvas({
  sites,
  visibleSites,
  token,
  onViewportChange,
  onUnavailable,
  onSearchSelected,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>(null);
  const searchMarkerRef = useRef<mapboxgl.Marker>(null);
  const markersRef = useRef(new Map<string, mapboxgl.Marker>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    onViewportChange(undefined);

    const bounds = new mapboxgl.LngLatBounds();
    for (const { site } of sites) {
      const coordinates = usableCoordinates(site);
      if (coordinates) bounds.extend(coordinates);
    }
    if (bounds.isEmpty()) {
      onUnavailable();
      return;
    }

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        accessToken: token,
        container,
        style: 'mapbox://styles/mapbox/light-v11',
        bounds,
        fitBoundsOptions: { padding: 48, maxZoom: 16 },
      });
    } catch {
      onUnavailable();
      return;
    }
    mapRef.current = map;

    // The constructor fits all sites. Only subsequent moves should filter the list.
    map.on('moveend', () => {
      const visible = map.getBounds();
      if (visible) {
        onViewportChange({
          west: visible.getWest(),
          east: visible.getEast(),
          south: visible.getSouth(),
          north: visible.getNorth(),
        });
      }
    });

    let loaded = false;
    map.once('load', () => {
      loaded = true;
    });
    map.on('error', () => {
      if (!loaded && !map.isStyleLoaded()) onUnavailable();
    });

    const markers = markersRef.current;
    for (const { site, integrityLabel } of sites) {
      const coordinates = usableCoordinates(site);
      if (!coordinates) continue;

      const element = document.createElement('a');
      element.href = siteHref(site);
      element.title = `${site.name}: ${integrityLabel}`;
      element.setAttribute(
        'aria-label',
        `View ${site.name}, ${integrityLabel}`,
      );
      element.className = siteIconClass(integrityLabel);
      element.dataset.integritySymbol =
        integrityTreatments[integrityLabel]?.symbol ?? 'W';

      const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
        .setLngLat(coordinates)
        .addTo(map);
      markers.set(site.id, marker);
    }

    return () => {
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;
      mapRef.current = null;
      for (const marker of markers.values()) marker.remove();
      markers.clear();
      map.remove();
    };
  }, [sites, token, onViewportChange, onUnavailable]);

  useEffect(() => {
    const visibleIds = new Set(visibleSites.map(({ site }) => site.id));
    for (const [id, marker] of markersRef.current) {
      marker.getElement().hidden = !visibleIds.has(id);
    }
  }, [sites, token, visibleSites]);

  function showSearchResult({ label, coordinates }: MapSearchResult) {
    const map = mapRef.current;
    if (!map) return;

    searchMarkerRef.current?.remove();
    const marker = new mapboxgl.Marker({ color: '#1d4ed8' })
      .setLngLat(coordinates)
      .addTo(map);
    const element = marker.getElement();
    element.setAttribute('role', 'img');
    element.setAttribute('aria-label', `Map search result: ${label}`);
    element.style.pointerEvents = 'none';
    searchMarkerRef.current = marker;
    onSearchSelected();
    map.jumpTo({ center: coordinates, zoom: 15 });
  }

  return (
    <div className="space-y-2">
      <MapSearch token={token} onSelect={showSearchResult} />
      <div className="overflow-hidden rounded border border-neutral-300 bg-neutral-50">
        <div
          ref={containerRef}
          aria-label="Map showing places"
          className="h-[320px] w-full"
        />
      </div>
    </div>
  );
}
