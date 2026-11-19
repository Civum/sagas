# 0004 · Address and place search

**Date:** 19 November 2026 · **Workstream:** Map and discovery · **Story:** B2 (#11)
**Status:** Proposed — sponsor decision pending

## Current implementation

The map currently uses the Mapbox Search Box API:

- `GET https://api.mapbox.com/search/searchbox/v1/suggest?q=...&session_token=...&access_token=...`
  supplies interactive address/place suggestions.
- `GET https://api.mapbox.com/search/searchbox/v1/retrieve/{mapbox_id}?session_token=...&access_token=...`
  supplies the selected feature and coordinates.

The implementation uses a UUIDv4 session token, groups `/suggest` calls with
the matching `/retrieve`, and keeps the session separate for each concurrent
search.

Official Mapbox sources, reviewed 19 November 2026:

- [Search Box API endpoints and interactive search](https://docs.mapbox.com/api/search/search-box/)
- [Search Box API session billing and limits](https://docs.mapbox.com/api/search/search-box/#session-billing)
- [Mapbox Search pricing](https://www.mapbox.com/pricing#search)
- [Geocoding API temporary/permanent storage](https://docs.mapbox.com/api/search/geocoding/#storing-geocoding-results)
- [Mapbox Terms of Service](https://www.mapbox.com/legal/tos)

## Costs and session rules

The [Search Box API reference](https://docs.mapbox.com/api/search/search-box/#session-billing)
lists 180 seconds for a `/suggest` without a following `/retrieve`. The
[Mapbox pricing page](https://www.mapbox.com/pricing#search) lists 2 minutes
of inactivity and includes up to 50 `/suggest` calls and one `/retrieve`
in a billable session.

The app uses the shorter inactivity limit of 120 seconds, measured from
the latest `/suggest`. A selection after the 50th `/suggest` still uses the
same token for `/retrieve`. A 51st `/suggest` starts a new session.
Concurrent sessions use distinct tokens.

The current pricing page lists introductory preview pricing of 500 free
sessions per month, then $3.00 per 1,000 sessions through 100,000 sessions,
and standard pricing of 2,500 free sessions per month, then $11.50 per 1,000
through 100,000 sessions. The applicable tier depends on the Mapbox account
and is a billing decision, not an implementation assumption.

Search Box API `/category` and `/reverse` are per request rather than per
session. They are not used by the current address-search implementation.

## Retention and storage

Search Box API restrictions say returned data is available only for temporary
use; the implementation does not persist search responses or cache query
results. It keeps only short-lived in-browser state needed to show suggestions
and drop the selected pin.

Mapbox also distinguishes Temporary and Permanent Geocoding API results:
Temporary results cannot be cached, while Permanent results may be cached and
stored indefinitely, subject to a valid card or enterprise contract and
personal/business use restrictions. Search Box API is not identical to
Permanent Geocoding, so this distinction must not be used to grant blanket
storage rights.

## Alternative comparison

Temporary Geocoding v6 (`/search/geocode/v6/forward`) is suitable for a
stand-alone lookup or one-off address search, but it is not the API's
session-based interactive autocomplete flow. It supports `autocomplete=true`
and counts each autocomplete keystroke as a request. The current pricing page
lists 100,000 free temporary geocoding requests per month, then $0.75 per
1,000 through 500,000, $0.60 through 1,000,000, and $0.45 through 5,000,000.
Temporary results cannot be cached.

## Proposed recommendation

**Proposed — sponsor decision pending:** keep Search Box `/suggest` and
`/retrieve` for interactive address autocomplete. It matches the B2 interaction
and gives coordinates after selection. Before deployment, the sponsor should
confirm the account tier, monthly cost exposure, and whether the project's
temporary-only handling is acceptable. Do not persist suggestion or retrieve
results unless an approved product term or Mapbox permanent-storage option
changes this decision.

This is a technical recommendation, not sponsor approval. Contributor tokens
remain individual and local per `SETUP.md`. Any deployed project token and
selected service await sponsor approval.
