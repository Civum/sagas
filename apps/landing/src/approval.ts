import { createHash } from 'node:crypto';

import type { LandingContent, PageCopy } from './model';

/**
 * A fingerprint of every word on the page. Two copies with the same
 * fingerprint are word-for-word identical.
 */
export function copyHash(copy: PageCopy): string {
  return createHash('sha256').update(JSON.stringify(copy)).digest('hex');
}

/**
 * Throws unless the content may be published: approved, and unchanged since
 * the approval. A release build calls this, so a draft can never be deployed,
 * whatever the deploy switch says.
 */
export function assertReleasable(content: LandingContent): void {
  if (content.status !== 'approved') {
    throw new Error('Landing page copy is not approved; refusing a release build.');
  }
  if (copyHash(content.copy) !== content.approval.copySha256) {
    throw new Error(
      'Landing page copy changed since it was approved; refusing a release build.',
    );
  }
}
