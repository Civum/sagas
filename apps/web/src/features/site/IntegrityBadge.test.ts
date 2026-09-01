/**
 * Tests for the judgment, not for the markup.
 *
 * The rule about what a low score should say is the part with an opinion in it,
 * so it lives in a pure function and gets tested here. Rendering is not
 * exercised, and does not need to be: a test that a div has a class is a test
 * that fails every time somebody improves the design.
 *
 * That split is worth copying. Pull the decision out of the component, test the
 * decision.
 */

import { describe, it, expect } from 'vitest';
import { bandFor } from './IntegrityBadge';

describe('bandFor', () => {
  it('calls a sparse record thin, not broken', () => {
    // 23/100 is the fixture's t0: three claims, one family, no corroboration.
    // A real place with a thin record. The words matter more than the number.
    const band = bandFor(23);
    expect(band.label).toBe('Thin record');
    expect(band.invitation).toMatch(/more/i);
  });

  it('never uses language that reads as failure', () => {
    const forbidden = /poor|bad|fail|incomplete|insufficient|low quality|unverified/i;
    for (let score = 0; score <= 100; score++) {
      const band = bandFor(score);
      expect(band.label, `score ${score}`).not.toMatch(forbidden);
      expect(band.invitation, `score ${score}`).not.toMatch(forbidden);
    }
  });

  it('gives every score a label and something to do about it', () => {
    for (let score = 0; score <= 100; score++) {
      const band = bandFor(score);
      expect(band.label.length, `score ${score}`).toBeGreaterThan(0);
      expect(band.invitation.length, `score ${score}`).toBeGreaterThan(0);
    }
  });

  it('keeps fill inside the bar even when the score is out of range', () => {
    expect(bandFor(-10).fill).toBe(0);
    expect(bandFor(250).fill).toBe(1);
    expect(bandFor(50).fill).toBeCloseTo(0.5);
  });

  it('never goes down as the record gets better', () => {
    let previous = -1;
    for (let score = 0; score <= 100; score++) {
      const { fill } = bandFor(score);
      expect(fill).toBeGreaterThanOrEqual(previous);
      previous = fill;
    }
  });
});
