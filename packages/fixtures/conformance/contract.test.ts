/**
 * Runs the fixture data against the contract.
 *
 * This is the half of conformance that can run today, before either layer
 * exists: it proves the fixtures actually satisfy the shapes in
 * @sagas/contracts, and that every conformance case points at data that really
 * exhibits the situation it claims to.
 *
 * The other half is yours. Import CONFORMANCE_CASES into your own test file,
 * feed each case's state through your renderer or your API, and assert the
 * requirement holds. That is the part that catches your bugs; this part only
 * catches ours.
 */

import { describe, expect, it } from 'vitest';
import { graphState } from '@sagas/contracts';
import { CONFORMANCE_CASES, KNOWN_GAPS, loadAllStates, loadState } from './index';

const states = loadAllStates();

describe('fixtures satisfy the contract', () => {
  it.each(states.map((s) => [s.stateId, s] as const))('%s parses', (_id, state) => {
    expect(() => graphState.parse(state)).not.toThrow();
  });

  it('every claim traces to a contributor present in the state', () => {
    for (const state of states) {
      const known = new Set(state.contributors.map((c) => c.id));
      for (const c of state.claims) expect(known.has(c.claim.contributorId)).toBe(true);
    }
  });

  it('every contributor is flagged fictional', () => {
    for (const state of states) {
      for (const c of state.contributors) expect(c.fictional).toBe(true);
    }
  });

  it('every dispute carries reasoning', () => {
    for (const state of states) {
      for (const c of state.claims) {
        for (const es of c.elementStatuses) {
          for (const d of es.disputes) expect(d.reasoning.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('a dispute targets an element that exists on the claim it targets', () => {
    for (const state of states) {
      for (const c of state.claims) {
        const elementIds = new Set(c.claim.elements.map((e) => e.id));
        for (const es of c.elementStatuses) {
          for (const d of es.disputes) {
            expect(d.targetClaimId).toBe(c.claim.id);
            expect(elementIds.has(d.targetElementId)).toBe(true);
          }
        }
      }
    }
  });

  it('claims awaiting translation keep their original and carry no weight', () => {
    for (const state of states) {
      for (const c of state.claims.filter((c) => c.claim.awaitingTranslation)) {
        expect(c.claim.sourceLanguageText).toBeTruthy();
        expect(c.claim.sourceLanguage).not.toBe('en');
        expect(c.weight).toBe(0);
      }
    }
  });
});

describe('conformance cases point at data that exhibits them', () => {
  it.each(CONFORMANCE_CASES.map((c) => [c.id, c] as const))('%s', (_id, c) => {
    const state = loadState(c.stateId);
    expect(state).toBeTruthy();
    if (c.subject) {
      const subject = state.claims.find((cl) => cl.claim.id === c.subject);
      expect(subject, `${c.subject} not present in ${c.stateId}`).toBeTruthy();
    }
  });

  it('the affirmation-without-independence case really has that shape', () => {
    const boarding = loadState('t1').claims.find((c) => c.claim.id === 'cl-boarding')!;
    expect(boarding.affirmations.length).toBeGreaterThan(0);
    expect(boarding.independentLineageCount).toBe(0);
    expect(boarding.confidence).toBe('single_source');
  });

  it('the granular dispute case leaves other elements alone', () => {
    const boarding = loadState('t2').claims.find((c) => c.claim.id === 'cl-boarding')!;
    const contested = boarding.elementStatuses.filter((e) => e.disputes.length > 0);
    const clean = boarding.elementStatuses.filter((e) => e.disputes.length === 0);
    expect(contested).toHaveLength(1);
    expect(clean.length).toBeGreaterThan(0);
  });

  it('records its own gaps', () => {
    // Not an assertion about correctness — a reminder that this list is short
    // on purpose and that anything on it is currently unspecified behaviour.
    expect(KNOWN_GAPS.length).toBeGreaterThan(0);
  });
});
