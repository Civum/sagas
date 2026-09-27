/**
 * Moved.
 *
 * Data access lives in `@sagas/read-model` now, shared with `apps/ui-api` so the
 * page and the API cannot drift apart about what a site is.
 *
 * This file re-exports it so existing imports keep working. Import from the
 * package directly in anything new.
 */

export * from '@sagas/read-model';
