# Map and discovery wireframe

Open [`map-wireframe.html`](./map-wireframe.html) directly in a browser. It is
a grey-box wireframe for the map and list experience, not a final visual design
or a Mapbox implementation.

## Regions

1. **Orientation and search.** The page explains what can be searched and keeps
   the search field available above both views.
2. **Map.** The geographic overview shows sites as pins. A selected pin exposes
   the place name, address, and a route into its page.
3. **List.** The list contains every visible site in words, so the map never
   becomes the only way to find or compare places.
4. **Sparse-record state.** A place with one contributor and little
   corroboration is described as a thin record, not as an empty or failed one.

## Responsive behavior

- On wide screens, the map and list sit side by side.
- On small screens, the list follows the map and remains reachable without
  using the map.
- Search remains a normal labelled field and is usable from the keyboard.

## Design boundary

The wireframe shows the interaction shape for M1 and the future search work in
M2. It does not choose final map styling, pin artwork, search provider, or
Mapbox behavior. The no-token list path remains a required product path, not an
error state.
