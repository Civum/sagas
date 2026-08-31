import type { IntegrityScore } from '@sagas/contracts';

/**
 * How well documented a place is.
 *
 * TODO: the hard part is the low end. A place with three claims and no
 * corroboration scores about 23 out of 100, and it has to read as "thin record,
 * come add to it" rather than "broken" or "bad". That's the state most places
 * will be in for a long time.
 *
 * Conformance case: sparse-site-is-not-empty-site.
 */
export function IntegrityBadge({ integrity }: { integrity: IntegrityScore }) {
  return <span>TODO: integrity {integrity.overall}/100</span>;
}
