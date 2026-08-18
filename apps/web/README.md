# apps/web — the experience layer

This is yours. It ships close to empty on purpose.

The design system, the component library, the map integration, the living
article renderer, heritage trails, badges, and the contributor dashboard are all
your scope. The scaffold deliberately does not include design tokens or a
component library — handing those over would remove the most interesting work in
the project.

What you get instead: a working Next + TypeScript + Tailwind setup, the fixture
data, and a contract to build against.

## Where the data comes from

```ts
import { loadState, CONFORMANCE_CASES } from '@sagas/fixtures/conformance';

const state = loadState('t3'); // 't0' | 't1' | 't2' | 't3'
```

There is no synthesis API this semester. `loadState` reads a derived graph state
off disk. That is the whole data layer, and it is enough to build every view in
your scope. If you find yourself wanting to fetch narrative state over a
network, stop and bring it to a sync — it means the contract is missing
something, which is useful to know.

## Before you consider a view done

Read `packages/fixtures/conformance/cases.ts`. Each case is a situation the
record can be in and what your interface has to do about it. They are the
awkward ones on purpose. A view that handles t3 beautifully and falls over on
t0 is not done.
