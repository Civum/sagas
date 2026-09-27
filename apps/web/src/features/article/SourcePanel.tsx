import type { ClaimState } from '@sagas/contracts';

/**
 * Who said this and how they know.
 *
 * TODO: name, when, how they came to know it, and a way through to the original
 * submission. Attribution is never optional and never anonymous here, so every
 * view that shows claim text needs a route to this.
 *
 * While the data is fixtures, every contributor carries `fictional: true`.
 * Surface that. Nobody should be able to screenshot development data and have
 * it read as a real person's testimony.
 *
 * Acceptance criterion: every-claim-traces-to-a-contributor.
 */
export function SourcePanel({ claim }: { claim: ClaimState }) {
  return (
    <div>
      TODO: {claim.contributor.displayName}, {claim.claim.sourceType}
      {claim.contributor.fictional ? ' (invented, development data)' : ''}
    </div>
  );
}
