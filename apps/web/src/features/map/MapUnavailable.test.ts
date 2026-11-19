import { describe, expect, it } from 'vitest';

import type { SiteListEntry } from './siteDiscovery';
import { filterSites } from './siteDiscovery';
import { integrityTreatments, siteIconClass } from './SiteIcon';

const sites: SiteListEntry[] = [
  {
    site: {
      id: '1',
      slug: 'corner-shop',
      name: 'Corner Shop',
      aka: ['the fronton', 'old market'],
      coordinates: [-122.4194, 37.7749],
      address: '72 Market Street',
      city: 'San Francisco',
    },
    integrityLabel: 'Thin record',
    integrityInvitation:
      'A few claims, mostly from one person. More would help.',
  },
  {
    site: {
      id: '2',
      slug: 'river-works',
      name: 'River Works',
      aka: ['the quay'],
      coordinates: [-122.4313, 37.8038],
      address: '18 Water Lane',
      city: 'Oakland',
    },
    integrityLabel: 'Well documented',
    integrityInvitation: 'Corroborated across contributors and source types.',
  },
];

describe('integrity icon treatments', () => {
  it('maps every band to a distinct border treatment and symbol', () => {
    expect(siteIconClass('Thin record')).toContain('dotted');
    expect(siteIconClass('Growing record')).toContain('dashed');
    expect(siteIconClass('Well documented')).toContain('solid');
    expect(siteIconClass('Richly documented')).toContain('double');
    expect(Object.values(integrityTreatments).map(({ symbol }) => symbol)).toEqual([
      'T',
      'G',
      'W',
      'R',
    ]);
  });

  it('provides an accessible description for each mapping', () => {
    expect(integrityTreatments['Thin record']?.description).toContain(
      'Thin record',
    );
    expect(integrityTreatments['Growing record']?.description).toContain(
      'Growing record',
    );
    expect(integrityTreatments['Well documented']?.description).toContain(
      'Well documented',
    );
    expect(integrityTreatments['Richly documented']?.description).toContain(
      'Richly documented',
    );
  });
});

describe('filterSites', () => {
  it('does not match documentation labels', () => {
    const cornerShop = sites[0];
    if (!cornerShop) throw new Error('Missing Corner Shop test entry');
    expect(
      filterSites('g', [{ ...cornerShop, integrityLabel: 'Growing record' }]),
    ).toEqual([]);
  });

  it('matches each letter case-insensitively anywhere in a primary name', () => {
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      const entry = {
        site: {
          id: 'test',
          slug: 'test',
          name: `The ${letter.toUpperCase()} Shop`,
        },
        integrityLabel: 'Thin record',
        integrityInvitation: '',
      };
      expect(filterSites(letter, [entry])).toEqual([entry]);
    }
  });

  it('returns all entries when the query is blank', () => {
    expect(filterSites('', sites)).toHaveLength(2);
  });

  it('matches by site name, aka and address without regard to letter case', () => {
    expect(filterSites('fronton', sites).map(({ site }) => site.slug)).toEqual([
      'corner-shop',
    ]);
    expect(
      filterSites('water lane', sites).map(({ site }) => site.slug),
    ).toEqual(['river-works']);
    expect(
      filterSites('san francisco', sites).map(({ site }) => site.slug),
    ).toEqual(['corner-shop']);
  });
});

describe('viewport filtering', () => {
  const bay = { west: -123, east: -122.42, south: 37, north: 38 };

  it('combines the current area with normalized partial text', () => {
    expect(filterSites('  RiVeR  ', sites, bay)).toEqual([sites[1]]);
    expect(filterSites('market', sites, bay)).toEqual([]);
    expect(filterSites('  WATER   lane ', sites)).toEqual([sites[1]]);
    expect(filterSites('CORNER', sites)).toEqual([sites[0]]);
  });

  it('handles wrapped longitudes, crossing bounds and full-world bounds', () => {
    const south = 37,
      north = 38;
    expect(
      filterSites('', sites, { west: 237, east: 238, south, north }),
    ).toEqual(sites);
    expect(
      filterSites('', sites, { west: 170, east: -120, south, north }),
    ).toEqual(sites);
    expect(
      filterSites('', sites, { west: 170, east: 530, south, north }),
    ).toEqual(sites);
  });

  it('retains searchable places with unavailable coordinates and missing optional search data', () => {
    const entry = sites[0];
    if (!entry) throw new Error('Missing test site');
    const site = { ...entry.site, coordinates: null, address: null, aka: null };

    expect(filterSites('corner', [{ ...entry, site }], bay)).toEqual([
      { ...entry, site },
    ]);
    expect(filterSites('undefined', [{ ...entry, site }])).toEqual([]);
  });
});
