/**
 * What the integrity badge is not allowed to say, and how its bar behaves.
 *
 * Five properties, each one a way this component could mislead a reader or
 * misdraw without an ordinary test noticing.
 *
 *   1. A sparse record reads as thin rather than as broken.
 *   2. No score anywhere in the range produces language that reads as failure.
 *   3. Every score gets a label and something the reader can do about it.
 *   4. The fill stays inside the bar when the score is out of range.
 *   5. The fill never goes down as the record gets better.
 *
 * The first is pinned to exact copy on purpose, because "Thin record" is the
 * phrase a reader sees. The other four hold whatever the wording is.
 *
 * Rendering is not exercised and does not need to be. The decision lives in a
 * pure function so it can be tested without the markup, and that split is worth
 * copying: pull the decision out of the component, then test the decision.
 */

import { describe, it, expect } from 'vitest';
import { bandFor } from './IntegrityBadge';

describe('bandFor', () => {
  it('calls a sparse record thin, not broken', () => {
    // A low score: a few claims from one family, nothing corroborated. A real
    // place with a thin record. The words matter more than the number.
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
