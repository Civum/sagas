/**
 * What the confidence indicator is not allowed to say.
 *
 * Four properties, each one a way this component could mislead a reader
 * without any ordinary test noticing.
 *
 *   1. Agreement is not corroboration. Twenty people nodding is not evidence
 *      if none of them is an independent source.
 *   2. Support is counted by family line, not by headcount.
 *   3. When everyone who agreed shares a lineage, say so.
 *   4. Silence is not doubt. A claim nobody has engaged with has not been
 *      questioned, it has not been seen.
 *
 * These assert on the wording, not only on the logic behind it. That is
 * deliberate. The phrasing is what a reader actually sees, so a copy change
 * that breaks one of these should fail here rather than ship.
 */

import { describe, it, expect } from 'vitest';
import { supportSummary } from './ConfidenceIndicator';

describe('supportSummary', () => {
  it('says so when everyone who agreed is from the same family', () => {
    // Zero independent lines, one affirmation. This is the shape of a claim
    // backed only by the contributor's own relatives.
    const summary = supportSummary(0, 1);
    expect(summary).toMatch(/same family/i);
  });

  it('never reports agreement as corroboration when nobody independent spoke', () => {
    for (let affirmations = 1; affirmations <= 20; affirmations++) {
      const summary = supportSummary(0, affirmations);
      expect(summary, `${affirmations} affirmations`).not.toMatch(/backed by|corroborat/i);
    }
  });

  it('counts families rather than people when there is real support', () => {
    expect(supportSummary(1, 4)).toMatch(/1 other family/);
    expect(supportSummary(3, 3)).toMatch(/3 other families/);
  });

  it('is honest about silence rather than treating it as doubt', () => {
    const summary = supportSummary(0, 0);
    expect(summary).toMatch(/yet/i);
    expect(summary).not.toMatch(/doubt|unverified|questionable/i);
  });
});
