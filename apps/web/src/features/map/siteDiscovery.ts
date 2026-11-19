import type { Site } from '@sagas/contracts';

type DiscoverySite = Pick<Site, 'id' | 'slug' | 'name'> & {
  aka?: Site['aka'] | null;
  address?: Site['address'] | null;
  city?: Site['city'] | null;
  coordinates?: Site['coordinates'] | null;
};

export interface SiteListEntry {
  site: DiscoverySite;
  integrityLabel: string;
  integrityInvitation: string;
}

export interface Viewport {
  west: number;
  east: number;
  south: number;
  north: number;
}

export function siteHref(site: DiscoverySite) {
  return `/sites/${site.slug}`;
}

export function usableCoordinates(
  site: DiscoverySite,
): Site['coordinates'] | undefined {
  const coordinates = site.coordinates;
  if (!coordinates) return;
  const [longitude, latitude] = coordinates;
  if (
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  )
    return coordinates;
}

function inViewport(
  [longitude, latitude]: Site['coordinates'],
  viewport: Viewport,
) {
  const { west, east, south, north } = viewport;
  const offset = (((longitude - west) % 360) + 360) % 360;
  const width = east - west;
  return (
    latitude >= south &&
    latitude <= north &&
    (width >= 360 || offset <= (width < 0 ? width + 360 : width))
  );
}

const normalize = (text: string) =>
  text.trim().replace(/\s+/g, ' ').toLowerCase();

export function filterSites(
  query: string,
  sites: SiteListEntry[],
  viewport?: Viewport,
) {
  const needle = normalize(query);
  return sites.filter(({ site }) => {
    const address = [site.address, site.city].filter(Boolean).join(' ');
    const searchable = [site.name, address, ...(site.aka ?? [])];
    if (
      needle &&
      !searchable.some((field) => normalize(field).includes(needle))
    )
      return false;

    // Keep these results discoverable. The list labels them separately when a viewport is active.
    const coordinates = usableCoordinates(site);
    return !viewport || !coordinates || inViewport(coordinates, viewport);
  });
}
