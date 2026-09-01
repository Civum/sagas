/**
 * The one rule this layer must not break.
 *
 * An affirmation is not corroboration. These tests exist so that a well-meaning
 * change to the wording cannot quietly start presenting agreement as evidence.
 */

import { describe, it, expect } from 'vitest';
import { supportSummary } from './ConfidenceIndicator';

describe('supportSummary', () => {
  it('says so when everyone who agreed is from the same family', () => {
    // cl-boarding at t1: one affirmation, zero independent lines.
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
