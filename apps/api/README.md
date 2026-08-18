# apps/api — reserved

Intended home for the tRPC server that exposes claim graph operations.

**Not built yet, deliberately.** This is UofI's deliverable, and there is no
UofI team confirmed for it as of this writing. Scaffolding an API surface for a
team that may not exist would be work with no consumer.

When a team is confirmed, this becomes a workspace package. Until then it is a
directory with a note in it, which is the honest state of things.

Nothing in `apps/web` depends on this. The experience layer builds against
`@sagas/fixtures`, not against a running server — see the root README.
