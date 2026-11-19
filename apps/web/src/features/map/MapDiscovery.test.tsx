// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadWorld } from '@sagas/fixtures/acceptance';

import type { Viewport } from './siteDiscovery';
import { MapDiscovery } from './MapDiscovery';
import { summariseSite } from './MapView';

const mapbox = vi.hoisted(() => ({
  construct: vi.fn(),
  setLngLat: vi.fn(),
  jumpTo: vi.fn(),
  handlers: new Map<string, () => void>(),
  viewport: { west: -180, east: 180, south: -90, north: 90 },
}));

vi.mock('mapbox-gl', () => ({
  default: {
    LngLatBounds: class {
      empty = true;
      extend() {
        this.empty = false;
      }
      isEmpty() {
        return this.empty;
      }
    },
    Map: class {
      container: HTMLElement;
      constructor({ container }: { container: HTMLElement }) {
        mapbox.construct();
        this.container = container;
      }
      on(event: string, callback: () => void) {
        mapbox.handlers.set(event, callback);
      }
      once(event: string, callback: () => void) {
        this.on(event, callback);
      }
      isStyleLoaded() {
        return false;
      }
      jumpTo(options: { center: [number, number]; zoom: number }) {
        mapbox.jumpTo(options);
        const [lng, lat] = options.center;
        mapbox.viewport = {
          west: lng - 0.01,
          east: lng + 0.01,
          south: lat - 0.01,
          north: lat + 0.01,
        };
        mapbox.handlers.get('moveend')?.();
      }
      getBounds() {
        return {
          getWest: () => mapbox.viewport.west,
          getEast: () => mapbox.viewport.east,
          getSouth: () => mapbox.viewport.south,
          getNorth: () => mapbox.viewport.north,
        };
      }
      remove() {
        mapbox.handlers.clear();
      }
    },
    Marker: class {
      element: HTMLElement;
      constructor({
        element = document.createElement('span'),
      }: {
        element?: HTMLElement;
      }) {
        this.element = element;
      }
      getElement() {
        return this.element;
      }
      setLngLat(coordinates: [number, number]) {
        mapbox.setLngLat(coordinates);
        return this;
      }
      addTo(map: { container: HTMLElement }) {
        map.container.append(this.element);
        return this;
      }
      remove() {
        this.element.remove();
      }
    },
  },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const sites = loadWorld('t3').map(({ site, integrity }) =>
  summariseSite(site, integrity),
);
const first = sites.find(({ site }) => site.slug === 'corner-shop');
if (!first) throw new Error('Missing Corner Shop fixture');

let page: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  vi.clearAllMocks();
  page = document.createElement('div');
  document.body.append(page);
  root = createRoot(page);
});

afterEach(() => {
  act(() => root.unmount());
  page.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function show(token?: string, entries = sites) {
  act(() => root.render(<MapDiscovery sites={entries} token={token} />));
}

function search(query: string, field: 'map' | 'archive' = 'archive') {
  const input = [...page.querySelectorAll('input')].find(
    (element) =>
      element.labels?.[0]?.textContent.trim() ===
      (field === 'map'
        ? 'Find an address or place on the map'
        : 'Filter places'),
  );
  if (!input) throw new Error('Missing search field');
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.call(input, query);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return input;
}

function move(viewport: Viewport) {
  mapbox.viewport = viewport;
  act(() => mapbox.handlers.get('moveend')?.());
}

const listed = () =>
  [...page.querySelectorAll('nav a')].map((link) => link.getAttribute('href'));
const pinned = () => [
  ...page.querySelectorAll<HTMLAnchorElement>(
    '[aria-label="Map showing places"] a:not([hidden])',
  ),
];

describe('map discovery', () => {
  it('suggests addresses, drops a result pin, and keeps nearby archive pins available', async () => {
    const coordinates = first.site.coordinates;
    if (!coordinates) throw new Error('Missing Corner Shop coordinates');
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            suggestions: [
              {
                mapbox_id: 'address-id',
                name: 'Main Street',
                place_formatted: 'Boise, Idaho',
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            features: [{ geometry: { coordinates } }],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ suggestions: [] })),
      );
    vi.stubGlobal('fetch', fetchMock);
    show('test-token');
    search('freight depot');
    const input = search('main st', 'map');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    const option = page.querySelector<HTMLButtonElement>(
      'ul[aria-label="Map search suggestions"] button',
    );
    if (!option) throw new Error('Missing address suggestion');
    option.focus();
    expect(document.activeElement).toBe(option);
    await act(() => {
      option.click();
      return Promise.resolve();
    });

    const requestUrls = fetchMock.mock.calls.map(
      ([url]) => new URL(String(url)),
    );
    expect(requestUrls[0]?.searchParams.get('q')).toBe('main st');
    expect(requestUrls[1]?.pathname).toBe(
      '/search/searchbox/v1/retrieve/address-id',
    );
    expect(requestUrls[0]?.searchParams.get('session_token')).toBe(
      requestUrls[1]?.searchParams.get('session_token'),
    );
    expect(mapbox.jumpTo).toHaveBeenCalledWith({
      center: coordinates,
      zoom: 15,
    });
    expect(
      page.querySelector(
        '[role="img"][aria-label="Map search result: Main Street"]',
      ),
    ).not.toBeNull();
    expect(
      pinned().some((pin) => pin.getAttribute('href') === '/sites/corner-shop'),
    ).toBe(true);
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'Pin dropped at Main Street',
    );
    expect(document.activeElement).toBe(input);

    const retrieveToken = requestUrls[1]?.searchParams.get('session_token');
    search('next place', 'map');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const nextToken = new URL(
      String(fetchMock.mock.calls.at(-1)?.[0]),
    ).searchParams.get('session_token');
    expect(nextToken).not.toBe(retrieveToken);
  });

  it('renews Mapbox sessions after explicit clearing', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ suggestions: [] })),
    );
    vi.stubGlobal('fetch', fetchMock);
    show('test-token');

    search('first place', 'map');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const firstToken = new URL(
      String(fetchMock.mock.calls.at(-1)?.[0]),
    ).searchParams.get('session_token');

    search('', 'map');
    search('second place', 'map');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const secondToken = new URL(
      String(fetchMock.mock.calls.at(-1)?.[0]),
    ).searchParams.get('session_token');
    expect(secondToken).not.toBe(firstToken);
  });

  it('renews the Mapbox session for the 51st suggest call', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ suggestions: [] })),
    );
    vi.stubGlobal('fetch', fetchMock);
    show('test-token');

    const tokens: string[] = [];
    for (let index = 0; index < 51; index += 1) {
      search(`place ${index}`, 'map');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      const call: unknown = fetchMock.mock.calls[index]?.[0];
      if (typeof call === 'string') {
        tokens.push(new URL(call).searchParams.get('session_token') ?? '');
      }
    }
    expect(new Set(tokens.slice(0, 50)).size).toBe(1);
    expect(tokens[50]).not.toBe(tokens[49]);
  });

  it('expires Mapbox suggestions and renews the token after 120 seconds of inactivity', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<(url: string) => Promise<Response>>();
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            suggestions: [{ mapbox_id: 'address-id', name: 'Main Street' }],
          }),
        ),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    show('test-token');

    search('time one', 'map');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const beforeExpiry = String(fetchMock.mock.calls.at(-1)?.[0]);
    const option = () =>
      page.querySelector('ul[aria-label="Map search suggestions"] button');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(119_999);
    });
    expect(option()?.textContent).toBe('Main Street');
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(option()).toBeNull();
    search('after inactivity', 'map');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    const afterExpiry = String(fetchMock.mock.calls.at(-1)?.[0]);
    expect(
      new URL(afterExpiry).searchParams.get('session_token'),
    ).not.toBe(new URL(beforeExpiry).searchParams.get('session_token'));
  });

  it('retrieves a selection from the 50th suggest call with the same token', async () => {
    const coordinates = first.site.coordinates;
    if (!coordinates) throw new Error('Missing Corner Shop coordinates');
    vi.useFakeTimers();
    const fetchMock = vi.fn((url: string) => {
      const path = new URL(url).pathname;
      const data = path.endsWith('/suggest')
        ? { suggestions: [{ mapbox_id: 'address-id', name: 'Main Street' }] }
        : { features: [{ geometry: { coordinates } }] };
      return Promise.resolve(new Response(JSON.stringify(data)));
    });
    vi.stubGlobal('fetch', fetchMock);
    show('test-token');

    for (let index = 0; index < 50; index += 1) {
      search(`place ${index}`, 'map');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
    }
    expect(fetchMock).toHaveBeenCalledTimes(50);
    const option = page.querySelector<HTMLButtonElement>(
      'ul[aria-label="Map search suggestions"] button',
    );
    if (!option) throw new Error('Missing address suggestion');
    await act(() => {
      option.click();
      return Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(51);
    const lastSuggest = new URL(String(fetchMock.mock.calls[49]?.[0]));
    const retrieve = new URL(String(fetchMock.mock.calls[50]?.[0]));
    const sessionToken = lastSuggest.searchParams.get('session_token');
    expect(lastSuggest.pathname).toBe('/search/searchbox/v1/suggest');
    expect(sessionToken).toBeTruthy();
    expect(retrieve.pathname).toBe('/search/searchbox/v1/retrieve/address-id');
    expect(retrieve.searchParams.get('session_token')).toBe(sessionToken);
    expect(mapbox.jumpTo).toHaveBeenCalledWith({
      center: coordinates,
      zoom: 15,
    });
  });

  it.each(['t0', 't1', 't2', 't3'] as const)(
    'fits and pins all mapped fixtures at %s',
    (state) => {
      const entries = loadWorld(state).map(({ site, integrity }) =>
        summariseSite(site, integrity),
      );
      show('test-token', entries);
      expect(pinned().map((pin) => pin.getAttribute('href'))).toEqual(listed());
      expect(pinned()).toHaveLength(entries.length);
      expect(mapbox.setLngLat.mock.calls).toEqual(
        entries.map(({ site }) => [site.coordinates]),
      );
    },
  );

  it('combines search and actual map bounds without recreating the map', () => {
    show('test-token');
    const coordinates = first.site.coordinates;
    if (!coordinates) throw new Error('Missing Corner Shop coordinates');
    const [longitude, latitude] = coordinates;
    move({
      west: longitude - 0.001,
      east: longitude + 0.001,
      south: latitude - 0.001,
      north: latitude + 0.001,
    });
    expect(page.textContent).toContain(
      'Showing places in the visible map area.',
    );
    const showAll = [...page.querySelectorAll('button')].find(
      (button) => button.textContent === 'Show all places',
    );
    expect(showAll).not.toBeUndefined();
    expect(listed()).toContain('/sites/corner-shop');
    expect(listed().length).toBeLessThan(sites.length);

    search('freight depot');
    expect(listed()).toEqual([]);
    expect(pinned()).toHaveLength(0);
    expect(page.textContent).toContain(
      'No places match that search in the visible map area.',
    );

    search('corner shop');
    expect(listed()).toEqual(['/sites/corner-shop']);
    expect(pinned()[0]?.getAttribute('href')).toBe('/sites/corner-shop');
    expect(mapbox.construct).toHaveBeenCalledTimes(1);

    showAll?.focus();
    act(() => showAll?.click());
    expect(search('corner shop').value).toBe('corner shop');
    expect(listed()).toEqual(['/sites/corner-shop']);
    expect(page.textContent).not.toContain(
      'Showing places in the visible map area.',
    );
    move({
      west: 0,
      east: 1,
      south: 0,
      north: 1,
    });
    expect(listed()).toEqual(['/sites/corner-shop']);

    const filterArea = [...page.querySelectorAll('button')].find(
      (button) => button.textContent === 'Filter to map area',
    );
    act(() => filterArea?.click());
    expect(page.textContent).toContain(
      'Showing places in the visible map area.',
    );
  });

  it('offers the area filter only when there is an area, applies it at once, and keeps keyboard focus', () => {
    show('test-token');
    const button = (name: string) =>
      [...page.querySelectorAll('button')].find(
        (candidate) => candidate.textContent === name,
      );
    expect(button('Filter to map area')).toBeUndefined();
    expect(button('Show all places')).toBeUndefined();

    const coordinates = first.site.coordinates;
    if (!coordinates) throw new Error('Missing Corner Shop coordinates');
    const [longitude, latitude] = coordinates;
    move({
      west: longitude - 0.001,
      east: longitude + 0.001,
      south: latitude - 0.001,
      north: latitude + 0.001,
    });
    const inArea = listed();
    expect(inArea.length).toBeLessThan(sites.length);

    const toggle = button('Show all places');
    toggle?.focus();
    act(() => toggle?.click());
    expect(listed()).toHaveLength(sites.length);
    expect(document.activeElement?.textContent).toBe('Filter to map area');

    act(() => (document.activeElement as HTMLButtonElement | null)?.click());
    expect(listed()).toEqual(inArea);
    expect(document.activeElement?.textContent).toBe('Show all places');
  });

  it('uses the same fallback illustration and accessible integrity text on markers and list links', () => {
    show('test-token');
    const pin = pinned().find(
      (link) => link.getAttribute('href') === '/sites/corner-shop',
    );
    const link = page.querySelector('nav a[href="/sites/corner-shop"]');
    expect(pin?.getAttribute('aria-label')).toBe(
      `View ${first.site.name}, ${first.integrityLabel}`,
    );
    expect(pin?.className).toBe(
      link?.querySelector('[aria-hidden="true"]')?.className,
    );
    expect(link?.textContent).toContain(first.integrityLabel);
    pin?.focus();
    expect(document.activeElement).toBe(pin);
  });

  it('keeps the no-token list searchable and restores keyboard focus when cleared', () => {
    show();
    expect(mapbox.construct).not.toHaveBeenCalled();
    expect(listed()).toHaveLength(sites.length);
    const input = search('unspecified place');
    expect(input.labels?.[0]?.textContent).toBe('Filter places');
    expect(page.textContent).toContain('No places match that search.');
    const clear = page.querySelector('button');
    clear?.focus();
    expect(document.activeElement).toBe(clear);
    act(() => clear?.click());
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(listed()).toHaveLength(sites.length);
  });

  it('keeps places with unavailable locations discoverable outside the map results', () => {
    const site = { ...first.site, coordinates: null };
    show(
      'test-token',
      sites.map((entry) => (entry === first ? { ...first, site } : entry)),
    );
    move({ west: 0, east: 1, south: 0, north: 1 });
    search('corner shop');
    expect(pinned()).toHaveLength(0);
    expect(listed()).toEqual(['/sites/corner-shop']);
    expect(page.textContent).toContain('Places without map locations');
    expect(page.textContent).toContain('Location unavailable');
  });

  it('restores archive-wide search when the map fails to load', () => {
    show('test-token');
    move({ west: 0, east: 1, south: 0, north: 1 });
    expect(listed()).toHaveLength(0);
    act(() => mapbox.handlers.get('error')?.());
    expect(listed()).toHaveLength(sites.length);
    search('corner shop');
    expect(listed()).toEqual(['/sites/corner-shop']);
    expect(page.querySelector('[aria-label="Map showing places"]')).toBeNull();
  });
});
