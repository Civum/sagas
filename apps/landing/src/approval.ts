import { createHash } from 'node:crypto';

import type { LandingContent, PageCopy } from './model';
import { FIXED_TEXT, INVENTED_LABELS } from './model';

/**
 * A fingerprint of every word on the page: the copy, the invented-material
 * label it shows (which lives in model.ts, not in the copy), and the fixed
 * text the layout adds. Two pages with the same fingerprint show word-for-word
 * the same text. The label set and fixed text are parameters only so tests can
 * prove a change to them changes the fingerprint.
 */
export function copyHash(
  copy: PageCopy,
  labels: Record<keyof typeof INVENTED_LABELS, string> = INVENTED_LABELS,
  fixed: Record<keyof typeof FIXED_TEXT, string> = FIXED_TEXT,
): string {
  const visible = {
    copy,
    inventedLabel: labels[copy.hero.illustration.invented],
    fixed,
  };
  return createHash('sha256').update(JSON.stringify(visible)).digest('hex');
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
    throw new Error('Landing page copy changed since it was approved; refusing a release build.');
  }
}
