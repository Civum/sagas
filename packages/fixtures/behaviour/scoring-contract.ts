/**
 * The rules any scoring implementation has to obey.
 *
 * `src/weight.ts` is a placeholder and it gets deleted. This file is what
 * survives it. It says nothing about how to score a claim and everything about
 * what a correct scorer may not do, so it still holds when the arithmetic in
 * there is replaced by something real.
 *
 * These are not suggestions in a document. They are tests that fail.
 *
 * HOW TO USE IT
 *
 * Write your scorer so it matches the `Scorer` interface below, then point this
 * suite at it from your own test file:
 *
 *   import { describe } from 'vitest';
 *   import { runScoringRules } from '@sagas/fixtures/behaviour';
 *   import { myScorer } from '../src/my-scorer';
 *
 *   runScoringRules('my scorer', myScorer);
 *
 * If a rule fails, one of two things is true. Either the scorer is wrong, or
 * the rule is. Both happen. If you think it is the rule, open a pull request
 * against this file with your reasoning rather than editing it in your fork,
 * because every team is held to the same list and a rule that only some teams
 * follow is not a rule.
 *
 * WHY THESE RULES AND NOT OTHERS
 *
 * Every one of them is a way the archive could quietly go wrong while every
 * unit test still passed. A scorer that ranks by family size, or that lets a
 * long-standing contributor outrank a newcomer's better-supported claim, is
 * not buggy in any way a normal test would catch. It just produces an archive
 * that agrees with whoever was already loudest.
 */

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* WHAT A FAILURE MEANS                                                 */
/* ------------------------------------------------------------------ */

/**
 * Every rule below is prefixed, and the prefix says how much weight to give it.
 *
 *   required           This project will not merge a scorer that fails one of
 *                      these. Seven of them, and most are closer to definitions
 *                      of a working function than positions on anything: the
 *                      same input gives the same answer, the output is a real
 *                      number, more disagreement does not raise a score.
 *
 *   open to argument   Something the sponsor currently thinks, written down so
 *                      it is checkable instead of assumed. Three of them. A
 *                      failure might be a bug in your scorer and it might be
 *                      you disagreeing, and disagreeing is a check-in
 *                      conversation rather than a quiet deletion.
 *
 * Worth saying plainly: this suite was drafted before any of it had been tried
 * against a real claim, and nobody here has solved the problem it is
 * circling. Treat it as a starting point rather than a description of how
 * scoring ought to work. The algorithm is yours, and these rules should
 * not be the reason you build something a particular way.
 */

/* WHAT THESE RULES DO NOT COVER                                       */
/* ------------------------------------------------------------------ */

/**
 * Read this before you treat a green run as a sound algorithm.
 *
 * Every rule below is a property of a scalar function over one claim's own
 * inputs. None of them know what an edge is. The graph is untested, and these
 * are the questions nobody here has answered:
 *
 *   Does support travel along extension edges, and how far? Right now a claim
 *   knows how many extensions it has and nothing about how strong they are.
 *
 *   Can a chain of extensions feed back on itself, so that a claim ends up
 *   corroborating itself around a cycle?
 *
 *   Whether a family is the right unit, and how a system with no logins
 *   would ever observe one. `lineageId` is a hand-authored string that nothing
 *   derives. Rules that asserted on it have been removed.
 *
 *   Nothing touches the reference graph at all, which is where "what makes a
 *   place significant" lives in docs/DESIGN-QUESTIONS.md.
 *
 * This is deliberate rather than forgotten. Testing those means fixing what a
 * propagation algorithm looks like: what it takes, what it returns, whether it
 * runs to a fixed point. That is the intelligence layer's design decision,
 * not something a scaffold should make on their behalf.
 *
 * So: bring your propagation model to a check-in once you have one, and we will
 * write the graph rules together. An incomplete suite that looks complete is
 * more dangerous than no suite, which is why this is written down here rather
 * than left for somebody to notice.
 */

import { describe, it, expect } from 'vitest';
import type { Confidence, SourceType } from '@sagas/contracts';
import { loadAllStates } from '../acceptance';

/** What a scorer is allowed to look at. */
export interface ScoringInput {
  sourceType: SourceType;
  /** Distinct family lines backing this, excluding the author's own. */
  independentLineageCount: number;
  /** How many people affirmed. Deliberately separate from the line count above. */
  affirmationCount: number;
  extensionCount: number;
  disputeCount: number;
  sourceTypeDiversity: number;
  awaitingTranslation: boolean;
}

export interface Scorer {
  weight(input: ScoringInput): number;
  confidence(input: {
    independentLineageCount: number;
    disputeCount: number;
    awaitingTranslation: boolean;
  }): Confidence;
}

/**
 * Note what is NOT in `ScoringInput`: an author.
 *
 * No name, no contributor id, no standing, no join date, no institution. What
 * it gets instead are facts derived from who contributed, such as whether three
 * affirmations came from three independent family lines or from one family. The
 * system knows who is speaking. The scorer does not, and cannot use it as a
 * credential.
 *
 * Weight comes from what somebody has done, not from who they are. That is
 * enforced by the missing field rather than by a test.
 *
 * If you find yourself wanting to widen this interface to include the author,
 * stop and read "How do you tell a good source from a bad one?" in
 * docs/DESIGN-QUESTIONS.md. That may still be the right thing to do. It is not
 * a thing to do quietly.
 */

const BASE: ScoringInput = {
  sourceType: 'family_oral',
  independentLineageCount: 0,
  affirmationCount: 0,
  extensionCount: 0,
  disputeCount: 0,
  sourceTypeDiversity: 1,
  awaitingTranslation: false,
};

