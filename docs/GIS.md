# Working with location data

Every layer touches this. The experience layer draws a map and asks what is
near here. The content layer reads coordinates out of photographs. The
intelligence layer asks whether two places are close enough to be related.

None of it is hard. Most of it is unfamiliar, and two of the mistakes below are
silent, which is worse than hard.

---

## The one that will get you

Coordinates in this project are `[longitude, latitude]`.

That is the reverse of how everyone says it out loud. "Forty-three point six
north, one hundred sixteen point two west" is latitude first, and every GPS app
you have used shows it that way.

GeoJSON, PostGIS, and Mapbox all want longitude first. So does the contract:

```ts
coordinates: [-116.20331, 43.61533]   // Boise
coordinates: [43.61533, -116.20331]   // the Indian Ocean, off Somalia
```

Both of those are valid. Neither throws. The second one puts your site in the
sea and the only symptom is a map that looks empty, which reads as a broken
query rather than a swapped pair.

If a marker is missing, check the order first. It is the answer more often than
anything else.

---

## Two kinds of coordinate in PostGIS

PostGIS gives you `geometry` and `geography` and they are not the same thing.

**`geometry`** treats coordinates as points on a flat plane. Fast, and fine for
a small area. Distances come out in degrees, which are not a unit of length:
one degree of longitude is about 111km at the equator and about 79km in Boise,
so "within 0.02 degrees" means something different depending on where you are.

**`geography`** treats them as points on a sphere. Slower, and distances come
out in metres everywhere.

For this project use `geography` with SRID 4326. The archive spans a whole
region, the queries are about real distance, and being able to say "2000" and
mean two kilometres is worth the cost.

```sql
location geography(Point, 4326)
```

SRID 4326 is plain latitude and longitude, the thing GPS produces. You will see
3857 elsewhere; that is the projection web maps use for drawing tiles, not for
storing points.

---

## The query you will write first

"Everything within 2km of here" is not a subtraction problem.

```sql
-- Wrong. Degrees are not metres, and this is a different distance
-- depending on how far north you are.
WHERE abs(lng - $1) < 0.02 AND abs(lat - $2) < 0.02

-- Right, and it can use an index.
WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, 2000)
```

`ST_DWithin` is the one to reach for. Not `ST_Distance(...) < 2000`, which
computes an exact distance for every row in the table before comparing, and
cannot use an index to skip anything.

For the map itself you usually want a bounding box instead, because what you
need is "what is on screen" rather than "what is near a point":

```sql
WHERE location && ST_MakeEnvelope($west, $south, $east, $north, 4326)::geography
```

`&&` is the bounding-box overlap operator. It is cheap and it is index-backed.

---

## Index it or every pan is a table scan

```sql
CREATE INDEX sites_location_idx ON sites USING GIST (location);
```

Without this, every map movement reads every row. With a hundred sites you will
not notice. The point of building it properly is that you do not have to
remember to fix it later.

Check your work with `EXPLAIN ANALYZE`. If you see `Seq Scan` on a spatial
query, the index is not being used, and the usual reason is a type mismatch
between the column and what you passed in.

---

## Precision and accuracy are different things

A photograph's embedded GPS is precise to a few metres and frequently wrong,
because the phone was indoors or across the street. A pin dropped by the
granddaughter of the woman who worked in the building is imprecise and
authoritative.

The contract keeps both the coordinates and how they were arrived at, in
`capturedLocation`: `placed`, `geocoded`, `embedded`, or `inherited`, plus an
optional accuracy in metres.

Do not average them. Do not silently prefer the more precise one. A record's
location and the place it is attached to can disagree, and that disagreement is
information. There is an acceptance case about exactly this, where a photo's
GPS lands in the middle of the street.

How location should actually be captured is an open question, not a settled
one. See `docs/DESIGN-QUESTIONS.md`.

---

## Things you probably do not need

**Routing.** A heritage trail in this project is a curated ordered list of
places, not a computed path between them. You do not need pgRouting and you
almost certainly do not need a directions API.

**Reprojection.** Everything is 4326. If you find yourself converting between
coordinate systems, stop and check why.

**Polygons.** Everything here is a point. Neighbourhood boundaries would be
polygons and they are not in the contract, so if you want them that is a
conversation first.

---

## Where to look when it is wrong

- **Marker in the wrong hemisphere** — coordinate order.
- **Marker in the ocean off Africa** — coordinate order, or a null that became
  `0, 0`.
- **Distances are tiny decimals** — you are on `geometry` and getting degrees.
- **Query is slow** — `EXPLAIN ANALYZE`, look for `Seq Scan`, check the index
  and the types.
- **Map is empty but the query returns rows** — the data is fine, the map is
  not. Check the token and the bounds you handed the map, not the database.
