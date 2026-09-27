import type { GraphState } from '@sagas/contracts';
import { IntegrityBadge } from './IntegrityBadge';

/** Name, address, and how well documented the place is. */
export function SiteHeader({ state }: { state: GraphState }) {
  return (
    <header>
      <h1>{state.site.name}</h1>
      <p>{state.site.address}</p>
      <IntegrityBadge integrity={state.integrity} />
    </header>
  );
}