const withInput = (over: Partial<ScoringInput>): ScoringInput => ({ ...BASE, ...over });

export function runScoringRules(name: string, scorer: Scorer): void {
  describe(`scoring rules — ${name}`, () => {
    /* ---------------------------------------------------------------- */
    /* Sanity                                                            */
    /* ---------------------------------------------------------------- */

    it('required · gives the same answer twice for the same input', () => {
      const input = withInput({ affirmationCount: 3, extensionCount: 1 });
      expect(scorer.weight(input)).toBe(scorer.weight(input));
    });

    it('required · never returns a negative weight, NaN, or Infinity', () => {
      const inputs = [
        BASE,
        withInput({ disputeCount: 50 }),
        withInput({ independentLineageCount: 100, affirmationCount: 100 }),
        withInput({ awaitingTranslation: true }),
      ];
      for (const input of inputs) {
        const w = scorer.weight(input);
        expect(Number.isFinite(w), `weight was ${w}`).toBe(true);
        expect(w).toBeGreaterThanOrEqual(0);
      }
    });

    /* ---------------------------------------------------------------- */
    /* Support never hurts                                               */
    /* ---------------------------------------------------------------- */

    it('required · never lowers a weight because somebody added context', () => {
      const bare = scorer.weight(withInput({ affirmationCount: 1 }));
      const extended = scorer.weight(withInput({ affirmationCount: 1, extensionCount: 2 }));
      expect(extended).toBeGreaterThanOrEqual(bare);
    });

    /* ---------------------------------------------------------------- */
    /* Contested is not the same as wrong                                */
    /* ---------------------------------------------------------------- */

    it('open to argument · keeps a well-supported contested claim above an unsupported quiet one', () => {
      // Disagreement usually means a claim matters. A scorer that buries
      // anything anyone argued with will bury the most important records here.
      const contested = scorer.weight(
        withInput({ affirmationCount: 4, extensionCount: 3, disputeCount: 2, sourceTypeDiversity: 2 }),
      );
      const quiet = scorer.weight(withInput({ affirmationCount: 0, extensionCount: 0 }));
      expect(contested).toBeGreaterThan(quiet);
    });

    it('open to argument · does not drive a corroborated claim to zero with disputes alone', () => {
      const w = scorer.weight(withInput({ affirmationCount: 3, extensionCount: 2, disputeCount: 3 }));
      expect(w).toBeGreaterThan(0);
    });

    /* ---------------------------------------------------------------- */
    /* A claim nobody has rendered yet                                  */
    /* ---------------------------------------------------------------- */

    it('required · holds an unrendered claim outside the ordering, not below it', () => {
      // Weight 0 means "there is nothing yet to compare this against", not
      // "this is worthless". Interfaces are told separately never to sort it
      // off the end of the page.
      expect(scorer.weight(withInput({ awaitingTranslation: true }))).toBe(0);
    });

    it('open to argument · lets a claim into the ordering once somebody renders it', () => {
      const before = withInput({ awaitingTranslation: true, affirmationCount: 1 });
      const after = { ...before, awaitingTranslation: false };
      expect(scorer.weight(before)).toBe(0);
      expect(scorer.weight(after)).toBeGreaterThan(0);
    });

    it('required · does not call an unrendered claim well supported', () => {
      // Nothing can corroborate a claim nobody has read yet.
      const c = scorer.confidence({
        independentLineageCount: 0,
        disputeCount: 0,
        awaitingTranslation: true,
      });
      expect(c).not.toBe('well_corroborated');
    });

    /* ---------------------------------------------------------------- */
    /* More disagreement never helps                                     */
    /* ---------------------------------------------------------------- */

    it('required · never raises a weight because more people disputed the claim', () => {
      let previous = Infinity;
      for (let disputes = 0; disputes <= 5; disputes++) {
        const w = scorer.weight(withInput({ affirmationCount: 3, disputeCount: disputes }));
        expect(w, `weight rose going from ${disputes - 1} disputes to ${disputes}`).toBeLessThanOrEqual(previous);
        previous = w;
      }
    });

    /* ---------------------------------------------------------------- */
    /* Against the real fixture data                                     */
    /*                                                                   */
    /* These run YOUR scorer over the actual claims rather than checking */
    /* the numbers already stored in the fixtures, so they fail when your */
    /* implementation is wrong rather than when ours was.                */
    /* ---------------------------------------------------------------- */

    const realClaims = loadAllStates().flatMap((state) =>
      state.claims.map((c) => ({
        id: `${state.stateId}/${c.claim.id}`,
        input: {
          sourceType: c.claim.sourceType,
          independentLineageCount: c.independentLineageCount,
          affirmationCount: c.affirmations.length,
          extensionCount: c.extensions.length,
          disputeCount: c.elementStatuses.reduce((n, e) => n + e.disputes.length, 0),
          sourceTypeDiversity: 1,
          awaitingTranslation: c.claim.awaitingTranslation,
        } satisfies ScoringInput,
      })),
    );

    it('required · survives every claim shape in the fixtures', () => {
      // Empty element arrays, unrendered claims, claims with no affirmations
      // at all. Real data has holes in it and a scorer must not throw or return
      // nonsense on any of them.
      for (const { id, input } of realClaims) {
        const w = scorer.weight(input);
        expect(Number.isFinite(w), `${id} produced ${w}`).toBe(true);
        expect(w, `${id} produced ${w}`).toBeGreaterThanOrEqual(0);
      }
    });

  });
}
